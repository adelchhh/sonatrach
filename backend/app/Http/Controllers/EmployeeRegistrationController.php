<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EmployeeRegistrationController extends Controller
{
    /**
     * Employee: list my own registrations.
     */
    public function myRegistrations(Request $request)
    {
        $userId = $this->resolveUserId($request);
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'user_id required'], 400);
        }

        $rows = DB::table('registrations as r')
            ->join('activity_sessions as s', 's.id', '=', 'r.session_id')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->where('r.user_id', $userId)
            ->whereNull('r.deleted_at')
            ->select(
                'r.id', 'r.session_id', 'r.status', 'r.is_eligible',
                'r.rejection_reason', 'r.registered_at', 'r.confirmed_at',
                'r.withdrawn_at', 'r.withdrawal_reason', 'r.reference_number',
                'a.id as activity_id', 'a.title as activity_title',
                'a.category as activity_category',
                's.start_date', 's.end_date', 's.draw_date',
                's.draw_location', 's.status as session_status',
                's.document_upload_deadline'
            )
            ->orderBy('r.registered_at', 'desc')
            ->get();

        // Attach site choices for each
        $regIds = $rows->pluck('id');
        $choices = DB::table('site_choices as sc')
            ->join('session_sites as ss', 'ss.id', '=', 'sc.session_site_id')
            ->join('sites', 'sites.id', '=', 'ss.site_id')
            ->whereIn('sc.registration_id', $regIds)
            ->select(
                'sc.registration_id', 'sc.choice_order',
                'sites.name as site_name', 'ss.id as session_site_id'
            )
            ->orderBy('sc.choice_order')
            ->get()
            ->groupBy('registration_id');

        $rows = $rows->map(function ($r) use ($choices) {
            $r->choices = $choices->get($r->id, collect())->values();
            return $r;
        });

        return response()->json(['success' => true, 'data' => $rows]);
    }

    /**
     * Employee: register to a session with optional site choices.
     */
    public function register(Request $request, $sessionId)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'site_choices' => ['nullable', 'array', 'max:5'],
            'site_choices.*' => ['integer', 'exists:session_sites,id'],
        ]);

        $session = DB::table('activity_sessions')->where('id', $sessionId)->first();
        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Session not found'], 404);
        }

        if (!in_array($session->status, ['OPEN', 'DRAFT'])) {
            return response()->json([
                'success' => false,
                'message' => 'Session is not open for registration.',
            ], 422);
        }

        $deadline = $session->registration_deadline;
        if ($deadline && now()->toDateString() > $deadline) {
            return response()->json([
                'success' => false,
                'message' => 'Registration deadline has passed.',
            ], 422);
        }

        // Check eligibility: user's seniority ≥ activity.minimum_seniority
        $activity = DB::table('activities')->where('id', $session->activity_id)->first();
        $user = DB::table('users')->where('id', $data['user_id'])->first();

        $isEligible = true;
        if ($activity && $user && $user->hire_date) {
            $years = now()->diffInYears($user->hire_date);
            if ($years < (int) $activity->minimum_seniority) {
                $isEligible = false;
            }
        }

        // Already registered?
        $exists = DB::table('registrations')
            ->where('user_id', $data['user_id'])
            ->where('session_id', $sessionId)
            ->whereNull('deleted_at')
            ->first();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'You are already registered for this session.',
            ], 409);
        }

        // Auto-status: no manual admin validation required.
        //  - Not eligible  → REJECTED (kept in history, won't enter draw)
        //  - No draw       → CONFIRMED (e.g. Cross — open to all)
        //  - Draw activity → VALIDATED (auto, eligible for draw)
        $skipDraw = $activity && (int) $activity->draw_enabled === 0;
        if (!$isEligible) {
            $initialStatus = 'REJECTED';
            $initialReason = 'Not eligible: seniority below required minimum';
        } elseif ($skipDraw) {
            $initialStatus = 'CONFIRMED';
            $initialReason = 'Auto-confirmed: activity has no draw';
        } else {
            $initialStatus = 'VALIDATED';
            $initialReason = 'Auto-validated: eligible for draw';
        }

        $regId = DB::transaction(function () use ($data, $sessionId, $isEligible, $initialStatus, $initialReason, $skipDraw) {
            $regId = DB::table('registrations')->insertGetId([
                'user_id' => $data['user_id'],
                'session_id' => $sessionId,
                'registered_at' => now(),
                'status' => $initialStatus,
                'is_eligible' => $isEligible ? 1 : 0,
                'confirmed_at' => $skipDraw ? now() : null,
                'reference_number' => 'REG-' . strtoupper(uniqid()),
            ]);

            // Insert site choices (ignored for non-draw activities but kept for audit)
            if (!empty($data['site_choices'])) {
                $order = 1;
                foreach ($data['site_choices'] as $ssId) {
                    DB::table('site_choices')->insert([
                        'registration_id' => $regId,
                        'session_site_id' => $ssId,
                        'choice_order' => $order++,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::table('registration_status_history')->insert([
                'registration_id' => $regId,
                'old_status' => null,
                'new_status' => $initialStatus,
                'reason' => $initialReason,
                'changed_at' => now(),
            ]);

            return $regId;
        });

        return response()->json([
            'success' => true,
            'data' => Registration::find($regId),
            'message' => $isEligible
                ? 'Registration submitted successfully.'
                : 'Registered but flagged as ineligible (seniority requirement not met).',
        ], 201);
    }

    /**
     * Employee: cancel my own registration (sets status to CANCELLED).
     */
    public function cancel(Request $request, $registrationId)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $reg = Registration::where('id', $registrationId)
            ->where('user_id', $data['user_id'])
            ->first();

        if (!$reg) {
            return response()->json([
                'success' => false,
                'message' => 'Registration not found.',
            ], 404);
        }

        if (in_array($reg->status, ['SELECTED', 'CONFIRMED'])) {
            return response()->json([
                'success' => false,
                'message' => 'Selected/confirmed registrations cannot be cancelled — please request a withdrawal.',
            ], 422);
        }

        $oldStatus = $reg->status;
        $reg->status = 'CANCELLED';
        $reg->save();

        DB::table('registration_status_history')->insert([
            'registration_id' => $reg->id,
            'old_status' => $oldStatus,
            'new_status' => 'CANCELLED',
            'reason' => 'Cancelled by employee',
            'changed_at' => now(),
        ]);

        return response()->json(['success' => true, 'data' => $reg->fresh()]);
    }

    /**
     * Public-facing: list open sessions for one activity (used by ActivityDetail page).
     */
    public function openSessionsForActivity($activityId)
    {
        $sessions = DB::table('activity_sessions as s')
            ->leftJoin('session_sites as ss', 'ss.session_id', '=', 's.id')
            ->where('s.activity_id', $activityId)
            ->whereIn('s.status', ['OPEN', 'DRAFT'])
            ->select(
                's.id', 's.start_date', 's.end_date',
                's.registration_deadline', 's.draw_date',
                's.draw_location', 's.status', 's.transport_included',
                's.substitutes_count',
                DB::raw('COALESCE(SUM(DISTINCT ss.quota), 0) AS total_quota'),
                DB::raw('COUNT(DISTINCT ss.id) AS sites_count')
            )
            ->groupBy(
                's.id', 's.start_date', 's.end_date',
                's.registration_deadline', 's.draw_date',
                's.draw_location', 's.status', 's.transport_included',
                's.substitutes_count'
            )
            ->orderBy('s.start_date')
            ->get();

        // Attach site allocations for each
        $sessionIds = $sessions->pluck('id');
        $sitesByEmployee = DB::table('session_sites as ss')
            ->join('sites', 'sites.id', '=', 'ss.site_id')
            ->whereIn('ss.session_id', $sessionIds)
            ->select(
                'ss.session_id', 'ss.id as session_site_id',
                'sites.id as site_id', 'sites.name as site_name', 'ss.quota'
            )
            ->orderBy('sites.name')
            ->get()
            ->groupBy('session_id');

        $sessions = $sessions->map(function ($s) use ($sitesByEmployee) {
            $s->sites = $sitesByEmployee->get($s->id, collect())->values();
            return $s;
        });

        return response()->json(['success' => true, 'data' => $sessions]);
    }

    private function resolveUserId(Request $request)
    {
        return (int) ($request->query('user_id') ?: $request->input('user_id'));
    }
}
