<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class NotificationService
{
    /**
     * Push a notification to a single user.
     */
    public static function push(
        int $userId,
        string $message,
        string $type = 'GENERAL',
        ?string $title = null,
        ?int $activityId = null,
        ?int $sessionId = null
    ): void {
        try {
            DB::table('notifications')->insert([
                'user_id' => $userId,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'is_read' => 0,
                'activity_id' => $activityId,
                'session_id' => $sessionId,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            \Log::warning('NotificationService failed: ' . $e->getMessage());
        }
    }

    /**
     * Push the same notification to many users.
     */
    public static function pushMany(
        array $userIds,
        string $message,
        string $type = 'GENERAL',
        ?string $title = null,
        ?int $activityId = null,
        ?int $sessionId = null
    ): int {
        if (empty($userIds)) {
            return 0;
        }
        $now = now();
        $rows = [];
        foreach (array_unique($userIds) as $uid) {
            $rows[] = [
                'user_id' => $uid,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'is_read' => 0,
                'activity_id' => $activityId,
                'session_id' => $sessionId,
                'created_at' => $now,
            ];
        }
        DB::table('notifications')->insert($rows);
        return count($rows);
    }
}
