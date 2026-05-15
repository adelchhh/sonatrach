<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Aggregated KPIs for the dashboard home page.
     * Supports an optional ?user_id= param to also return personal stats.
     */
    public function index(Request $request)
    {
        $now = now();

        // ─── Platform-wide stats ───
        $totalActivities = DB::table('activities')
            ->whereNull('deleted_at')
            ->count();

        $publishedActivities = DB::table('activities')
            ->where('status', 'PUBLISHED')
            ->whereNull('deleted_at')
            ->count();

        $totalSessions = DB::table('activity_sessions')->count();

        $activeSessions = DB::table('activity_sessions')
            ->whereIn('status', ['OPEN', 'CLOSED'])
            ->count();

        $drawDoneSessions = DB::table('activity_sessions')
            ->where('status', 'DRAW_DONE')
            ->count();

        $totalRegistrations = DB::table('registrations')
            ->whereNull('deleted_at')
            ->count();

        $pendingRegistrations = DB::table('registrations')
            ->where('status', 'PENDING')
            ->whereNull('deleted_at')
            ->count();

        $totalUsers = DB::table('users')
            ->where('active', 1)
            ->whereNull('deleted_at')
            ->count();

        $totalSites = DB::table('sites')->count();

        $executedDraws = DB::table('draws')->where('executed', 1)->count();

        // Upcoming draws (sessions CLOSED whose draw_date is in future)
        $upcomingDraws = DB::table('activity_sessions')
            ->where('status', 'CLOSED')
            ->whereDate('draw_date', '>=', $now->toDateString())
            ->count();

        // Pending documents to validate
        $pendingDocuments = DB::table('documents')
            ->where('status', 'UPLOADED')
            ->count();

        // Pending withdrawals
        $pendingWithdrawals = DB::table('withdrawal_requests')
            ->where('status', 'PENDING')
            ->count();

        $payload = [
            'total_activities' => $totalActivities,
            'active_activities' => $publishedActivities,
            'total_sessions' => $totalSessions,
            'active_sessions' => $activeSessions,
            'draw_done_sessions' => $drawDoneSessions,
            'total_registrations' => $totalRegistrations,
            'pending_registrations' => $pendingRegistrations,
            'total_users' => $totalUsers,
            'total_sites' => $totalSites,
            'executed_draws' => $executedDraws,
            'upcoming_draws' => $upcomingDraws,
            'pending_documents' => $pendingDocuments,
            'pending_withdrawals' => $pendingWithdrawals,
        ];

        // ─── Optional personal stats ───
        $userId = $request->query('user_id');
        if ($userId) {
            $payload['me'] = [
                'my_registrations' => DB::table('registrations')
                    ->where('user_id', $userId)
                    ->whereNull('deleted_at')
                    ->count(),
                'my_pending' => DB::table('registrations')
                    ->where('user_id', $userId)
                    ->whereIn('status', ['PENDING', 'VALIDATED', 'WAITING_LIST'])
                    ->whereNull('deleted_at')
                    ->count(),
                'my_selected' => DB::table('registrations')
                    ->where('user_id', $userId)
                    ->whereIn('status', ['SELECTED', 'CONFIRMED'])
                    ->whereNull('deleted_at')
                    ->count(),
                'my_documents_pending' => DB::table('documents as d')
                    ->join('registrations as r', 'r.id', '=', 'd.registration_id')
                    ->where('r.user_id', $userId)
                    ->where('d.status', 'UPLOADED')
                    ->count(),
                'my_unread_notifications' => DB::table('notifications')
                    ->where('user_id', $userId)
                    ->where('is_read', 0)
                    ->count(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $payload,
        ]);
    }
}
