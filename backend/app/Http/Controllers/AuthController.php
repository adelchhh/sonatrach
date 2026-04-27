<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'employee_number' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('employee_number', $request->employee_number)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $stored = $user->password;
        $provided = $request->password;

        // Accept either bcrypt-hashed or plaintext (seeded data uses plaintext).
        $isBcrypt = is_string($stored) && str_starts_with($stored, '$2y$');
        $passwordOk = $isBcrypt
            ? Hash::check($provided, $stored)
            : hash_equals($stored, $provided);

        if (!$passwordOk) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Auto-upgrade plaintext passwords to bcrypt on successful login.
        if (!$isBcrypt) {
            $user->password = Hash::make($provided);
            $user->save();
        }

        if (!$user->active) {
            return response()->json(['message' => 'Account is disabled'], 403);
        }

        $roles = DB::table('user_roles')
            ->join('roles', 'roles.id', '=', 'user_roles.role_id')
            ->where('user_roles.user_id', $user->id)
            ->pluck('roles.name')
            ->toArray();

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'first_name' => $user->first_name,
                'email' => $user->email,
                'employee_number' => $user->employee_number,
                'roles' => $roles,
                'active' => (bool) $user->active,
            ],
        ]);
    }
}
