<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    protected $fillable = ['invoice_id', 'description', 'hours_worked', 'hourly_rate', 'amount_excluding_vat'];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
