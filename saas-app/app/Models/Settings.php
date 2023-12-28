<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Settings extends Model
{
    use HasFactory;
    protected $table = 'settings';
    public $timestamps = true; 

    protected $fillable = [
        'setting_key',
        'setting_value'
    ];

}
