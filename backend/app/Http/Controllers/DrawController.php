<?php

namespace App\Http\Controllers;

use App\Models\ActivitySession;
use App\Models\Draw;
use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DrawController extends Controller
{
    /**
     * List sessions categorized by readiness for a draw.
     */
    public function readinessList()
    {
        $now = now()->toDateString();

        $sessions = DB::table('activity_sessions as s')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->leftJoin('session_sites as ss', 'ss.session_id', '=', 's.id')
            ->leftJoin('registrations as r', 'r.session_id', '=', 's.id')
            ->leftJoin('draws as d', 'd.session_id', '=', 's.id')
            ->whereIn('s.status', ['OPEN', 'CLOSED', 'DRAW_DONE'])
            ->where('a.draw_enabled', 1)
            ->select(
                's.id', 's.activity_id', 's.start_date', 's.end_date',
                's.registration_deadline', 's.draw_date', 's.draw_location',
                's.substitutes_count', 's.status as session_status',
                'a.title as activity_title', 'a.category as activity_category',
                DB::raw('COUNT(DISTINCT ss.id) AS sites_configured'),
                DB::raw('COALESCE(SUM(DISTINCT ss.quota), 0) AS total_quota'),
                DB::raw('COUNT(DISTINCT r.id) AS applicants'),
                DB::raw("SUM(CASE WHEN r.status = 'VALIDATED' THEN 1 ELSE 0 END) AS eligible_count"),
                DB::raw('MAX(CASE WHEN d.executed = 1 THEN 1 ELSE 0 END) AS draw_executed')
            )
            ->groupBy(
                's.id', 's.activity_id', 's.start_date', 's.end_date',
                's.registration_deadline', 's.draw_date', 's.draw_location',
                's.substitutes_count', 's.status', 'a.title', 'a.category'
            )
            ->orderBy('s.draw_date', 'asc')
            ->get();

        $ready = [];
        $notReady = [];

        foreach ($sessions as $s) {
            $reasons = [];
            if ($s->draw_executed) {
                $reasons[] = 'Draw already executed.';
            }
            if ($s->sites_configured === 0) {
                $reasons[] = 'Sites and quotas are not configured yet.';
            }
            if ((int) $s->eligible_count === 0) {
                $reasons[] = 'No eligible (validated) applicants.';
            }
            if ($s->total_quota === 0 || $s->total_quota === '0') {
                $reasons[] = 'Total quota is zero.';
            }
            // registration deadline must have passed
            if ($s->registration_deadline > $now) {
                $reasons[] = 'Registration deadline has not passed yet.';
            }

            if (empty($reasons)) {
                $ready[] = $s;
            } else {
                $s->blocking_reasons = $reasons;
                $notReady[] = $s;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'ready' => $ready,
                'not_ready' => $notReady,
            ],
        ]);
    }

    /**
     * Show detailed pre-draw info for one session (used by RunDraw page).
     */
    public function preview($sessionId)
    {
        $session = DB::table('activity_sessions as s')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->where('s.id', $sessionId)
            ->select('s.*', 'a.title as activity_title', 'a.draw_enabled')
            ->first();

        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Session not found'], 404);
        }

        $sites = DB::table('session_sites as ss')
            ->join('sites', 'sites.id', '=', 'ss.site_id')
            ->leftJoin('site_choices as sc', 'sc.session_site_id', '=', 'ss.id')
            ->where('ss.session_id', $sessionId)
            ->select(
                'ss.id', 'ss.quota', 'sites.name', 'sites.id as site_id',
                DB::raw('COUNT(DISTINCT sc.registration_id) AS interested_count')
            )
            ->groupBy('ss.id', 'ss.quota', 'sites.name', 'sites.id')
            ->orderBy('sites.name')
            ->get();

        $eligibleCount = DB::table('registrations')
            ->where('session_id', $sessionId)
            ->where('status', 'VALIDATED')
            ->count();

        $existingDraw = DB::table('draws')->where('session_id', $sessionId)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'session' => $session,
                'sites' => $sites,
                'eligible_count' => $eligibleCount,
                'existing_draw' => $existingDraw,
            ],
        ]);
    }

    /**
     * Execute the draw for a session.
     * BY_SITE algorithm: shuffle eligible registrations, then walk each candidate
     * in order, assigning to their highest-ranked site choice that still has quota.
     * Remaining go to substitute pool (capped by substitutes_count) then WAITING_LIST.
     */
    public function execute(Request $request, $sessionId)
    {
        $data = $request->validate([
            'admin_id' => ['required', 'integer', 'exists:users,id'],
            'mode' => ['nullable', 'string', 'in:BY_SITE,GLOBAL'],
            'draw_location' => ['nullable', 'string', 'max:200'],
        ]);

        $session = ActivitySession::findOrFail($sessionId);

        if (DB::table('draws')->where('session_id', $sessionId)->where('executed', 1)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'A draw has already been executed for this session.',
            ], 409);
        }

        $sites = DB::table('session_sites')
            ->where('session_id', $sessionId)
            ->get(['id', 'quota'])
            ->keyBy('id');

        if ($sites->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No sites configured for this session.',
            ], 422);
        }

        $eligible = DB::table('registrations')
            ->where('session_id', $sessionId)
            ->where('status', 'VALIDATED')
            ->pluck('id')
            ->toArray();

        if (empty($eligible)) {
            return response()->json([
                'success' => false,
                'message' => 'No eligible (VALIDATED) registrations to draw from.',
            ], 422);
        }

        // Pre-load each eligible registration's site choices, sorted
        $choicesByReg = DB::table('site_choices')
            ->whereIn('registration_id', $eligible)
            ->orderBy('choice_order')
            ->get()
            ->groupBy('registration_id');

        // Shuffle for randomness
        shuffle($eligible);

        $remainingQuota = [];
        foreach ($sites as $id => $row) {
            $remainingQuota[$id] = (int) $row->quota;
        }

        $assignments = []; // registration_id => session_site_id (selected)
        $unassigned = [];   // registration_ids that didn't fit any chosen site

        foreach ($eligible as $regId) {
            $choices = $choicesByReg->get($regId, collect());
            $assigned = false;
            foreach ($choices as $c) {
                $ssId = $c->session_site_id;
                if (isset($remainingQuota[$ssId]) && $remainingQuota[$ssId] > 0) {
                    $assignments[$regId] = $ssId;
                    $remainingQuota[$ssId]--;
                    $assigned = true;
                    break;
                }
            }
            if (!$assigned) {
                $unassigned[] = $regId;
            }
        }

        // For employees who picked NO site (no choices recorded) — fall back to GLOBAL fill
        // i.e. assign them to any site that still has quota.
        foreach ($unassigned as $i => $regId) {
            $choices = $choicesByReg->get($regId, collect());
            if ($choices->isEmpty()) {
                foreach ($remainingQuota as $ssId => $qty) {
                    if ($qty > 0) {
                        $assignments[$regId] = $ssId;
                        $remainingQuota[$ssId]--;
                        unset($unassigned[$i]);
                        break;
                    }
                }
            }
        }
        $unassigned = array_values($unassigned);

        // Substitute pool: from unassigned, take up to substitutes_count
        shuffle($unassigned);
        $substituteIds = array_slice($unassigned, 0, (int) $session->substitutes_count);
        $waitingIds = array_slice($unassigned, (int) $session->substitutes_count);

        $drawId = DB::transaction(function () use (
            $session, $data, $assignments, $substituteIds, $waitingIds
        ) {
            $drawId = DB::table('draws')->insertGetId([
                'session_id' => $session->id,
                'admin_id' => $data['admin_id'],
                'draw_date' => now(),
                'draw_location' => $data['draw_location'] ?? $session->draw_location,
                'mode' => $data['mode'] ?? 'BY_SITE',
                'executed' => 1,
                'executed_at' => now(),
            ]);

            $rank = 1;
            foreach ($assignments as $regId => $ssId) {
                DB::table('draw_results')->insert([
                    'draw_id' => $drawId,
                    'registration_id' => $regId,
                    'session_site_id' => $ssId,
                    'result_rank' => $rank++,
                    'is_selected' => 1,
                    'is_substitute' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $this->updateRegistrationStatus($regId, 'SELECTED', 'Draw: selected');
            }

            $subRank = 1;
            foreach ($substituteIds as $regId) {
                DB::table('draw_results')->insert([
                    'draw_id' => $drawId,
                    'registration_id' => $regId,
                    'session_site_id' => null,
                    'result_rank' => $rank++,
                    'is_selected' => 0,
                    'is_substitute' => 1,
                    'substitute_rank' => $subRank++,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $this->updateRegistrationStatus($regId, 'WAITING_LIST', 'Draw: substitute');
            }

            foreach ($waitingIds as $regId) {
                DB::table('draw_results')->insert([
                    'draw_id' => $drawId,
                    'registration_id' => $regId,
                    'session_site_id' => null,
                    'result_rank' => $rank++,
                    'is_selected' => 0,
                    'is_substitute' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $this->updateRegistrationStatus($regId, 'WAITING_LIST', 'Draw: waiting list');
            }

            DB::table('activity_sessions')
                ->where('id', $session->id)
                ->update(['status' => 'DRAW_DONE', 'updated_at' => now()]);

            return $drawId;
        });

        return response()->json([
            'success' => true,
            'data' => [
                'draw_id' => $drawId,
                'selected_count' => count($assignments),
                'substitute_count' => count($substituteIds),
                'waiting_count' => count($waitingIds),
            ],
        ]);
    }

    private function updateRegistrationStatus($regId, $newStatus, $reason)
    {
        $reg = Registration::find($regId);
        if (!$reg) return;
        $oldStatus = $reg->status;
        if ($oldStatus === $newStatus) return;
        $reg->status = $newStatus;
        $reg->save();
        DB::table('registration_status_history')->insert([
            'registration_id' => $regId,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'reason' => $reason,
            'changed_at' => now(),
        ]);
    }

    /**
     * History of all executed draws across the system.
     */
    public function history()
    {
        $draws = DB::table('draws as d')
            ->join('activity_sessions as s', 's.id', '=', 'd.session_id')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->join('users as admin', 'admin.id', '=', 'd.admin_id')
            ->leftJoin('draw_results as r', 'r.draw_id', '=', 'd.draw_id')
            ->select(
                'd.draw_id',
                'd.session_id',
                'd.draw_date',
                'd.draw_location',
                'd.mode',
                'd.executed_at',
                's.start_date',
                's.end_date',
                'a.title as activity_title',
                'a.category as activity_category',
                'admin.first_name as admin_first_name',
                'admin.name as admin_last_name',
                DB::raw("SUM(CASE WHEN r.is_selected = 1 THEN 1 ELSE 0 END) AS selected_count"),
                DB::raw("SUM(CASE WHEN r.is_substitute = 1 THEN 1 ELSE 0 END) AS substitute_count"),
                DB::raw("SUM(CASE WHEN r.is_selected = 0 AND r.is_substitute = 0 THEN 1 ELSE 0 END) AS waiting_count")
            )
            ->groupBy(
                'd.draw_id', 'd.session_id', 'd.draw_date', 'd.draw_location',
                'd.mode', 'd.executed_at', 's.start_date', 's.end_date',
                'a.title', 'a.category', 'admin.first_name', 'admin.name'
            )
            ->orderBy('d.executed_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $draws]);
    }

    /**
     * Show the detailed results of one draw (selected / substitutes / waiting).
     */
    public function show($drawId)
    {
        $draw = DB::table('draws as d')
            ->join('activity_sessions as s', 's.id', '=', 'd.session_id')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->where('d.draw_id', $drawId)
            ->select('d.*', 'a.title as activity_title', 's.start_date', 's.end_date')
            ->first();

        if (!$draw) {
            return response()->json(['success' => false, 'message' => 'Draw not found'], 404);
        }

        $results = DB::table('draw_results as r')
            ->join('registrations as reg', 'reg.id', '=', 'r.registration_id')
            ->join('users as u', 'u.id', '=', 'reg.user_id')
            ->leftJoin('session_sites as ss', 'ss.id', '=', 'r.session_site_id')
            ->leftJoin('sites', 'sites.id', '=', 'ss.site_id')
            ->where('r.draw_id', $drawId)
            ->select(
                'r.id', 'r.is_selected', 'r.is_substitute', 'r.substitute_rank',
                'r.result_rank',
                'reg.id as registration_id', 'reg.status as registration_status',
                'u.first_name as user_first_name', 'u.name as user_last_name',
                'u.employee_number',
                'sites.name as site_name'
            )
            ->orderBy('r.result_rank')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'draw' => $draw,
                'results' => $results,
            ],
        ]);
    }
}
