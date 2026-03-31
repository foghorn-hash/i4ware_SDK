<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\IssueTracker;
use App\Models\User;
use Illuminate\Http\Request;

class IssueTrackerController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index()
    {
        $issues = IssueTracker::with(['creator', 'assignee'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($issues);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'issue_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $issue = IssueTracker::create([
            'issue_name' => $validated['issue_name'],
            'description' => $validated['description'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'status' => 'todo',          // plain string, no enum needed
            'created_by' => auth()->id(),
        ]);

        return response()->json($issue->load(['creator', 'assignee']), 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:todo,in_progress,done',
        ]);

        $issue = IssueTracker::findOrFail($id);
        $issue->update(['status' => $validated['status']]);

        return response()->json($issue->load(['creator', 'assignee']));
    }

    public function assign(Request $request, $id)
    {
        $validated = $request->validate([
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $issue = IssueTracker::findOrFail($id);
        $issue->update(['assigned_to' => $validated['assigned_to']]);

        return response()->json($issue->load('assignee'));
    }

    public function users()
    {
        $users = User::select('id', 'name', 'email')->get();

        return response()->json($users);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'description' => 'nullable|string',
        ]);

        $issue = IssueTracker::findOrFail($id);
        $issue->update($validated);

        return response()->json($issue->load(['creator', 'assignee']));
    }
}