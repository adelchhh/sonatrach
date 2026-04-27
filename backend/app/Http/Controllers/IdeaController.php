<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IdeaController extends Controller
{
    private array $allowedCategories = [
        'ACTIVITIES', 'SERVICES', 'COMMUNICATION', 'WORKPLACE', 'WELLBEING',
    ];

    /**
     * Employee: list my own submitted ideas.
     */
    public function myIdeas(Request $request)
    {
        $userId = (int) $request->query('user_id');
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'user_id required'], 400);
        }

        $rows = DB::table('ideas')
            ->where('user_id', $userId)
            ->orderBy('submitted_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $rows]);
    }

    /**
     * Employee: submit a new idea.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'content' => ['required', 'string', 'max:2000'],
            'category' => ['nullable', 'string', 'in:' . implode(',', $this->allowedCategories)],
        ]);

        $id = DB::table('ideas')->insertGetId([
            'user_id' => $data['user_id'],
            'content' => $data['content'],
            'category' => $data['category'] ?? 'ACTIVITIES',
            'status' => 'UNDER_REVIEW',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => DB::table('ideas')->where('id', $id)->first(),
        ], 201);
    }

    /**
     * Communicator/admin: list all ideas (with author info).
     */
    public function index(Request $request)
    {
        $q = DB::table('ideas as i')
            ->join('users as u', 'u.id', '=', 'i.user_id')
            ->leftJoin('users as m', 'm.id', '=', 'i.moderated_by')
            ->select(
                'i.*',
                'u.first_name as author_first_name',
                'u.name as author_last_name',
                'u.employee_number',
                'm.first_name as moderator_first_name',
                'm.name as moderator_last_name'
            );

        if ($status = $request->query('status')) {
            $q->where('i.status', strtoupper($status));
        }
        if ($category = $request->query('category')) {
            $q->where('i.category', strtoupper($category));
        }

        return response()->json([
            'success' => true,
            'data' => $q->orderBy('i.submitted_at', 'desc')->get(),
        ]);
    }

    /**
     * Communicator: moderate an idea.
     */
    public function moderate(Request $request, $id)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:UNDER_REVIEW,ACCEPTED,ARCHIVED'],
            'moderator_response' => ['nullable', 'string', 'max:500'],
            'moderated_by' => ['required', 'integer', 'exists:users,id'],
        ]);

        DB::table('ideas')->where('id', $id)->update([
            'status' => $data['status'],
            'moderator_response' => $data['moderator_response'] ?? null,
            'moderated_by' => $data['moderated_by'],
            'moderated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => DB::table('ideas')->where('id', $id)->first(),
        ]);
    }
}
