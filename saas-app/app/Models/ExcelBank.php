<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExcelBank extends Model
{
    use SoftDeletes;

    protected $table = 'excelbank';

    protected $fillable = [
        'document_name',
        'document_file_path',
        'domain',
        'user_id',
    ];
}