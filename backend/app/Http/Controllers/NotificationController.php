<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    /**
     * Employee: list my notifications.
     */
    public function myNotifications(Request $request)
    {
        $userId = (int) $request->query('user_id');
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'user_id required'], 400);
        }

        $rows = DB::table('notifications as n')
            ->leftJoin('activities as a', 'a.id', '=', 'n.activity_id')
            ->where('n.user_id', $userId)
            ->select('n.*', 'a.title as activity_title')
            ->orderBy('n.created_at', 'desc')
            ->limit(200)
            ->get();

        return response()->json(['success' => true, 'data' => $rows]);
    }

    public function markRead($id)
    {
        DB::table('notifications')->where('id', $id)->update(['is_read' => 1]);
        return response()->json(['success' => true]);
    }

    public function markAllRead(Request $request)
    {
        $userId = (int) $request->query('user_id');
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'user_id required'], 400);
        }

        DB::table('notifications')
            ->where('user_id', $userId)
            ->where('is_read', 0)
            ->update(['is_read' => 1]);

        return response()->json(['success' => true]);
    }

    /**
     * Communicator: send a notification to one or multiple recipients.
     */
    public function send(Request $request)
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:5000'],
            'type' => ['nullable', 'string'],
            'audience' => ['required', 'string', 'in:ALL,EMPLOYEES,FUNCTIONAL_ADMIN,COMMUNICATOR,SYSTEM_ADMIN'],
            'activity_id' => ['nullable', 'integer', 'exists:activities,id'],
            'session_id' => ['nullable', 'integer', 'exists:activity_sessions,id'],
        ]);

        // Resolve recipients
        $recipients = DB::table('users');
        if ($data['audience'] !== 'ALL') {
            $role = DB::table('roles')->where('name', $data['audience'])->first();
            if ($role) {
                $recipients->join('user_roles', 'user_roles.user_id', '=', 'users.id')
                    ->where('user_roles.role_id', $role->id);
            }
        }
        $recipientIds = $recipients->pluck('users.id')->unique();

        $now = now();
        $rows = $recipientIds->map(function ($uid) use ($data, $now) {
            return [
                'user_id' => $uid,
                'title' => $data['title'] ?? null,
                'message' => $data['message'],
                'type' => $data['type'] ?? 'GENERAL',
                'is_read' => 0,
                'activity_id' => $data['activity_id'] ?? null,
                'session_id' => $data['session_id'] ?? null,
                'created_at' => $now,
            ];
        })->toArray();

        if (!empty($rows)) {
            DB::table('notifications')->insert($rows);
        }

        return response()->json([
            'success' => true,
            'sent_count' => count($rows),
        ]);
    }

    /**
     * Communicator: list all sent notifications grouped by message+timestamp.
     */
    public function adminList()
    {
        $rows = DB::table('notifications')
            ->select(
                'message', 'title', 'type', 'created_at',
                DB::raw('COUNT(*) AS recipient_count'),
                DB::raw('SUM(is_read) AS read_count')
            )
            ->groupBy('message', 'title', 'type', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(200)
            ->get();

        return response()->json(['success' => true, 'data' => $rows]);
    }
}
