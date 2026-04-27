<?php

namespace App\Http\Controllers;

use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SiteController extends Controller
{
    public function index()
    {
        $sites = DB::table('sites')
            ->leftJoin('session_sites', 'sites.id', '=', 'session_sites.site_id')
            ->leftJoin('activity_sessions', 'session_sites.session_id', '=', 'activity_sessions.id')
            ->select(
                'sites.id',
                'sites.name',
                'sites.address',
                'sites.created_at',
                'sites.updated_at',
                DB::raw('COUNT(DISTINCT session_sites.id) AS sessions_count'),
                DB::raw('COUNT(DISTINCT activity_sessions.activity_id) AS activities_count')
            )
            ->groupBy('sites.id', 'sites.name', 'sites.address', 'sites.created_at', 'sites.updated_at')
            ->orderBy('sites.name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sites,
        ]);
    }

    public function show($id)
    {
        $site = Site::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $site,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:200', Rule::unique('sites', 'name')],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $site = Site::create($data);

        return response()->json([
            'success' => true,
            'data' => $site,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $site = Site::findOrFail($id);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:200', Rule::unique('sites', 'name')->ignore($site->id)],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $site->update($data);

        return response()->json([
            'success' => true,
            'data' => $site,
        ]);
    }

    public function destroy($id)
    {
        $site = Site::findOrFail($id);

        // Block deletion if site is used in any session
        $usage = DB::table('session_sites')->where('site_id', $id)->count();
        if ($usage > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete: site is used by {$usage} session(s).",
            ], 409);
        }

        $site->delete();

        return response()->json([
            'success' => true,
            'message' => 'Site deleted successfully',
        ]);
    }
}
