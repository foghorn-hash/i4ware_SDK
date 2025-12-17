<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Timesheet extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'nimi',
        'tyontekija',
        'ammattinimike',
        'status',
        'domain',
    ];

    public function rows()
    {
        return $this->hasMany(TimesheetRow::class);
    }
}
