<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DocumentBank extends Model
{
    use SoftDeletes;

    protected $table = 'documentbank';

    protected $fillable = [
        'document_name',
        'document_file_path',
        'domain',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function domainRelation()
    {
        return $this->belongsTo(Domain::class, 'domain', 'domain');
    }
}