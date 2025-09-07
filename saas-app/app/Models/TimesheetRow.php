<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TimesheetRow extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'timesheet_id',
        'row_no',
        'status',
        'project',
        'pvm',
        'klo',
        'norm',
        'lisat_la',
        'lisat_su',
        'lisat_ilta',
        'lisat_yo',
        'ylityo_vrk_50',
        'ylityo_vrk_100',
        'ylityo_vko_50',
        'ylityo_vko_100',
        'atv',
        'matk',
        'paivaraha_osa',
        'paivaraha_koko',
        'ateriakorvaus',
        'km',
        'tyokalukorvaus',
        'km_selite',
        'huom',
        'memo',
        'domain',
    ];

    protected $casts = [
        'pvm'             => 'date',
        'klo'             => 'datetime:H:i',
        'paivaraha_osa'   => 'boolean',
        'paivaraha_koko'  => 'boolean',
        'norm'            => 'decimal:2',
        'lisat_la'        => 'decimal:2',
        'lisat_su'        => 'decimal:2',
        'lisat_ilta'      => 'decimal:2',
        'lisat_yo'        => 'decimal:2',
        'ylityo_vrk_50'   => 'decimal:2',
        'ylityo_vrk_100'  => 'decimal:2',
        'ylityo_vko_50'   => 'decimal:2',
        'ylityo_vko_100'  => 'decimal:2',
        'atv'             => 'decimal:2',
        'matk'            => 'decimal:2',
        'ateriakorvaus'   => 'decimal:2',
        'km'              => 'decimal:2',
        'tyokalukorvaus'  => 'decimal:2',
    ];

    public function timesheet()
    {
        return $this->belongsTo(Timesheet::class);
    }
}
