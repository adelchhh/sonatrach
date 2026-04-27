<?php

namespace App\Http\Controllers;

use App\Models\WithdrawalRequest;
use App\Models\Registration;
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
     */
    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:' . implode(',', $this->allowedStatuses)],
            'admin_comment' => ['nullable', 'string', 'max:255'],
            'processed_by' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $w = WithdrawalRequest::findOrFail($id);

        DB::transaction(function () use ($w, $data) {
            $w->status = $data['status'];
            $w->admin_comment = $data['admin_comment'] ?? null;
            $w->processed_by = $data['processed_by'] ?? null;
            $w->processed_at = now();
            $w->save();

            // If approved or processed, move the registration into WITHDRAWN
            if (in_array($data['status'], ['APPROVED', 'PROCESSED'])) {
                $registration = Registration::find($w->registration_id);
                if ($registration && $registration->status !== 'WITHDRAWN') {
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
                }
            }
        });

        return response()->json(['success' => true, 'data' => $w->fresh()]);
    }
}
