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
        'customer_code',
        'business_id',
        'phone',
        'email',
        'e_invoice_address',
        'e_invoice_operator',
        'is_active',
        'customer_group',
        'price_group',
        'invoice_language',
        'payment_term',
        'default_seller',
        'delivery_address',
        'delivery_postcode',
        'delivery_city',
        'delivery_country',
        'contact_person',
        'contact_person_phone',
        'contact_person_email',
        'private_customer',
        'last_synced_at',
        'is_synced',
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
