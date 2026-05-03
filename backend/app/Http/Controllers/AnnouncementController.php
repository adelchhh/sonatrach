<?php

namespace App\Http\Controllers;

use App\Models\OfficialNote;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnnouncementController extends Controller
{
    private array $allowedTypes = [
        'OFFICIAL', 'GENERAL', 'REMINDER', 'EVENT', 'HEALTH', 'SOCIAL', 'SURVEY',
    ];
    private array $allowedAudiences = [
        'ALL', 'EMPLOYEES', 'FUNCTIONAL_ADMIN', 'COMMUNICATOR', 'SYSTEM_ADMIN',
    ];
    private array $allowedStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

    /**
     * Communicator/admin: list all notes (any status).
     */
    public function index(Request $request)
    {
        $q = DB::table('official_notes as n')
            ->leftJoin('users as u', 'u.id', '=', 'n.user_id')
            ->select(
                'n.note_id as id',
                'n.title', 'n.content', 'n.type', 'n.audience',
                'n.attachment_url', 'n.status', 'n.published_at',
                'n.created_at', 'n.updated_at',
                'u.first_name as author_first_name',
                'u.name as author_last_name'
            );

        if ($status = $request->query('status')) {
            $q->where('n.status', strtoupper($status));
        }
        if ($type = $request->query('type')) {
            $q->where('n.type', strtoupper($type));
        }
        if ($search = $request->query('search')) {
            $like = '%' . $search . '%';
            $q->where(function ($qb) use ($like) {
                $qb->where('n.title', 'like', $like)
                   ->orWhere('n.content', 'like', $like);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $q->orderBy('n.created_at', 'desc')->get(),
        ]);
    }

    /**
     * Public: list only PUBLISHED announcements visible to ALL or EMPLOYEES.
     */
    public function publicIndex()
    {
        $rows = DB::table('official_notes')
            ->where('status', 'PUBLISHED')
            ->whereIn('audience', ['ALL', 'EMPLOYEES'])
            ->orderBy('published_at', 'desc')
            ->limit(50)
            ->get([
                'note_id as id', 'title', 'content', 'type',
                'attachment_url', 'published_at',
            ]);

        return response()->json(['success' => true, 'data' => $rows]);
    }

    public function show($id)
    {
        $note = OfficialNote::find($id);
        if (!$note) {
            return response()->json(['success' => false, 'message' => 'Announcement not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $note]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string'],
            'type' => ['nullable', 'string', 'in:' . implode(',', $this->allowedTypes)],
            'audience' => ['nullable', 'string', 'in:' . implode(',', $this->allowedAudiences)],
            'attachment_url' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'string', 'in:' . implode(',', $this->allowedStatuses)],
        ]);

        $data['type'] = $data['type'] ?? 'GENERAL';
        $data['audience'] = $data['audience'] ?? 'ALL';
        $data['status'] = $data['status'] ?? 'DRAFT';
        if ($data['status'] === 'PUBLISHED') {
            $data['published_at'] = now();
        }

        $note = OfficialNote::create($data);

        return response()->json(['success' => true, 'data' => $note], 201);
    }

    public function update(Request $request, $id)
    {
        $note = OfficialNote::findOrFail($id);

        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'content' => ['sometimes', 'required', 'string'],
            'type' => ['nullable', 'string', 'in:' . implode(',', $this->allowedTypes)],
            'audience' => ['nullable', 'string', 'in:' . implode(',', $this->allowedAudiences)],
            'attachment_url' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'string', 'in:' . implode(',', $this->allowedStatuses)],
        ]);

        if (isset($data['status']) && $data['status'] === 'PUBLISHED' && $note->status !== 'PUBLISHED') {
            $data['published_at'] = now();
        }

        $note->update($data);

        return response()->json(['success' => true, 'data' => $note->fresh()]);
    }

    public function destroy($id)
    {
        $note = OfficialNote::findOrFail($id);
        $note->delete();
        return response()->json(['success' => true, 'message' => 'Announcement deleted.']);
    }

    public function publish(Request $request, $id)
    {
        $note = OfficialNote::findOrFail($id);
        $note->status = 'PUBLISHED';
        $note->published_at = now();
        $note->save();

        AuditLogger::log(
            (int) ($request->input('user_id') ?? $request->query('user_id')) ?: $note->user_id,
            'ANNOUNCEMENT_PUBLISHED',
            'official_notes',
            $note->note_id,
            $note->title,
            null,
            $request
        );

        return response()->json(['success' => true, 'data' => $note->fresh()]);
    }

    public function archive(Request $request, $id)
    {
        $note = OfficialNote::findOrFail($id);
        $note->status = 'ARCHIVED';
        $note->save();

        AuditLogger::log(
            (int) ($request->input('user_id') ?? $request->query('user_id')) ?: $note->user_id,
            'ANNOUNCEMENT_ARCHIVED',
            'official_notes',
            $note->note_id,
            $note->title,
            null,
            $request
        );

        return response()->json(['success' => true, 'data' => $note->fresh()]);
    }
}
