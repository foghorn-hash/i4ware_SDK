<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WordBank extends Model
{
    use SoftDeletes;

    protected $table = 'wordbank';

    protected $fillable = [
        'document_name',
        'document_file_path',
        'domain',
        'user_id',
    ];
}