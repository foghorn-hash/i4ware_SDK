<?php

namespace App\Http\Controllers;

use App\Models\Timesheet;
use App\Models\TimesheetRow;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TimesheetRowController extends Controller
{
    public function __construct()
    {
        //$this->apiToken = uniqid(base64_encode(Str::random(40)));
        $this->middleware('auth:api');
    }
    // GET /api/timesheets/{timesheet}/rows
    public function index(Request $request, Timesheet $timesheet)
    {
        $q = TimesheetRow::where('timesheet_id', $timesheet->id);

        // Suodattimet
        if ($request->filled('status'))   $q->where('status', $request->status);
        if ($request->filled('project'))  $q->where('project', 'like', '%'.$request->project.'%');
        if ($request->filled('domain'))   $q->where('domain',  $request->domain);
        if ($request->filled('pvm_from')) $q->whereDate('pvm', '>=', $request->pvm_from);
        if ($request->filled('pvm_to'))   $q->whereDate('pvm', '<=', $request->pvm_to);

        $orderBy = $request->input('order_by', 'row_no,pvm,id'); // oletus järjestys
        foreach (explode(',', $orderBy) as $col) {
            $col = trim($col);
            if ($col) $q->orderBy($col);
        }

        $perPage = (int) $request->input('per_page', 100);
        return response()->json($q->paginate($perPage));
    }

    // POST /api/timesheets/{timesheet}/rows
    public function store(Request $request, Timesheet $timesheet)
    {
        $data = $this->validateRow($request, true);
        $data['timesheet_id'] = $timesheet->id;

        // Oletus: row_no seuraava vapaa
        $data['row_no'] = $data['row_no'] ?? ((int) TimesheetRow::where('timesheet_id',$timesheet->id)->max('row_no') + 1);

        $row = TimesheetRow::create($data);
        return response()->json($row, Response::HTTP_CREATED);
    }

    // GET /api/timesheets/{timesheet}/rows/{row}
    public function show(Timesheet $timesheet, TimesheetRow $row)
    {
        $this->assertBelongs($row, $timesheet);
        return response()->json($row);
    }

    // PUT /api/timesheets/{timesheet}/rows/{row}
    public function update(Request $request, Timesheet $timesheet, TimesheetRow $row)
    {
        $this->assertBelongs($row, $timesheet);
        $data = $this->validateRow($request, false);
        $row->update($data);
        return response()->json($row);
    }

    // DELETE /api/timesheets/{timesheet}/rows/{row}
    public function destroy(Timesheet $timesheet, TimesheetRow $row)
    {
        $this->assertBelongs($row, $timesheet);
        $row->delete();
        return response()->json(['ok' => true]);
    }

    private function assertBelongs(TimesheetRow $row, Timesheet $timesheet): void
    {
        abort_if($row->timesheet_id !== $timesheet->id, 404);
    }

    private function validateRow(Request $request, bool $creating): array
    {
        $rules = [
            'user_id'        => ['required','integer'],
            'timesheet_id'   => ['required', 'integer'],
            'row_no'         => ['nullable','integer','min:1'],

            'status'         => ['nullable','in:Luotu,Hyväksytty,Hylätty'],
            'project'        => ['nullable','string','max:255'],
            'pvm'            => ['nullable','date'],
            'klo_alku'       => ['nullable','date_format:H:i'],
            'klo_loppu'      => ['nullable','date_format:H:i'],

            'norm'           => ['nullable','numeric','min:0','max:999.99'],
            'lisat_la'       => ['nullable','numeric','min:0','max:999.99'],
            'lisat_su'       => ['nullable','numeric','min:0','max:999.99'],
            'lisat_ilta'     => ['nullable','numeric','min:0','max:999.99'],
            'lisat_yo'       => ['nullable','numeric','min:0','max:999.99'],
            'ylityo_vrk_50'  => ['nullable','numeric','min:0','max:999.99'],
            'ylityo_vrk_100' => ['nullable','numeric','min:0','max:999.99'],
            'ylityo_vko_50'  => ['nullable','numeric','min:0','max:999.99'],
            'ylityo_vko_100' => ['nullable','numeric','min:0','max:999.99'],
            'atv'            => ['nullable','numeric','min:0','max:999.99'],
            'matk'           => ['nullable','numeric','min:0','max:999.99'],

            // 'paivaraha_osa'  => ['nullable','boolean'],
            // 'paivaraha_koko' => ['nullable','boolean'],

            'ateriakorvaus'  => ['nullable','numeric','min:0','max:9999999.99'],
            'km'             => ['nullable','numeric','min:0','max:999999.99'],
            'tyokalukorvaus' => ['nullable','numeric','min:0','max:9999999.99'],

            'km_selite'      => ['nullable','string','max:500'],
            'huom'           => ['nullable','string'],
            'memo'           => ['nullable','string'],
            'domain'         => ['nullable','string','max:255'],
        ];

        return $request->validate($rules);
    }
}
