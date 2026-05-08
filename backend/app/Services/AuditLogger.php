<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class AuditLogger
{
    /**
     * Record an admin action in the audit_logs table.
     *
     * @param int|null $userId  who performed the action
     * @param string $action    short verb, e.g. "REGISTRATION_VALIDATED"
     * @param string|null $targetTable
     * @param int|null $targetId
     * @param string|null $targetName
     * @param array|null $details extra metadata (will be JSON-encoded)
     * @param Request|null $request optional, used to capture IP
     */
    public static function log(
        ?int $userId,
        string $action,
        ?string $targetTable = null,
        ?int $targetId = null,
        ?string $targetName = null,
        ?array $details = null,
        ?Request $request = null
    ): void {
        try {
            DB::table('audit_logs')->insert([
                'user_id' => $userId,
                'action' => $action,
                'target_table' => $targetTable,
                'target_id' => $targetId,
                'target_name' => $targetName,
                'details' => $details ? json_encode($details) : null,
                'ip_address' => $request?->ip(),
                'action_date' => now(),
            ]);
        } catch (\Throwable $e) {
            // Never fail the parent transaction because of an audit log issue.
            \Log::warning('AuditLogger failed: ' . $e->getMessage());
        }
    }
}
