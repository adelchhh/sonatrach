<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SurveyController extends Controller
{
    /**
     * List active surveys, optionally with the user's response status.
     * Active = status PUBLISHED + within start/end dates + audience matches.
     */
    public function index(Request $request)
    {
        $userId = (int) $request->query('user_id');
        $today = now()->toDateString();

        $surveys = DB::table('surveys as s')
            ->leftJoin('activities as a', 'a.id', '=', 's.activity_id')
            ->leftJoin('users as u', 'u.id', '=', 's.user_id')
            ->where('s.status', 'PUBLISHED')
            ->where('s.start_date', '<=', $today)
            ->where('s.end_date', '>=', $today)
            ->select(
                's.id', 's.title', 's.question', 's.start_date', 's.end_date',
                's.required', 's.audience',
                'a.title as activity_title',
                'u.first_name as author_first_name',
                'u.name as author_last_name'
            )
            ->orderBy('s.end_date')
            ->get();

        if ($userId) {
            $myResponses = DB::table('survey_responses')
                ->where('user_id', $userId)
                ->whereIn('survey_id', $surveys->pluck('id'))
                ->get(['survey_id', 'answer', 'answered_at'])
                ->keyBy('survey_id');

            $surveys = $surveys->map(function ($s) use ($myResponses) {
                $r = $myResponses->get($s->id);
                $s->my_response = $r ? $r->answer : null;
                $s->responded_at = $r ? $r->answered_at : null;
                return $s;
            });
        }

        return response()->json(['success' => true, 'data' => $surveys]);
    }

    /**
     * Communicator/admin: list ALL surveys (any status).
     */
    public function adminIndex(Request $request)
    {
        $q = DB::table('surveys as s')
            ->leftJoin('activities as a', 'a.id', '=', 's.activity_id')
            ->leftJoin('users as u', 'u.id', '=', 's.user_id')
            ->select(
                's.*',
                'a.title as activity_title',
                'u.first_name as author_first_name',
                'u.name as author_last_name',
                DB::raw('(SELECT COUNT(*) FROM survey_responses WHERE survey_id = s.id) AS responses_count')
            );

        if ($status = $request->query('status')) {
            $q->where('s.status', strtoupper($status));
        }

        return response()->json([
            'success' => true,
            'data' => $q->orderBy('s.created_at', 'desc')->get(),
        ]);
    }

    public function show($id)
    {
        $survey = DB::table('surveys')->where('id', $id)->first();
        if (!$survey) {
            return response()->json(['success' => false, 'message' => 'Survey not found'], 404);
        }
        $responses = DB::table('survey_responses as r')
            ->join('users as u', 'u.id', '=', 'r.user_id')
            ->where('r.survey_id', $id)
            ->select('r.id', 'r.answer', 'r.answered_at', 'u.first_name', 'u.name', 'u.employee_number')
            ->orderBy('r.answered_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => ['survey' => $survey, 'responses' => $responses],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'activity_id' => ['nullable', 'integer', 'exists:activities,id'],
            'title' => ['nullable', 'string', 'max:200'],
            'question' => ['required', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'required' => ['nullable', 'boolean'],
            'audience' => ['nullable', 'string', 'in:ALL,EMPLOYEES,FUNCTIONAL_ADMIN,COMMUNICATOR,SYSTEM_ADMIN'],
            'status' => ['nullable', 'string', 'in:DRAFT,PUBLISHED,ARCHIVED'],
        ]);

        $data['required'] = $data['required'] ?? false;
        $data['audience'] = $data['audience'] ?? 'ALL';
        $data['status'] = $data['status'] ?? 'DRAFT';
        $data['created_at'] = now();
        $data['updated_at'] = now();

        $id = DB::table('surveys')->insertGetId($data);

        return response()->json([
            'success' => true,
            'data' => DB::table('surveys')->where('id', $id)->first(),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $survey = DB::table('surveys')->where('id', $id)->first();
        if (!$survey) {
            return response()->json(['success' => false, 'message' => 'Survey not found'], 404);
        }

        $data = $request->validate([
            'activity_id' => ['nullable', 'integer', 'exists:activities,id'],
            'title' => ['nullable', 'string', 'max:200'],
            'question' => ['sometimes', 'required', 'string'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date'],
            'required' => ['nullable', 'boolean'],
            'audience' => ['nullable', 'string', 'in:ALL,EMPLOYEES,FUNCTIONAL_ADMIN,COMMUNICATOR,SYSTEM_ADMIN'],
            'status' => ['nullable', 'string', 'in:DRAFT,PUBLISHED,ARCHIVED'],
        ]);
        $data['updated_at'] = now();

        DB::table('surveys')->where('id', $id)->update($data);

        return response()->json([
            'success' => true,
            'data' => DB::table('surveys')->where('id', $id)->first(),
        ]);
    }

    public function destroy($id)
    {
        DB::table('survey_responses')->where('survey_id', $id)->delete();
        DB::table('surveys')->where('id', $id)->delete();
        return response()->json(['success' => true, 'message' => 'Survey deleted.']);
    }

    public function respond(Request $request, $surveyId)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'answer' => ['required', 'string', 'max:5000'],
        ]);

        // Check survey is open
        $survey = DB::table('surveys')->where('id', $surveyId)->first();
        if (!$survey || $survey->status !== 'PUBLISHED') {
            return response()->json(['success' => false, 'message' => 'Survey not available.'], 422);
        }

        $today = now()->toDateString();
        if ($today < $survey->start_date || $today > $survey->end_date) {
            return response()->json(['success' => false, 'message' => 'Survey is not currently open.'], 422);
        }

        // Upsert (one response per user per survey)
        $existing = DB::table('survey_responses')
            ->where('survey_id', $surveyId)
            ->where('user_id', $data['user_id'])
            ->first();

        if ($existing) {
            DB::table('survey_responses')
                ->where('id', $existing->id)
                ->update(['answer' => $data['answer'], 'answered_at' => now()]);
        } else {
            DB::table('survey_responses')->insert([
                'survey_id' => $surveyId,
                'user_id' => $data['user_id'],
                'answer' => $data['answer'],
                'answered_at' => now(),
            ]);
        }

        return response()->json(['success' => true, 'message' => 'Response saved.']);
    }
}
