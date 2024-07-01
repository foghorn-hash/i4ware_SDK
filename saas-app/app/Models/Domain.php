<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Domain extends Model
{
    use HasFactory, SoftDeletes;

    public $table = "domains";

    /**
     * Write code on Method
     *
     * @return response()
     */
    protected $fillable = [
        'domain',
        'token',
    ];

    /**
     * Write code on Method
     *
     * @return response()
     */
    public function user()
    {
        return $this->belongsToMany(User::class);
    }

    /**
     * Write code on Method
     *
     * @return response()
     */
    public function messages()
    {
        return $this->belongsToMany(Message::class);
    }
    
}
