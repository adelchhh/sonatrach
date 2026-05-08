<?php

namespace App\Http\Controllers;

use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SystemRoleController extends Controller
{
    private function usersByRole($roleName)
    {
        $role = DB::table('roles')->where('name', $roleName)->first();

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => "Role {$roleName} not found"
            ], 404);
        }

        $users = DB::table('users')
            ->join('user_roles', 'users.id', '=', 'user_roles.user_id')
            ->where('user_roles.role_id', $role->id)
            ->select(
                'users.id',
                'users.name',
                'users.first_name',
                'users.email',
                'users.employee_number',
                'users.active'
            )
            ->orderBy('users.name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    private function assignRole($userId, $roleName, ?Request $request = null)
    {
        $role = DB::table('roles')->where('name', $roleName)->first();

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => "Role {$roleName} not found"
            ], 404);
        }

        $user = DB::table('users')->where('id', $userId)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $exists = DB::table('user_roles')
            ->where('user_id', $userId)
            ->where('role_id', $role->id)
            ->exists();

        if (!$exists) {
            DB::table('user_roles')->insert([
                'user_id' => $userId,
                'role_id' => $role->id,
                'assigned_by' => $request?->input('assigned_by'),
            ]);

            AuditLogger::log(
                (int) $request?->input('assigned_by') ?: null,
                'ROLE_ASSIGNED_' . $roleName,
                'user_roles',
                $userId,
                trim(($user->first_name ?? '') . ' ' . ($user->name ?? '')),
                ['role' => $roleName],
                $request
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Role assigned successfully'
        ]);
    }

    private function removeRole($userId, $roleName, ?Request $request = null)
    {
        $role = DB::table('roles')->where('name', $roleName)->first();

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => "Role {$roleName} not found"
            ], 404);
        }

        if ($roleName === 'SYSTEM_ADMIN') {
            $systemAdminCount = DB::table('user_roles')
                ->where('role_id', $role->id)
                ->count();

            if ($systemAdminCount <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'At least one System Admin must remain active.'
                ], 400);
            }
        }

        $user = DB::table('users')->where('id', $userId)->first();

        $deleted = DB::table('user_roles')
            ->where('user_id', $userId)
            ->where('role_id', $role->id)
            ->delete();

        if ($deleted > 0 && $user) {
            AuditLogger::log(
                (int) $request?->input('removed_by') ?: null,
                'ROLE_REMOVED_' . $roleName,
                'user_roles',
                $userId,
                trim(($user->first_name ?? '') . ' ' . ($user->name ?? '')),
                ['role' => $roleName],
                $request
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Role removed successfully'
        ]);
    }

    public function functionalAdmins()
    {
        return $this->usersByRole('FUNCTIONAL_ADMIN');
    }

    public function communicators()
    {
        return $this->usersByRole('COMMUNICATOR');
    }

    public function systemAdmins()
    {
        return $this->usersByRole('SYSTEM_ADMIN');
    }

    public function searchEmployee(Request $request)
    {
        $query = $request->query('query');

        if (!$query) {
            return response()->json([
                'success' => false,
                'message' => 'Search query is required'
            ], 400);
        }

        $user = DB::table('users')
            ->where('employee_number', $query)
            ->orWhere('id', $query)
            ->select(
                'id',
                'name',
                'first_name',
                'email',
                'employee_number',
                'active'
            )
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function assignFunctionalAdmin(Request $request, $userId)
    {
        return $this->assignRole($userId, 'FUNCTIONAL_ADMIN', $request);
    }

    public function removeFunctionalAdmin(Request $request, $userId)
    {
        return $this->removeRole($userId, 'FUNCTIONAL_ADMIN', $request);
    }

    public function assignCommunicator(Request $request, $userId)
    {
        return $this->assignRole($userId, 'COMMUNICATOR', $request);
    }

    public function removeCommunicator(Request $request, $userId)
    {
        return $this->removeRole($userId, 'COMMUNICATOR', $request);
    }

    public function assignSystemAdmin(Request $request, $userId)
    {
        return $this->assignRole($userId, 'SYSTEM_ADMIN', $request);
    }

    public function removeSystemAdmin(Request $request, $userId)
    {
        return $this->removeRole($userId, 'SYSTEM_ADMIN', $request);
    }

    public function auditLogs(Request $request)
    {
        $q = DB::table('audit_logs as a')
            ->leftJoin('users as u', 'u.id', '=', 'a.user_id')
            ->select(
                'a.id', 'a.user_id', 'a.action', 'a.target_table',
                'a.target_id', 'a.target_name', 'a.details',
                'a.ip_address', 'a.action_date',
                'u.first_name as user_first_name',
                'u.name as user_last_name',
                'u.employee_number'
            );

        if ($action = $request->query('action')) {
            $q->where('a.action', 'like', $action . '%');
        }
        if ($userId = $request->query('user_id')) {
            $q->where('a.user_id', $userId);
        }
        if ($targetTable = $request->query('target_table')) {
            $q->where('a.target_table', $targetTable);
        }
        if ($from = $request->query('from')) {
            $q->where('a.action_date', '>=', $from);
        }
        if ($to = $request->query('to')) {
            $q->where('a.action_date', '<=', $to);
        }

        $rows = $q->orderBy('a.action_date', 'desc')->limit(500)->get();

        // decode details JSON for convenience
        $rows = $rows->map(function ($r) {
            if ($r->details) {
                $decoded = json_decode($r->details, true);
                $r->details = is_array($decoded) ? $decoded : $r->details;
            }
            return $r;
        });

        return response()->json(['success' => true, 'data' => $rows]);
    }
}