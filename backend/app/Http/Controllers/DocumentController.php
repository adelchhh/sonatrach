<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * Admin: list all documents with employee + activity context.
     * Filters: status, activity_id, session_id, search.
     */
    public function index(Request $request)
    {
        $q = DB::table('documents as d')
            ->join('registrations as r', 'r.id', '=', 'd.registration_id')
            ->join('users as u', 'u.id', '=', 'r.user_id')
            ->join('activity_sessions as s', 's.id', '=', 'r.session_id')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->leftJoin('users as v', 'v.id', '=', 'd.validated_by')
            ->select(
                'd.document_id as id',
                'd.registration_id',
                'd.file_name',
                'd.file_path',
                'd.document_type',
                'd.status',
                'd.validation_comment',
                'd.uploaded_at',
                'd.validated_at',
                'u.first_name as user_first_name',
                'u.name as user_last_name',
                'u.employee_number',
                'a.title as activity_title',
                's.id as session_id',
                'v.first_name as validator_first_name',
                'v.name as validator_last_name'
            );

        if ($status = $request->query('status')) {
            $q->where('d.status', strtoupper($status));
        }
        if ($activityId = $request->query('activity_id')) {
            $q->where('a.id', $activityId);
        }
        if ($sessionId = $request->query('session_id')) {
            $q->where('s.id', $sessionId);
        }
        if ($search = $request->query('search')) {
            $like = '%' . $search . '%';
            $q->where(function ($qb) use ($like) {
                $qb->where('u.employee_number', 'like', $like)
                   ->orWhere('u.name', 'like', $like)
                   ->orWhere('u.first_name', 'like', $like)
                   ->orWhere('d.file_name', 'like', $like)
                   ->orWhere('d.document_type', 'like', $like);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $q->orderBy('d.uploaded_at', 'desc')->get(),
        ]);
    }

    public function show($id)
    {
        $doc = Document::find($id);
        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Document not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $doc]);
    }

    public function validateDocument(Request $request, $id)
    {
        $data = $request->validate([
            'comment' => ['nullable', 'string', 'max:255'],
            'validated_by' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $doc = Document::findOrFail($id);
        $doc->status = 'VALIDATED';
        $doc->validation_comment = $data['comment'] ?? null;
        $doc->validated_by = $data['validated_by'] ?? null;
        $doc->validated_at = now();
        $doc->save();

        return response()->json(['success' => true, 'data' => $doc->fresh()]);
    }

    public function reject(Request $request, $id)
    {
        $data = $request->validate([
            'comment' => ['required', 'string', 'max:255'],
            'validated_by' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $doc = Document::findOrFail($id);
        $doc->status = 'REJECTED';
        $doc->validation_comment = $data['comment'];
        $doc->validated_by = $data['validated_by'] ?? null;
        $doc->validated_at = now();
        $doc->save();

        return response()->json(['success' => true, 'data' => $doc->fresh()]);
    }

    /**
     * Employee/admin upload of a document attached to a registration.
     */
    public function upload(Request $request, $registrationId)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx'],
            'document_type' => ['nullable', 'string', 'max:100'],
            'required_document_id' => ['nullable', 'integer', 'exists:required_documents,id'],
        ]);

        $registrationExists = DB::table('registrations')->where('id', $registrationId)->exists();
        if (!$registrationExists) {
            return response()->json(['success' => false, 'message' => 'Registration not found'], 404);
        }

        $file = $request->file('file');
        $path = $file->store("documents/{$registrationId}", 'public');

        $doc = Document::create([
            'registration_id' => $registrationId,
            'required_document_id' => $request->input('required_document_id'),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'document_type' => $request->input('document_type'),
            'uploaded_at' => now(),
            'status' => 'UPLOADED',
        ]);

        return response()->json(['success' => true, 'data' => $doc], 201);
    }
}
