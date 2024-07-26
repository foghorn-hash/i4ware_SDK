<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'url',
        'sender',
        'customer_id',
        'timestamp',
        'language',
        'organisation_id',
        'transaction_id',
        'customer_key',
        'partner_key',
        'mac',
    ];
}
