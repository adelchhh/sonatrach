<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SurveyController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->query('user_id');

        $surveys = DB::table('surveys')
            ->whereIn('status', ['PUBLISHED', 'DRAFT', 'ARCHIVED'])
            ->orderByDesc('created_at')
            ->get();

        $surveyIds = $surveys->pluck('id');

        $options = DB::table('survey_options')
            ->whereIn('survey_id', $surveyIds)
            ->orderBy('id')
            ->get()
            ->groupBy('survey_id');

        $responses = collect();

        if ($userId) {
            $responses = DB::table('survey_responses')
                ->where('user_id', $userId)
                ->whereIn('survey_id', $surveyIds)
                ->get()
                ->keyBy('survey_id');
        }

        $data = $surveys->map(function ($survey) use ($options, $responses) {
            $response = $responses->get($survey->id);

            $survey->options = $options->get($survey->id, collect())->values();
            $survey->my_response = $response->answer ?? null;
            $survey->my_option_id = $response->option_id ?? null;

            return $survey;
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'deadline' => ['nullable', 'date'],
            'status' => ['required', 'string', 'in:DRAFT,PUBLISHED'],
            'question.text' => ['required', 'string'],
            'question.type' => ['required', 'string', 'in:single_choice,text'],
            'question.options' => ['nullable', 'array'],
            'question.options.*' => ['nullable', 'string', 'max:255'],
        ]);

        $surveyId = DB::table('surveys')->insertGetId([
            'title' => $data['title'],
            'question' => $data['question']['text'],
            'type' => $data['question']['type'] === 'single_choice' ? 'CHOICE' : 'TEXT',
            'status' => $data['status'],
            'start_date' => $data['status'] === 'PUBLISHED' ? now()->toDateString() : null,
            'end_date' => $data['deadline'] ?? null,
            'required' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if ($data['question']['type'] === 'single_choice') {
            foreach ($data['question']['options'] ?? [] as $option) {
                if (trim($option) !== '') {
                    DB::table('survey_options')->insert([
                        'survey_id' => $surveyId,
                        'option_text' => $option,
                        'created_at' => now(),
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Survey created',
            'id' => $surveyId,
        ], 201);
    }

    public function respond(Request $request, $id)
    {
        $survey = DB::table('surveys')->where('id', $id)->first();

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found',
            ], 404);
        }

        if ($survey->status !== 'PUBLISHED') {
            return response()->json([
                'success' => false,
                'message' => 'Survey is not published',
            ], 400);
        }

        $rules = [
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ];

        if ($survey->type === 'CHOICE') {
            $rules['option_id'] = ['required', 'integer', 'exists:survey_options,id'];
        } else {
            $rules['answer'] = ['required', 'string'];
        }

        $data = $request->validate($rules);

        if ($survey->type === 'CHOICE') {
            $optionBelongsToSurvey = DB::table('survey_options')
                ->where('id', $data['option_id'])
                ->where('survey_id', $id)
                ->exists();

            if (!$optionBelongsToSurvey) {
                return response()->json([
                    'success' => false,
                    'message' => 'Selected option does not belong to this survey',
                ], 400);
            }
        }

        $existing = DB::table('survey_responses')
            ->where('survey_id', $id)
            ->where('user_id', $data['user_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You already answered this survey',
            ], 409);
        }

        DB::table('survey_responses')->insert([
            'survey_id' => $id,
            'user_id' => $data['user_id'],
            'answer' => $survey->type === 'TEXT' ? $data['answer'] : null,
            'option_id' => $survey->type === 'CHOICE' ? $data['option_id'] : null,
            'answered_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Response submitted',
        ], 201);
    }

    public function publish($id)
    {
        DB::table('surveys')->where('id', $id)->update([
            'status' => 'PUBLISHED',
            'start_date' => now()->toDateString(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Survey published',
        ]);
    }

    public function archive($id)
    {
        DB::table('surveys')->where('id', $id)->update([
            'status' => 'ARCHIVED',
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Survey archived',
        ]);
    }

    public function destroy($id)
    {
        DB::table('survey_options')->where('survey_id', $id)->delete();
        DB::table('survey_responses')->where('survey_id', $id)->delete();
        DB::table('surveys')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Survey deleted',
        ]);
    }
}