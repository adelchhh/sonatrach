<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    /**
     * Employee: list documents I uploaded (across my registrations).
     */
    public function myDocuments(Request $request)
    {
        $userId = (int) $request->query('user_id');
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'user_id required'], 400);
        }

        $rows = DB::table('documents as d')
            ->join('registrations as r', 'r.id', '=', 'd.registration_id')
            ->join('activity_sessions as s', 's.id', '=', 'r.session_id')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->where('r.user_id', $userId)
            ->whereNull('r.deleted_at')
            ->select(
                'd.document_id as id', 'd.registration_id', 'd.file_name',
                'd.document_type', 'd.status', 'd.validation_comment',
                'd.uploaded_at', 'd.validated_at',
                'a.title as activity_title', 's.id as session_id',
                's.start_date', 's.end_date'
            )
            ->orderBy('d.uploaded_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $rows]);
    }

    /**
     * Employee: list draw results for my registrations.
     */
    public function myDrawResults(Request $request)
    {
        $userId = (int) $request->query('user_id');
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'user_id required'], 400);
        }

        $rows = DB::table('draw_results as dr')
            ->join('registrations as r', 'r.id', '=', 'dr.registration_id')
            ->join('activity_sessions as s', 's.id', '=', 'r.session_id')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->join('draws as d', 'd.draw_id', '=', 'dr.draw_id')
            ->leftJoin('session_sites as ss', 'ss.id', '=', 'dr.session_site_id')
            ->leftJoin('sites', 'sites.id', '=', 'ss.site_id')
            ->where('r.user_id', $userId)
            ->select(
                'dr.id', 'dr.is_selected', 'dr.is_substitute', 'dr.substitute_rank',
                'r.id as registration_id', 'r.status as registration_status',
                'a.title as activity_title', 'a.category as activity_category',
                's.id as session_id', 's.start_date', 's.end_date',
                'd.draw_date', 'd.draw_location',
                'sites.name as site_name'
            )
            ->orderBy('d.draw_date', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $rows]);
    }

    /**
     * Employee: list my participation history.
     */
    public function myParticipations(Request $request)
    {
        $userId = (int) $request->query('user_id');
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'user_id required'], 400);
        }

        $rows = DB::table('participations as p')
            ->join('session_sites as ss', 'ss.id', '=', 'p.session_site_id')
            ->join('activity_sessions as s', 's.id', '=', 'ss.session_id')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->join('sites', 'sites.id', '=', 'ss.site_id')
            ->leftJoin('certificates as c', 'c.participation_id', '=', 'p.id')
            ->where('p.user_id', $userId)
            ->select(
                'p.id', 'p.answer', 'p.rating', 'p.date_p',
                'a.title as activity_title', 'a.category as activity_category',
                's.start_date', 's.end_date',
                'sites.name as site_name',
                'c.file_path as certificate_path'
            )
            ->orderBy('p.date_p', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $rows]);
    }
}
