<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\InvoiceItem;

class SalesController extends Controller
{
    public function getAllSales()
    {
        // Retrieve all invoices with their items and customers
        $sales = Invoice::with(['items', 'customer'])
            ->get()
            ->map(function ($invoice) {
                return [
                    'invoice_number' => $invoice->invoice_number,
                    'customer_name' => $invoice->customer->name,
                    'total_excluding_vat' => $invoice->total_excluding_vat,
                    'vat_percentage' => $invoice->vat_percentage,
                    'total_including_vat' => $invoice->total_including_vat,
                    'due_date' => $invoice->due_date,
                    'status' => $invoice->status,
                    'items' => $invoice->items->map(function ($item) {
                        return [
                            'description' => $item->description,
                            'hours_worked' => $item->hours_worked,
                            'hourly_rate' => $item->hourly_rate,
                            'amount_excluding_vat' => $item->amount_excluding_vat,
                        ];
                    }),
                ];
            });

        return response()->json($sales);
    }
}
