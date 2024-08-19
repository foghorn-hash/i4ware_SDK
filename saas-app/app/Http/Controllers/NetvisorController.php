<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\NetvisorAPIService;
use Illuminate\Support\Facades\Log;

class NetvisorController extends Controller
{
    protected $netvisorAPI;

    public function __construct(NetvisorAPIService $netvisorAPI)
    {
        $this->netvisorAPI = $netvisorAPI;
    }

    public function test()
    {
        try {
            Log::info('Test method called');

            $data = $this->netvisorAPI->getSomeData();

            Log::info('Data retrieved from Netvisor API: ' . json_encode($data));

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Test method error: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred'], 500);
        }
    }

    public function getSalesInvoices()
    {
        try {
            $response = $this->netvisorAPI->getSalesInvoices();
            Log::info('Sales invoices response: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving sales invoices: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve sales invoices'], 500);
        }
    }
}
