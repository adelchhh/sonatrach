<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RegistrationController extends Controller
{
    private array $allowedStatuses = [
        'PENDING', 'VALIDATED', 'REJECTED', 'SELECTED',
        'WAITING_LIST', 'CONFIRMED', 'WITHDRAWN', 'CANCELLED',
    ];

    /**
     * Admin: list all registrations with filters.
     * Query params: status, activity_id, session_id, search (matricule or name).
     */
    public function index(Request $request)
    {
        $q = DB::table('registrations as r')
            ->join('users as u', 'u.id', '=', 'r.user_id')
            ->join('activity_sessions as s', 's.id', '=', 'r.session_id')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->leftJoin('documents as d', 'd.registration_id', '=', 'r.id')
            ->whereNull('r.deleted_at')
            ->select(
                'r.id',
                'r.user_id',
                'r.session_id',
                'r.status',
                'r.is_eligible',
                'r.rejection_reason',
                'r.confirmed_at',
                'r.withdrawn_at',
                'r.registered_at',
                'r.reference_number',
                'u.name as user_last_name',
                'u.first_name as user_first_name',
                'u.employee_number',
                'u.email as user_email',
                'a.id as activity_id',
                'a.title as activity_title',
                'a.category as activity_category',
                'a.draw_enabled',
                's.start_date',
                's.end_date',
                's.status as session_status',
                DB::raw('COUNT(DISTINCT d.document_id) AS documents_count'),
                DB::raw("SUM(CASE WHEN d.status = 'VALIDATED' THEN 1 ELSE 0 END) AS documents_validated_count")
            )
            ->groupBy(
                'r.id', 'r.user_id', 'r.session_id', 'r.status', 'r.is_eligible',
                'r.rejection_reason', 'r.confirmed_at', 'r.withdrawn_at',
                'r.registered_at', 'r.reference_number',
                'u.name', 'u.first_name', 'u.employee_number', 'u.email',
                'a.id', 'a.title', 'a.category', 'a.draw_enabled',
                's.start_date', 's.end_date', 's.status'
            );

        if ($status = $request->query('status')) {
            $q->where('r.status', strtoupper($status));
        }
        if ($activityId = $request->query('activity_id')) {
            $q->where('a.id', $activityId);
        }
        if ($sessionId = $request->query('session_id')) {
            $q->where('s.id', $sessionId);
        }
        if ($search = $request->query('search')) {
            $like = '%' . $search . '%';
            $q->where(function ($qb) use ($like) {
                $qb->where('u.employee_number', 'like', $like)
                   ->orWhere('u.name', 'like', $like)
                   ->orWhere('u.first_name', 'like', $like)
                   ->orWhere('u.email', 'like', $like)
                   ->orWhere('r.reference_number', 'like', $like);
            });
        }

        $rows = $q->orderBy('r.registered_at', 'desc')->get();

        return response()->json(['success' => true, 'data' => $rows]);
    }

    public function show($id)
    {
        $registration = DB::table('registrations as r')
            ->join('users as u', 'u.id', '=', 'r.user_id')
            ->join('activity_sessions as s', 's.id', '=', 'r.session_id')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->where('r.id', $id)
            ->whereNull('r.deleted_at')
            ->select(
                'r.*',
                'u.name as user_last_name',
                'u.first_name as user_first_name',
                'u.employee_number',
                'u.email as user_email',
                'u.address as user_address',
                'a.id as activity_id',
                'a.title as activity_title',
                'a.category as activity_category',
                's.start_date',
                's.end_date',
                's.draw_date',
                's.draw_location',
                's.status as session_status'
            )
            ->first();

        if (!$registration) {
            return response()->json(['success' => false, 'message' => 'Registration not found'], 404);
        }

        $choices = DB::table('site_choices as sc')
            ->join('session_sites as ss', 'ss.id', '=', 'sc.session_site_id')
            ->join('sites', 'sites.id', '=', 'ss.site_id')
            ->where('sc.registration_id', $id)
            ->select(
                'sc.id', 'sc.choice_order',
                'ss.id as session_site_id', 'ss.quota',
                'sites.id as site_id', 'sites.name as site_name'
            )
            ->orderBy('sc.choice_order')
            ->get();

        $documents = DB::table('documents')
            ->where('registration_id', $id)
            ->orderBy('uploaded_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'registration' => $registration,
                'choices' => $choices,
                'documents' => $documents,
            ],
        ]);
    }

    /**
     * Validate the registration (admin-side eligibility approval).
     */
    public function validateRegistration($id)
    {
        return $this->changeStatus($id, 'VALIDATED', null);
    }

    /**
     * Reject the registration with a reason.
     */
    public function reject(Request $request, $id)
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
        ]);

        return $this->changeStatus($id, 'REJECTED', $data['reason']);
    }

    /**
     * Generic status change endpoint (admin override).
     */
    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:' . implode(',', $this->allowedStatuses)],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        return $this->changeStatus($id, $data['status'], $data['reason'] ?? null);
    }

    private function changeStatus($id, string $newStatus, ?string $reason)
    {
        $registration = Registration::findOrFail($id);
        $oldStatus = $registration->status;

        if ($oldStatus === $newStatus) {
            return response()->json([
                'success' => true,
                'data' => $registration->fresh(),
                'message' => 'Status unchanged.',
            ]);
        }

        DB::transaction(function () use ($registration, $oldStatus, $newStatus, $reason) {
            $registration->status = $newStatus;
            if ($newStatus === 'REJECTED') {
                $registration->is_eligible = false;
                $registration->rejection_reason = $reason;
            }
            if ($newStatus === 'VALIDATED') {
                $registration->is_eligible = true;
                $registration->rejection_reason = null;
            }
            if ($newStatus === 'CONFIRMED') {
                $registration->confirmed_at = now();
            }
            if ($newStatus === 'WITHDRAWN') {
                $registration->withdrawn_at = now();
                $registration->withdrawal_reason = $reason;
            }
            $registration->save();

            DB::table('registration_status_history')->insert([
                'registration_id' => $registration->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'reason' => $reason,
                'changed_at' => now(),
            ]);
        });

        return response()->json([
            'success' => true,
            'data' => $registration->fresh(),
        ]);
    }

    public function statusHistory($id)
    {
        $history = DB::table('registration_status_history')
            ->where('registration_id', $id)
            ->orderBy('changed_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $history]);
    }
}
