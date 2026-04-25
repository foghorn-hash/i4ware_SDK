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

    public function index(Request $request)
    {
        $query = IssueTracker::with(['creator', 'assignee'])
            ->orderBy('created_at', 'desc');

        // Search by issue name
        $searchName = trim($request->input('name', ''));
        if ($searchName !== '') {
            $query->where('issue_name', 'LIKE', '%' . $searchName . '%');
        }

        // Pagination
        $perPage = (int) $request->input('per_page', 50);
        $page    = (int) $request->input('page', 1);

        $total  = $query->count();
        $issues = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

        return response()->json([
            'data'     => $issues,
            'total'    => $total,
            'page'     => $page,
            'per_page' => $perPage,
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'issue_name'  => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $issue = IssueTracker::create([
            'issue_name'  => $validated['issue_name'],
            'description' => $validated['description'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'status'      => 'todo',
            'created_by'  => auth()->id(),
        ]);

        return response()->json($issue->load(['creator', 'assignee']), 201);
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
}