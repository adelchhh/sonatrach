<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SurveyController extends Controller
{
    private array $allowedAudiences = [
        'ALL', 'EMPLOYEES', 'FUNCTIONAL_ADMIN', 'COMMUNICATOR', 'SYSTEM_ADMIN',
    ];

    private array $allowedStatuses = [
        'DRAFT', 'PUBLISHED', 'ARCHIVED',
    ];

    /**
     * List surveys.
     * Default scope: employee active surveys.
     * Admin scope (?scope=admin): all surveys with filtering and response stats.
     */
    public function index(Request $request)
    {
        $scope = strtolower((string) $request->query('scope', 'employee'));

        if ($scope === 'admin') {
            $q = DB::table('surveys as s')
                ->leftJoin('activities as a', 'a.id', '=', 's.activity_id')
                ->leftJoin('users as u', 'u.id', '=', 's.user_id')
                ->leftJoin('survey_responses as sr', 'sr.survey_id', '=', 's.id')
                ->select(
                    's.id',
                    's.user_id',
                    's.activity_id',
                    's.title',
                    's.question',
                    's.start_date',
                    's.end_date',
                    's.required',
                    's.audience',
                    's.status',
                    's.created_at',
                    's.updated_at',
                    'a.title as activity_title',
                    'u.first_name as author_first_name',
                    'u.name as author_last_name',
                    DB::raw('COUNT(sr.id) AS total_responses')
                )
                ->groupBy(
                    's.id',
                    's.user_id',
                    's.activity_id',
                    's.title',
                    's.question',
                    's.start_date',
                    's.end_date',
                    's.required',
                    's.audience',
                    's.status',
                    's.created_at',
                    's.updated_at',
                    'a.title',
                    'u.first_name',
                    'u.name'
                );

            if ($status = $request->query('status')) {
                $q->where('s.status', strtoupper((string) $status));
            }

            if ($audience = $request->query('audience')) {
                $q->where('s.audience', strtoupper((string) $audience));
            }

            if ($search = trim((string) $request->query('q', ''))) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('s.title', 'like', '%' . $search . '%')
                        ->orWhere('s.question', 'like', '%' . $search . '%');
                });
            }

            return response()->json([
                'success' => true,
                'data' => $q->orderBy('s.created_at', 'desc')->get(),
            ]);
        }

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
     * Create a survey (draft or published).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'activity_id' => ['nullable', 'integer', 'exists:activities,id'],
            'title' => ['nullable', 'string', 'max:200'],
            'question' => ['required', 'string', 'max:10000'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'required' => ['nullable', 'boolean'],
            'audience' => ['nullable', 'string', 'in:' . implode(',', $this->allowedAudiences)],
            'status' => ['nullable', 'string', 'in:' . implode(',', $this->allowedStatuses)],
        ]);

        $id = DB::table('surveys')->insertGetId([
            'user_id' => $data['user_id'],
            'activity_id' => $data['activity_id'] ?? null,
            'title' => $data['title'] ?? null,
            'question' => $data['question'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'required' => $data['required'] ?? false,
            'audience' => $data['audience'] ?? 'ALL',
            'status' => $data['status'] ?? 'DRAFT',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => DB::table('surveys')->where('id', $id)->first(),
        ], 201);
    }

    /**
     * Show one survey with aggregate response count.
     */
    public function show($id)
    {
        $survey = DB::table('surveys as s')
            ->leftJoin('activities as a', 'a.id', '=', 's.activity_id')
            ->leftJoin('users as u', 'u.id', '=', 's.user_id')
            ->leftJoin('survey_responses as sr', 'sr.survey_id', '=', 's.id')
            ->where('s.id', $id)
            ->select(
                's.*',
                'a.title as activity_title',
                'u.first_name as author_first_name',
                'u.name as author_last_name',
                DB::raw('COUNT(sr.id) AS total_responses')
            )
            ->groupBy('s.id', 'a.title', 'u.first_name', 'u.name')
            ->first();

        if (!$survey) {
            return response()->json(['success' => false, 'message' => 'Survey not found.'], 404);
        }

        return response()->json(['success' => true, 'data' => $survey]);
    }

    /**
     * Update survey content.
     */
    public function update(Request $request, $id)
    {
        $survey = DB::table('surveys')->where('id', $id)->first();
        if (!$survey) {
            return response()->json(['success' => false, 'message' => 'Survey not found.'], 404);
        }

        $data = $request->validate([
            'activity_id' => ['nullable', 'integer', 'exists:activities,id'],
            'title' => ['nullable', 'string', 'max:200'],
            'question' => ['nullable', 'string', 'max:10000'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'required' => ['nullable', 'boolean'],
            'audience' => ['nullable', 'string', 'in:' . implode(',', $this->allowedAudiences)],
            'status' => ['nullable', 'string', 'in:' . implode(',', $this->allowedStatuses)],
        ]);

        $nextStartDate = $data['start_date'] ?? $survey->start_date;
        $nextEndDate = $data['end_date'] ?? $survey->end_date;
        if ($nextEndDate < $nextStartDate) {
            return response()->json([
                'success' => false,
                'message' => 'end_date must be after or equal to start_date.',
            ], 422);
        }

        $update = [];
        foreach (['activity_id', 'title', 'question', 'start_date', 'end_date', 'required', 'audience', 'status'] as $field) {
            if (array_key_exists($field, $data)) {
                $update[$field] = $data[$field];
            }
        }
        $update['updated_at'] = now();

        DB::table('surveys')->where('id', $id)->update($update);

        return response()->json([
            'success' => true,
            'data' => DB::table('surveys')->where('id', $id)->first(),
        ]);
    }

    /**
     * Update only survey status.
     */
    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:' . implode(',', $this->allowedStatuses)],
        ]);

        $updated = DB::table('surveys')
            ->where('id', $id)
            ->update([
                'status' => $data['status'],
                'updated_at' => now(),
            ]);

        if (!$updated) {
            return response()->json(['success' => false, 'message' => 'Survey not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => DB::table('surveys')->where('id', $id)->first(),
        ]);
    }

    /**
     * Delete a survey and all responses (cascade).
     */
    public function destroy($id)
    {
        $deleted = DB::table('surveys')->where('id', $id)->delete();
        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Survey not found.'], 404);
        }

        return response()->json(['success' => true]);
    }

    /**
     * List responses for a specific survey.
     */
    public function responses($id)
    {
        $exists = DB::table('surveys')->where('id', $id)->exists();
        if (!$exists) {
            return response()->json(['success' => false, 'message' => 'Survey not found.'], 404);
        }

        $rows = DB::table('survey_responses as sr')
            ->join('users as u', 'u.id', '=', 'sr.user_id')
            ->where('sr.survey_id', $id)
            ->select(
                'sr.id',
                'sr.survey_id',
                'sr.user_id',
                'sr.answer',
                'sr.answered_at',
                'u.first_name as responder_first_name',
                'u.name as responder_last_name',
                'u.employee_number'
            )
            ->orderBy('sr.answered_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $rows]);
    }

    public function respond(Request $request, $surveyId)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'answer' => ['required', 'string', 'max:60000'],
        ]);

        // Check survey is open
        $survey = DB::table('surveys')->where('id', $surveyId)->first();
        if (!$survey || $survey->status !== 'PUBLISHED') {
            return response()->json(['success' => false, 'message' => 'Survey not available.'], 422);
        }

        $today = now()->startOfDay();
        $startDate = Carbon::parse($survey->start_date)->startOfDay();
        $endDate = Carbon::parse($survey->end_date)->endOfDay();
        if ($today->lt($startDate) || $today->gt($endDate)) {
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
