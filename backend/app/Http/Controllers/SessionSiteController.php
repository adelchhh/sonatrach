<?php

namespace App\Http\Controllers;

use App\Models\ActivitySession;
use App\Models\SessionSite;
use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SessionSiteController extends Controller
{
    /**
     * List all site allocations for a session, with selection / preference counts.
     */
    public function index($sessionId)
    {
        $session = ActivitySession::findOrFail($sessionId);

        $rows = DB::table('session_sites as ss')
            ->join('sites', 'sites.id', '=', 'ss.site_id')
            ->leftJoin('site_choices as sc', 'sc.session_site_id', '=', 'ss.id')
            ->leftJoin('draw_results as dr', function ($join) {
                $join->on('dr.session_site_id', '=', 'ss.id')
                     ->where('dr.is_selected', '=', 1);
            })
            ->where('ss.session_id', $sessionId)
            ->select(
                'ss.id',
                'ss.session_id',
                'ss.site_id',
                'ss.quota',
                'sites.name as site_name',
                'sites.address as site_address',
                DB::raw('COUNT(DISTINCT sc.id) AS choices_count'),
                DB::raw('COUNT(DISTINCT dr.id) AS selected_count')
            )
            ->groupBy(
                'ss.id', 'ss.session_id', 'ss.site_id', 'ss.quota',
                'sites.name', 'sites.address'
            )
            ->orderBy('sites.name')
            ->get();

        // Sites NOT yet assigned (for the dropdown)
        $assignedSiteIds = $rows->pluck('site_id')->toArray();
        $availableSites = Site::whereNotIn('id', $assignedSiteIds ?: [0])
            ->orderBy('name')
            ->get(['id', 'name', 'address']);

        return response()->json([
            'success' => true,
            'data' => [
                'session' => $session,
                'allocations' => $rows,
                'available_sites' => $availableSites,
            ],
        ]);
    }

    public function store(Request $request, $sessionId)
    {
        $session = ActivitySession::findOrFail($sessionId);

        $data = $request->validate([
            'site_id' => ['required', 'integer', 'exists:sites,id'],
            'quota' => ['required', 'integer', 'min:1', 'max:10000'],
        ]);

        $exists = SessionSite::where('session_id', $session->id)
            ->where('site_id', $data['site_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'This site is already assigned to the session.',
            ], 409);
        }

        $allocation = SessionSite::create([
            'session_id' => $session->id,
            'site_id' => $data['site_id'],
            'quota' => $data['quota'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $allocation,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $allocation = SessionSite::findOrFail($id);

        $data = $request->validate([
            'quota' => ['required', 'integer', 'min:1', 'max:10000'],
        ]);

        $allocation->update($data);

        return response()->json([
            'success' => true,
            'data' => $allocation->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $allocation = SessionSite::findOrFail($id);

        // Block if site_choices or draw_results reference this allocation
        $usedInChoices = DB::table('site_choices')
            ->where('session_site_id', $id)->count();
        $usedInResults = DB::table('draw_results')
            ->where('session_site_id', $id)->count();

        if ($usedInChoices > 0 || $usedInResults > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot remove: this allocation is referenced by registrations or draw results.',
            ], 409);
        }

        $allocation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Site allocation removed.',
        ]);
    }
}
