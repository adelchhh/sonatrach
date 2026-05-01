<?php

namespace App\Http\Controllers;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AnnouncementController extends Controller
{
    public function publicIndex()
    {
        return Announcement::where('status', 'PUBLISHED')
            ->orderByDesc('publish_date')
            ->orderByDesc('created_at')
            ->get();
    }

    public function publicShow($id)
    {
        return Announcement::where('status', 'PUBLISHED')->findOrFail($id);
    }

    public function communicatorIndex()
    {
        return Announcement::orderByDesc('created_at')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'created_by' => 'nullable|integer|exists:users,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|in:DRAFT,PUBLISHED,ARCHIVED',
            'document' => 'nullable|file|max:10240',
        ]);
        
        $validated['publish_date'] = $validated['status'] === 'PUBLISHED'
            ? now()->toDateString()
            : null;

        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $path = $file->store('announcements', 'public');

            $validated['document_name'] = $file->getClientOriginalName();
            $validated['document_path'] = '/storage/' . $path;
        }

        $announcement = Announcement::create($validated);

        return response()->json($announcement, 201);
    }

    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);

        if ($announcement->document_path) {
            $storagePath = str_replace('/storage/', '', $announcement->document_path);
            Storage::disk('public')->delete($storagePath);
        }

        $announcement->delete();

        return response()->json([
            'message' => 'Announcement deleted successfully'
        ]);
    }


    

public function publish($id)
{
    $announcement = Announcement::findOrFail($id);

    if ($announcement->status === 'PUBLISHED') {
        return response()->json(['message' => 'Already published'], 400);
    }

    $announcement->update([
        'status' => 'PUBLISHED',
        'publish_date' => now()->toDateString(),
    ]);

    DB::table('notifications')->insert([
        'user_id' => null,
        'title' => 'New Announcement',
        'message' => $announcement->title,
        'type' => 'ANNOUNCEMENT',
        'is_read' => 0,
        'created_at' => now(),
    ]);

    return response()->json($announcement);
}

}