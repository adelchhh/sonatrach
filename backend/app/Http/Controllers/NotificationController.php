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
            ->where(function ($query) use ($userId) {
                $query->where('n.user_id', $userId)
                      ->orWhereNull('n.user_id');
            })
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
/**
 * Communicator: send one global notification to all employees.
 */
public function send(Request $request)
{
    $data = $request->validate([
        'title' => ['required', 'string', 'max:200'],
        'message' => ['required', 'string', 'max:5000'],
    ]);

    $now = now();

    DB::table('notifications')->insert([
        'user_id' => null,
        'title' => $data['title'],
        'message' => $data['message'],
        'type' => 'GENERAL',
        'is_read' => 0,
        'created_at' => $now,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Notification sent to all employees',
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
