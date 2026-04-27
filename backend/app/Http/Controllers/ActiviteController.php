<?php

namespace App\Http\Controllers;

use App\Models\Activite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ActiviteController extends Controller
{
    /**
     * GET /activities
     * Public list. Supports ?status=PUBLISHED, ?category=SPORT, ?include_all=1 (admin)
     */
    public function index(Request $request)
    {
        $query = Activite::query();

        if ($request->boolean('include_all')) {
            // admin view - all non-deleted
        } else {
            // public catalog only sees PUBLISHED
            $query->where('status', 'PUBLISHED');
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($search = $request->query('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        $activities = $query->orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }

    /**
     * GET /activities/{id}
     */
    public function show($id)
    {
        $activity = Activite::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $activity,
        ]);
    }

    /**
     * POST /activities
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'category' => ['required', Rule::in(Activite::CATEGORIES)],
            'minimum_seniority' => ['required', 'integer', 'min:0', 'max:50'],
            'draw_enabled' => ['required', 'boolean'],
            'demand_level' => ['required', Rule::in(Activite::DEMAND_LEVELS)],
            'status' => ['required', Rule::in(Activite::STATUSES)],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:4096'],
            'image_url' => ['nullable', 'string', 'max:500'],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('activities', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        unset($validated['image']);

        $activity = Activite::create($validated);

        return response()->json([
            'success' => true,
            'data' => $activity,
        ], 201);
    }

    /**
     * PUT /activities/{id}
     */
    public function update(Request $request, $id)
    {
        $activity = Activite::findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'category' => ['sometimes', 'required', Rule::in(Activite::CATEGORIES)],
            'minimum_seniority' => ['sometimes', 'required', 'integer', 'min:0', 'max:50'],
            'draw_enabled' => ['sometimes', 'required', 'boolean'],
            'demand_level' => ['sometimes', 'required', Rule::in(Activite::DEMAND_LEVELS)],
            'status' => ['sometimes', 'required', Rule::in(Activite::STATUSES)],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:4096'],
            'image_url' => ['nullable', 'string', 'max:500'],
        ]);

        if ($request->hasFile('image')) {
            // remove previous local image
            if ($activity->image_url && str_starts_with($activity->image_url, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $activity->image_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('activities', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        unset($validated['image']);

        $activity->update($validated);

        return response()->json([
            'success' => true,
            'data' => $activity->fresh(),
        ]);
    }

    /**
     * DELETE /activities/{id}  (soft delete)
     */
    public function destroy($id)
    {
        $activity = Activite::findOrFail($id);
        $activity->delete();

        return response()->json([
            'success' => true,
            'message' => 'Activity deleted successfully',
        ]);
    }

    /**
     * PATCH /activities/{id}/status
     * Body: { status: PUBLISHED | DRAFT | ARCHIVED | CANCELLED }
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(Activite::STATUSES)],
        ]);

        $activity = Activite::findOrFail($id);
        $activity->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'data' => $activity->fresh(),
        ]);
    }
}
