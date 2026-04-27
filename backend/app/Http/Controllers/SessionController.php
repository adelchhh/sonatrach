<?php

namespace App\Http\Controllers;

use App\Models\Activite;
use App\Models\ActivitySession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SessionController extends Controller
{
    private array $allowedStatuses = [
        'DRAFT', 'OPEN', 'CLOSED', 'DRAW_DONE', 'FINISHED', 'CANCELLED',
    ];

    /**
     * List all sessions for one activity, with aggregate counts.
     */
    public function indexByActivity($activityId)
    {
        $activity = Activite::findOrFail($activityId);

        $sessions = DB::table('activity_sessions as s')
            ->leftJoin('session_sites as ss', 'ss.session_id', '=', 's.id')
            ->leftJoin('registrations as r', 'r.session_id', '=', 's.id')
            ->where('s.activity_id', $activity->id)
            ->select(
                's.*',
                DB::raw('COUNT(DISTINCT ss.id) AS sites_count'),
                DB::raw('COALESCE(SUM(DISTINCT ss.quota), 0) AS total_quota'),
                DB::raw('COUNT(DISTINCT r.id) AS registrations_count')
            )
            ->groupBy('s.id')
            ->orderBy('s.start_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'activity' => $activity,
                'sessions' => $sessions,
            ],
        ]);
    }

    /**
     * List all sessions across the system (used for cross-activity views like Launch Draw).
     */
    public function index(Request $request)
    {
        $query = DB::table('activity_sessions as s')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->leftJoin('session_sites as ss', 'ss.session_id', '=', 's.id')
            ->leftJoin('registrations as r', 'r.session_id', '=', 's.id')
            ->select(
                's.*',
                'a.title as activity_title',
                'a.category as activity_category',
                DB::raw('COUNT(DISTINCT ss.id) AS sites_count'),
                DB::raw('COALESCE(SUM(DISTINCT ss.quota), 0) AS total_quota'),
                DB::raw('COUNT(DISTINCT r.id) AS registrations_count')
            )
            ->groupBy('s.id', 'a.title', 'a.category');

        if ($status = $request->query('status')) {
            $query->where('s.status', strtoupper($status));
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('s.start_date', 'desc')->get(),
        ]);
    }

    public function show($id)
    {
        $session = DB::table('activity_sessions as s')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->leftJoin('session_sites as ss', 'ss.session_id', '=', 's.id')
            ->leftJoin('registrations as r', 'r.session_id', '=', 's.id')
            ->where('s.id', $id)
            ->select(
                's.*',
                'a.title as activity_title',
                'a.category as activity_category',
                'a.draw_enabled as activity_draw_enabled',
                DB::raw('COUNT(DISTINCT ss.id) AS sites_count'),
                DB::raw('COALESCE(SUM(DISTINCT ss.quota), 0) AS total_quota'),
                DB::raw('COUNT(DISTINCT r.id) AS registrations_count')
            )
            ->groupBy('s.id', 'a.title', 'a.category', 'a.draw_enabled')
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found',
            ], 404);
        }

        // Site allocations for this session
        $sites = DB::table('session_sites as ss')
            ->join('sites', 'sites.id', '=', 'ss.site_id')
            ->where('ss.session_id', $id)
            ->select('ss.id as session_site_id', 'sites.id as site_id', 'sites.name', 'sites.address', 'ss.quota')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'session' => $session,
                'sites' => $sites,
            ],
        ]);
    }

    public function store(Request $request, $activityId)
    {
        $activity = Activite::findOrFail($activityId);

        $data = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'registration_deadline' => ['required', 'date', 'before_or_equal:start_date'],
            'draw_date' => ['nullable', 'date'],
            'draw_location' => ['nullable', 'string', 'max:200'],
            'confirmation_delay_hours' => ['nullable', 'integer', 'min:0', 'max:8760'],
            'document_upload_deadline' => ['nullable', 'date'],
            'transport_included' => ['nullable', 'boolean'],
            'telefax_url' => ['nullable', 'string', 'max:500'],
            'substitutes_count' => ['nullable', 'integer', 'min:0', 'max:50'],
            'status' => ['nullable', 'string', 'in:' . implode(',', $this->allowedStatuses)],
        ]);

        $data['activity_id'] = $activity->id;
        $data['confirmation_delay_hours'] = $data['confirmation_delay_hours'] ?? 48;
        $data['transport_included'] = (bool) ($data['transport_included'] ?? false);
        $data['substitutes_count'] = $data['substitutes_count'] ?? 2;
        $data['status'] = $data['status'] ?? 'DRAFT';

        $session = ActivitySession::create($data);

        return response()->json([
            'success' => true,
            'data' => $session,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $session = ActivitySession::findOrFail($id);

        $data = $request->validate([
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date'],
            'registration_deadline' => ['sometimes', 'required', 'date'],
            'draw_date' => ['nullable', 'date'],
            'draw_location' => ['nullable', 'string', 'max:200'],
            'confirmation_delay_hours' => ['nullable', 'integer', 'min:0', 'max:8760'],
            'document_upload_deadline' => ['nullable', 'date'],
            'transport_included' => ['nullable', 'boolean'],
            'telefax_url' => ['nullable', 'string', 'max:500'],
            'substitutes_count' => ['nullable', 'integer', 'min:0', 'max:50'],
            'status' => ['nullable', 'string', 'in:' . implode(',', $this->allowedStatuses)],
        ]);

        $session->update($data);

        return response()->json([
            'success' => true,
            'data' => $session->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $session = ActivitySession::findOrFail($id);

        $registrations = DB::table('registrations')->where('session_id', $id)->count();
        if ($registrations > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete: session has {$registrations} registration(s).",
            ], 409);
        }

        $session->delete();

        return response()->json([
            'success' => true,
            'message' => 'Session deleted successfully',
        ]);
    }
}
