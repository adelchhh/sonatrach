<?php

namespace App\Http\Controllers;

use App\Models\WithdrawalRequest;
use App\Models\Registration;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WithdrawalController extends Controller
{
    private array $allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'];

    /**
     * Admin: list all withdrawal requests with employee + activity context.
     */
    public function index(Request $request)
    {
        $q = DB::table('withdrawal_requests as w')
            ->join('registrations as r', 'r.id', '=', 'w.registration_id')
            ->join('users as u', 'u.id', '=', 'r.user_id')
            ->join('activity_sessions as s', 's.id', '=', 'r.session_id')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->leftJoin('users as p', 'p.id', '=', 'w.processed_by')
            ->select(
                'w.id',
                'w.registration_id',
                'w.requested_at',
                'w.reason',
                'w.status',
                'w.processed_at',
                'w.admin_comment',
                'r.status as registration_status',
                'u.first_name as user_first_name',
                'u.name as user_last_name',
                'u.employee_number',
                'u.email as user_email',
                'a.title as activity_title',
                'a.category as activity_category',
                's.id as session_id',
                's.start_date',
                's.end_date',
                'p.first_name as processor_first_name',
                'p.name as processor_last_name'
            );

        if ($status = $request->query('status')) {
            $q->where('w.status', strtoupper($status));
        }
        if ($search = $request->query('search')) {
            $like = '%' . $search . '%';
            $q->where(function ($qb) use ($like) {
                $qb->where('u.employee_number', 'like', $like)
                   ->orWhere('u.name', 'like', $like)
                   ->orWhere('u.first_name', 'like', $like)
                   ->orWhere('a.title', 'like', $like);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $q->orderBy('w.requested_at', 'desc')->get(),
        ]);
    }

    /**
     * Employee: create a withdrawal request for one of their registrations.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'registration_id' => ['required', 'integer', 'exists:registrations,id'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $alreadyExists = WithdrawalRequest::where('registration_id', $data['registration_id'])
            ->whereIn('status', ['PENDING', 'APPROVED'])
            ->exists();

        if ($alreadyExists) {
            return response()->json([
                'success' => false,
                'message' => 'A pending withdrawal already exists for this registration.',
            ], 409);
        }

        $w = WithdrawalRequest::create([
            'registration_id' => $data['registration_id'],
            'requested_at' => now(),
            'reason' => $data['reason'] ?? null,
            'status' => 'PENDING',
        ]);

        return response()->json(['success' => true, 'data' => $w], 201);
    }

    /**
     * Admin: approve, reject or mark as processed.
     *
     * When a SELECTED registration is approved for withdrawal, the system
     * automatically promotes the substitute with rank 1 (if any) to fill
     * the freed slot. The remaining substitutes shift up by one rank.
     */
    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:' . implode(',', $this->allowedStatuses)],
            'admin_comment' => ['nullable', 'string', 'max:255'],
            'processed_by' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $w = WithdrawalRequest::findOrFail($id);

        // Track promotion outside the transaction so we can notify after commit
        $promotedRegId = null;
        $promotedUserId = null;
        $promotedSiteName = null;
        $activityTitle = null;

        DB::transaction(function () use ($w, $data, &$promotedRegId, &$promotedUserId, &$promotedSiteName, &$activityTitle) {
            $w->status = $data['status'];
            $w->admin_comment = $data['admin_comment'] ?? null;
            $w->processed_by = $data['processed_by'] ?? null;
            $w->processed_at = now();
            $w->save();

            // If approved or processed, move the registration into WITHDRAWN
            if (!in_array($data['status'], ['APPROVED', 'PROCESSED'])) {
                return;
            }

            $registration = Registration::find($w->registration_id);
            if (!$registration || $registration->status === 'WITHDRAWN') {
                return;
            }

            $wasSelected = $registration->status === 'SELECTED' || $registration->status === 'CONFIRMED';
            $oldStatus = $registration->status;
            $registration->status = 'WITHDRAWN';
            $registration->withdrawn_at = now();
            $registration->withdrawal_reason = $w->reason;
            $registration->save();

            DB::table('registration_status_history')->insert([
                'registration_id' => $registration->id,
                'old_status' => $oldStatus,
                'new_status' => 'WITHDRAWN',
                'reason' => 'Withdrawal request approved',
                'changed_at' => now(),
            ]);

            // ─── SUBSTITUTE AUTO-PROMOTION ───
            // Only kick in when the withdrawn registration was actually a
            // selected winner of a draw. We free their seat and promote the
            // substitute with rank 1, then shift remaining ranks up.
            if (!$wasSelected) {
                return;
            }

            // Find the latest executed draw on this session and the freed seat
            $draw = DB::table('draws')
                ->where('session_id', $registration->session_id)
                ->where('executed', 1)
                ->orderByDesc('draw_id')
                ->first();

            if (!$draw) return;

            $withdrawnResult = DB::table('draw_results')
                ->where('draw_id', $draw->draw_id)
                ->where('registration_id', $registration->id)
                ->first();

            if (!$withdrawnResult || !$withdrawnResult->session_site_id) return;

            $freedSiteId = $withdrawnResult->session_site_id;

            // Promote substitute rank 1
            $nextSub = DB::table('draw_results')
                ->where('draw_id', $draw->draw_id)
                ->where('is_substitute', 1)
                ->where('substitute_rank', 1)
                ->first();

            if (!$nextSub) return;

            // Update their draw_result: substitute → selected, assign the freed seat
            DB::table('draw_results')
                ->where('id', $nextSub->id)
                ->update([
                    'is_selected' => 1,
                    'is_substitute' => 0,
                    'session_site_id' => $freedSiteId,
                    'substitute_rank' => null,
                    'updated_at' => now(),
                ]);

            // Mark the withdrawn one's result as un-selected too
            DB::table('draw_results')
                ->where('id', $withdrawnResult->id)
                ->update([
                    'is_selected' => 0,
                    'session_site_id' => null,
                    'updated_at' => now(),
                ]);

            // Shift remaining substitute ranks up by 1 (rank 2 → 1, 3 → 2, etc.)
            DB::table('draw_results')
                ->where('draw_id', $draw->draw_id)
                ->where('is_substitute', 1)
                ->where('substitute_rank', '>', 1)
                ->update([
                    'substitute_rank' => DB::raw('substitute_rank - 1'),
                    'updated_at' => now(),
                ]);

            // Update the promoted registration's status
            $promotedReg = Registration::find($nextSub->registration_id);
            if ($promotedReg) {
                $oldRegStatus = $promotedReg->status;
                $promotedReg->status = 'SELECTED';
                $promotedReg->save();

                DB::table('registration_status_history')->insert([
                    'registration_id' => $promotedReg->id,
                    'old_status' => $oldRegStatus,
                    'new_status' => 'SELECTED',
                    'reason' => 'Auto-promoted from substitute (withdrawal of reg #' . $registration->id . ')',
                    'changed_at' => now(),
                ]);

                $promotedRegId = $promotedReg->id;
                $promotedUserId = $promotedReg->user_id;
            }

            $promotedSiteName = DB::table('session_sites as ss')
                ->join('sites as s', 's.id', '=', 'ss.site_id')
                ->where('ss.id', $freedSiteId)
                ->value('s.name');

            $activityTitle = DB::table('activity_sessions as sess')
                ->join('activities as a', 'a.id', '=', 'sess.activity_id')
                ->where('sess.id', $registration->session_id)
                ->value('a.title');
        });

        // Audit log
        AuditLogger::log(
            $data['processed_by'] ?? null,
            'WITHDRAWAL_' . $data['status'],
            'withdrawal_requests',
            $w->id,
            'Withdrawal #' . $w->id,
            [
                'admin_comment' => $data['admin_comment'] ?? null,
                'reason' => $w->reason,
                'promoted_registration_id' => $promotedRegId,
            ],
            $request
        );

        // Notify the employee whose withdrawal was processed
        $reg = DB::table('registrations')->where('id', $w->registration_id)->first();
        if ($reg) {
            $msgs = [
                'APPROVED' => "Your withdrawal request was approved. Your registration is now withdrawn.",
                'REJECTED' => "Your withdrawal request was rejected." . ($data['admin_comment'] ? " Comment: " . $data['admin_comment'] : ''),
                'PROCESSED' => "Your withdrawal has been fully processed.",
                'PENDING' => "Your withdrawal request is being reviewed.",
            ];
            NotificationService::push(
                $reg->user_id,
                $msgs[$data['status']] ?? "Your withdrawal status changed to {$data['status']}.",
                'WITHDRAWAL',
                'Withdrawal update',
                null,
                $reg->session_id
            );
        }

        // Notify the auto-promoted substitute, if any
        if ($promotedUserId) {
            $siteSuffix = $promotedSiteName ? " · Site: {$promotedSiteName}" : '';
            $activityPrefix = $activityTitle ? "{$activityTitle} — " : '';
            NotificationService::push(
                $promotedUserId,
                $activityPrefix . "Vous avez été promu de substitut à sélectionné suite au retrait d'un participant." . $siteSuffix,
                'DRAW',
                'Promotion automatique',
                null,
                $reg->session_id ?? null
            );

            AuditLogger::log(
                $data['processed_by'] ?? null,
                'SUBSTITUTE_PROMOTED',
                'registrations',
                $promotedRegId,
                'Registration #' . $promotedRegId . ' promoted',
                [
                    'triggered_by_withdrawal_id' => $w->id,
                    'freed_session_site_id' => $promotedSiteName,
                ],
                $request
            );
        }

        return response()->json([
            'success' => true,
            'data' => $w->fresh(),
            'auto_promotion' => $promotedRegId ? [
                'registration_id' => $promotedRegId,
                'site_name' => $promotedSiteName,
            ] : null,
        ]);
    }
}
