<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Aggregate report data for the admin Reports page.
     */
    public function summary()
    {
        // Top-line stats
        $totals = [
            'total_users' => DB::table('users')->whereNull('deleted_at')->count(),
            'total_activities' => DB::table('activities')
                ->where('status', 'PUBLISHED')
                ->whereNull('deleted_at')
                ->count(),
            'total_sessions' => DB::table('activity_sessions')->count(),
            'total_registrations' => DB::table('registrations')
                ->whereNull('deleted_at')->count(),
            'total_documents' => DB::table('documents')->count(),
            'executed_draws' => DB::table('draws')->where('executed', 1)->count(),
        ];

        // Outcome breakdown across all registrations
        $statusBreakdown = DB::table('registrations')
            ->whereNull('deleted_at')
            ->select('status', DB::raw('COUNT(*) AS count'))
            ->groupBy('status')
            ->get();

        // Monthly applications (last 12 months)
        $monthly = DB::table('registrations')
            ->whereNull('deleted_at')
            ->where('registered_at', '>=', now()->subMonths(11)->startOfMonth())
            ->select(
                DB::raw("DATE_FORMAT(registered_at, '%Y-%m') AS month"),
                DB::raw('COUNT(*) AS count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Performance per activity
        $performance = DB::table('activities as a')
            ->leftJoin('activity_sessions as s', 's.activity_id', '=', 'a.id')
            ->leftJoin('session_sites as ss', 'ss.session_id', '=', 's.id')
            ->leftJoin('registrations as r', function ($j) {
                $j->on('r.session_id', '=', 's.id')->whereNull('r.deleted_at');
            })
            ->whereNull('a.deleted_at')
            ->select(
                'a.id', 'a.title', 'a.category', 'a.status',
                DB::raw('COALESCE(SUM(DISTINCT ss.quota), 0) AS total_quota'),
                DB::raw('COUNT(DISTINCT r.id) AS total_applications'),
                DB::raw("SUM(CASE WHEN r.status IN ('SELECTED','CONFIRMED') THEN 1 ELSE 0 END) AS approved_count")
            )
            ->groupBy('a.id', 'a.title', 'a.category', 'a.status')
            ->orderByDesc('total_applications')
            ->limit(20)
            ->get();

        // Compute approval rate per activity
        $performance = $performance->map(function ($row) {
            $approved = (int) $row->approved_count;
            $apps = (int) $row->total_applications;
            $row->approval_rate = $apps > 0 ? round(($approved / $apps) * 100, 1) : 0;
            return $row;
        });

        // Withdrawal stats
        $withdrawals = DB::table('withdrawal_requests')
            ->select('status', DB::raw('COUNT(*) AS count'))
            ->groupBy('status')
            ->get();

        // Documents stats
        $documentStats = DB::table('documents')
            ->select('status', DB::raw('COUNT(*) AS count'))
            ->groupBy('status')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'totals' => $totals,
                'status_breakdown' => $statusBreakdown,
                'monthly_applications' => $monthly,
                'activity_performance' => $performance,
                'withdrawals_breakdown' => $withdrawals,
                'documents_breakdown' => $documentStats,
            ],
        ]);
    }
}
