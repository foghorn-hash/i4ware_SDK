<?php

namespace App\Http\Controllers;

use App\Models\Timesheet;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TimesheetController extends Controller
{

    public function __construct()
    {
        //$this->apiToken = uniqid(base64_encode(Str::random(40)));
        $this->middleware('auth:api');
    }

    private function sanitize(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $value = trim($value);
                $value = strip_tags($value);
                $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
                $data[$key] = mb_substr($value, 0, 2000);
            }
        }
        return $data;
    }

    
    // GET /api/timesheets
    public function index(Request $request)
    {
        $q = Timesheet::query();

        if ($request->filled('user_id'))  $q->where('user_id', $request->input('user_id'));
        if ($request->filled('domain'))   $q->where('domain',  $request->input('domain'));
        if ($request->filled('status'))   $q->where('status',  $request->input('status'));
        if ($request->filled('q')) {
            $q->where(function($s) use ($request) {
                $s->where('nimi', 'like', '%'.$request->q.'%')
                  ->orWhere('tyontekija', 'like', '%'.$request->q.'%');
            });
        }

        $perPage = (int) $request->input('per_page', 50);
        return response()->json($q->orderByDesc('id')->paginate($perPage));
    }

    // POST /api/timesheets
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'       => ['required','integer'],
            'nimi'          => ['required','string','max:255'],
            'tyontekija'    => ['required','string','max:255'],
            'ammattinimike' => ['nullable','string','max:255'],
            'status'        => ['nullable','in:Luotu,Hyväksytty,Hylätty'],
            'domain'        => ['nullable','string','max:255'],
        ]);

        $data = $this->sanitize($data);

        //jos frontend ei lähetä status/user_id, se luo niitä
        $data['status'] = $data['status'] ?? 'Luotu';
        $data['user_id'] = $data['user_id'] ?? auth()->id();

        $ts = Timesheet::create($data);
        return response()->json($ts, Response::HTTP_CREATED);
    }

    // GET /api/timesheets/{timesheet}
    public function show(Timesheet $timesheet)
    {
        // Halutessa rivit mukaan: ?with=rows
        if (request('with') === 'rows') {
            $timesheet->load(['rows' => function ($q) {
                $q->orderBy('row_no')->orderBy('pvm')->orderBy('id');
            }]);
        }
        return response()->json($timesheet);
    }

    // PUT /api/timesheets/{timesheet}
    public function update(Request $request, Timesheet $timesheet)
    {
        $data = $request->validate([
            'nimi'          => ['required','string','filled','max:255'],
            'tyontekija'    => ['required','string','filled','max:255'],
            'ammattinimike' => ['required','string','filled','max:255'],
            'status'        => ['nullable','in:Luotu,Hyväksytty,Hylätty'],
            'domain'        => ['nullable','string','max:255'],
        ]);

        $data = $this->sanitize($data);

        $fieldsToCheck = $data;
        unset($fieldsToCheck['timesheet_id'], $fieldsToCheck['row_no']);
        if (!collect($fieldsToCheck)->filter(fn($v) => !empty($v))->count()) {
            return response()->json(['error' => 'Lomake ei voi olla tyhjä'], 422);
        }

        $timesheet->update($data);
        return response()->json($timesheet);
    }

    // DELETE /api/timesheets/{timesheet}
    public function destroy(Timesheet $timesheet)
    {
        $timesheet->delete();
        return response()->json(['ok' => true]);
    }
}
