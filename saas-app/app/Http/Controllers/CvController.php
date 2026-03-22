<?php

namespace App\Http\Controllers;

use App\Models\CvProfile;
use App\Models\CvSkill;
use App\Models\CvExperience;
use App\Models\CvEducation;
use App\Models\CvTraining;
use App\Models\CvReference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CvController extends Controller
{
    /**
     * Get the authenticated user's CV profile with all related data.
     */
    public function show()
    {
        $user = Auth::user();
        $cv = $user->cvProfile()->with([
            'skills',
            'experiences',
            'educations',
            'trainings',
            'references'
        ])->first();

        if (!$cv) {
            return response()->json(['message' => 'CV profile not found'], 404);
        }

        return response()->json($cv);
    }

    /**
     * Store or update the CV profile and all related data.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'summary' => 'nullable|string',
            'github_url' => 'nullable|url|max:255',
            'skills' => 'nullable|array',
            'skills.*.id' => 'nullable|integer',
            'skills.*.name' => 'required|string|max:255',
            'skills.*.level' => 'required|string|in:beginner,intermediate,advanced,expert',
            'skills.*.order' => 'nullable|integer',
            'workExperience' => 'nullable|array',
            'workExperience.*.id' => 'nullable|integer',
            'workExperience.*.company' => 'required|string|max:255',
            'workExperience.*.role' => 'required|string|max:255',
            'workExperience.*.start_date' => 'nullable|date',
            'workExperience.*.end_date' => 'nullable|date',
            'workExperience.*.currently_employed' => 'nullable|boolean',
            'workExperience.*.description' => 'nullable|string',
            'workExperience.*.order' => 'nullable|integer',
            'education' => 'nullable|array',
            'education.*.id' => 'nullable|integer',
            'education.*.institution' => 'required|string|max:255',
            'education.*.degree' => 'nullable|string|max:255',
            'education.*.field_of_study' => 'nullable|string|max:255',
            'education.*.start_date' => 'nullable|date',
            'education.*.end_date' => 'nullable|date',
            'education.*.description' => 'nullable|string',
            'education.*.order' => 'nullable|integer',
            'additionalTraining' => 'nullable|array',
            'additionalTraining.*.id' => 'nullable|integer',
            'additionalTraining.*.name' => 'required|string|max:255',
            'additionalTraining.*.provider' => 'nullable|string|max:255',
            'additionalTraining.*.start_date' => 'nullable|date',
            'additionalTraining.*.end_date' => 'nullable|date',
            'additionalTraining.*.description' => 'nullable|string',
            'additionalTraining.*.order' => 'nullable|integer',
            'references' => 'nullable|array',
            'references.*.id' => 'nullable|integer',
            'references.*.name' => 'required|string|max:255',
            'references.*.title' => 'nullable|string|max:255',
            'references.*.company' => 'nullable|string|max:255',
            'references.*.email' => 'nullable|email|max:255',
            'references.*.phone' => 'nullable|string|max:20',
            'references.*.description' => 'nullable|string',
            'references.*.order' => 'nullable|integer',
        ]);

        // Get or create CV profile
        $cv = $user->cvProfile()->firstOrCreate([]);

        // Update profile info
        $cv->update([
            'name' => $validated['name'] ?? $cv->name,
            'title' => $validated['title'] ?? $cv->title,
            'email' => $validated['email'] ?? $cv->email,
            'phone' => $validated['phone'] ?? $cv->phone,
            'location' => $validated['location'] ?? $cv->location,
            'summary' => $validated['summary'] ?? $cv->summary,
            'github_url' => $validated['github_url'] ?? $cv->github_url,
        ]);

        // Handle skills
        if (isset($validated['skills'])) {
            $this->syncSkills($cv, $validated['skills']);
        }

        // Handle work experience
        if (isset($validated['workExperience'])) {
            $this->syncExperiences($cv, $validated['workExperience']);
        }

        // Handle education
        if (isset($validated['education'])) {
            $this->syncEducations($cv, $validated['education']);
        }

        // Handle additional training
        if (isset($validated['additionalTraining'])) {
            $this->syncTrainings($cv, $validated['additionalTraining']);
        }

        // Handle references
        if (isset($validated['references'])) {
            $this->syncReferences($cv, $validated['references']);
        }

        return response()->json([
            'message' => 'CV profile updated successfully',
            'data' => $cv->load(['skills', 'experiences', 'educations', 'trainings', 'references'])
        ]);
    }

    /**
     * Sync skills.
     */
    private function syncSkills(CvProfile $cv, array $skills)
    {
        $existingIds = collect($skills)
            ->filter(fn($s) => isset($s['id']))
            ->pluck('id')
            ->toArray();

        // Delete skills not in the new list
        $cv->skills()->whereNotIn('id', $existingIds)->delete();

        // Create or update skills
        foreach ($skills as $index => $skill) {
            if (isset($skill['id'])) {
                CvSkill::find($skill['id'])->update([
                    'name' => $skill['name'],
                    'level' => $skill['level'],
                    'order' => $skill['order'] ?? $index,
                ]);
            } else {
                CvSkill::create([
                    'cv_profile_id' => $cv->id,
                    'name' => $skill['name'],
                    'level' => $skill['level'],
                    'order' => $skill['order'] ?? $index,
                ]);
            }
        }
    }

    /**
     * Sync experiences.
     */
    private function syncExperiences(CvProfile $cv, array $experiences)
    {
        $existingIds = collect($experiences)
            ->filter(fn($e) => isset($e['id']))
            ->pluck('id')
            ->toArray();

        $cv->experiences()->whereNotIn('id', $existingIds)->delete();

        foreach ($experiences as $index => $exp) {
            if (isset($exp['id'])) {
                CvExperience::find($exp['id'])->update([
                    'company' => $exp['company'],
                    'role' => $exp['role'],
                    'start_date' => $exp['start_date'] ?? null,
                    'end_date' => $exp['end_date'] ?? null,
                    'currently_employed' => $exp['currently_employed'] ?? false,
                    'description' => $exp['description'] ?? null,
                    'order' => $exp['order'] ?? $index,
                ]);
            } else {
                CvExperience::create([
                    'cv_profile_id' => $cv->id,
                    'company' => $exp['company'],
                    'role' => $exp['role'],
                    'start_date' => $exp['start_date'] ?? null,
                    'end_date' => $exp['end_date'] ?? null,
                    'currently_employed' => $exp['currently_employed'] ?? false,
                    'description' => $exp['description'] ?? null,
                    'order' => $exp['order'] ?? $index,
                ]);
            }
        }
    }

    /**
     * Sync educations.
     */
    private function syncEducations(CvProfile $cv, array $educations)
    {
        $existingIds = collect($educations)
            ->filter(fn($e) => isset($e['id']))
            ->pluck('id')
            ->toArray();

        $cv->educations()->whereNotIn('id', $existingIds)->delete();

        foreach ($educations as $index => $edu) {
            if (isset($edu['id'])) {
                CvEducation::find($edu['id'])->update([
                    'institution' => $edu['institution'],
                    'degree' => $edu['degree'] ?? null,
                    'field_of_study' => $edu['field_of_study'] ?? null,
                    'start_date' => $edu['start_date'] ?? null,
                    'end_date' => $edu['end_date'] ?? null,
                    'description' => $edu['description'] ?? null,
                    'order' => $edu['order'] ?? $index,
                ]);
            } else {
                CvEducation::create([
                    'cv_profile_id' => $cv->id,
                    'institution' => $edu['institution'],
                    'degree' => $edu['degree'] ?? null,
                    'field_of_study' => $edu['field_of_study'] ?? null,
                    'start_date' => $edu['start_date'] ?? null,
                    'end_date' => $edu['end_date'] ?? null,
                    'description' => $edu['description'] ?? null,
                    'order' => $edu['order'] ?? $index,
                ]);
            }
        }
    }

    /**
     * Sync trainings.
     */
    private function syncTrainings(CvProfile $cv, array $trainings)
    {
        $existingIds = collect($trainings)
            ->filter(fn($t) => isset($t['id']))
            ->pluck('id')
            ->toArray();

        $cv->trainings()->whereNotIn('id', $existingIds)->delete();

        foreach ($trainings as $index => $training) {
            if (isset($training['id'])) {
                CvTraining::find($training['id'])->update([
                    'name' => $training['name'],
                    'provider' => $training['provider'] ?? null,
                    'start_date' => $training['start_date'] ?? null,
                    'end_date' => $training['end_date'] ?? null,
                    'description' => $training['description'] ?? null,
                    'order' => $training['order'] ?? $index,
                ]);
            } else {
                CvTraining::create([
                    'cv_profile_id' => $cv->id,
                    'name' => $training['name'],
                    'provider' => $training['provider'] ?? null,
                    'start_date' => $training['start_date'] ?? null,
                    'end_date' => $training['end_date'] ?? null,
                    'description' => $training['description'] ?? null,
                    'order' => $training['order'] ?? $index,
                ]);
            }
        }
    }

    /**
     * Sync references.
     */
    private function syncReferences(CvProfile $cv, array $references)
    {
        $existingIds = collect($references)
            ->filter(fn($r) => isset($r['id']))
            ->pluck('id')
            ->toArray();

        $cv->references()->whereNotIn('id', $existingIds)->delete();

        foreach ($references as $index => $ref) {
            if (isset($ref['id'])) {
                CvReference::find($ref['id'])->update([
                    'name' => $ref['name'],
                    'title' => $ref['title'] ?? null,
                    'company' => $ref['company'] ?? null,
                    'email' => $ref['email'] ?? null,
                    'phone' => $ref['phone'] ?? null,
                    'description' => $ref['description'] ?? null,
                    'order' => $ref['order'] ?? $index,
                ]);
            } else {
                CvReference::create([
                    'cv_profile_id' => $cv->id,
                    'name' => $ref['name'],
                    'title' => $ref['title'] ?? null,
                    'company' => $ref['company'] ?? null,
                    'email' => $ref['email'] ?? null,
                    'phone' => $ref['phone'] ?? null,
                    'description' => $ref['description'] ?? null,
                    'order' => $ref['order'] ?? $index,
                ]);
            }
        }
    }

    /**
     * Delete the CV profile.
     */
    public function destroy()
    {
        $user = Auth::user();
        $user->cvProfile()->delete();

        return response()->json(['message' => 'CV profile deleted successfully']);
    }
}
