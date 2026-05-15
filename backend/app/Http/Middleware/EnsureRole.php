<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Role-based authorization middleware.
 *
 * Resolves the current user from the X-User-Id header (front-end sends it
 * once Sanctum is wired up; for now it falls back to a `user_id` query
 * param). Then checks the user actually carries one of the required roles
 * in the `user_roles` / `roles` tables.
 *
 * Apply with :  Route::get(...)->middleware('role:FUNCTIONAL_ADMIN');
 * or multi-role :  ->middleware('role:FUNCTIONAL_ADMIN,SYSTEM_ADMIN');
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $userId = (int) ($request->header('X-User-Id') ?: $request->query('user_id'));

        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required (X-User-Id header missing).',
            ], 401);
        }

        $userRoles = DB::table('user_roles as ur')
            ->join('roles as r', 'r.id', '=', 'ur.role_id')
            ->where('ur.user_id', $userId)
            ->pluck('r.name')
            ->all();

        if (empty($userRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'No role assigned to this user.',
            ], 403);
        }

        $allowed = array_intersect($roles, $userRoles);
        if (empty($allowed)) {
            return response()->json([
                'success' => false,
                'message' => 'This action requires one of: ' . implode(', ', $roles),
                'your_roles' => $userRoles,
            ], 403);
        }

        // Pass user info forward for downstream controllers
        $request->merge(['_auth_user_id' => $userId, '_auth_roles' => $userRoles]);

        return $next($request);
    }
}
