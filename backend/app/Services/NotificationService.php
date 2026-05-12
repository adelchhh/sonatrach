<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class NotificationService
{
    /**
     * Push a notification to a single user.
     *
     * The friend's `notifications` table does NOT have activity_id / session_id columns,
     * so we silently drop those extras (kept in the signature for backward compat).
     * Title is required by the table schema so we default to "Notification" if null.
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
                'title' => $title ?? 'Notification',
                'message' => $message,
                'type' => self::normalizeType($type),
                'is_read' => 0,
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
                'title' => $title ?? 'Notification',
                'message' => $message,
                'type' => self::normalizeType($type),
                'is_read' => 0,
                'created_at' => $now,
            ];
        }
        DB::table('notifications')->insert($rows);
        return count($rows);
    }

    /**
     * The friend's notifications.type enum is:
     * GENERAL, SURVEY, ANNOUNCEMENT, DOCUMENT, DRAW, CONFIRMATION
     * Anything outside that set is mapped to GENERAL.
     */
    private static function normalizeType(string $type): string
    {
        $allowed = ['GENERAL', 'SURVEY', 'ANNOUNCEMENT', 'DOCUMENT', 'DRAW', 'CONFIRMATION'];
        return in_array($type, $allowed, true) ? $type : 'GENERAL';
    }
}
