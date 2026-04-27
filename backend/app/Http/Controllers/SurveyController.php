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
