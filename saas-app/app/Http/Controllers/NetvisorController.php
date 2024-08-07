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

    public function getSomeData()
    {
        $response = $this->netvisorAPI->getSomeData();
        return response()->json($response);
    }

    public function getCustomers()
    {
        $response = $this->netvisorAPI->sendRequest('GET', '/customers');
        return response()->json($response);
    }

    public function getProducts()
    {
        $response = $this->netvisorAPI->sendRequest('GET', '/products');
        return response()->json($response);
    }

    public function getInvoices()
    {
        $response = $this->netvisorAPI->sendRequest('GET', '/invoices');
        return response()->json($response);
    }

    public function createInvoice(Request $request)
    {
        $response = $this->netvisorAPI->sendRequest('POST', '/create-invoice', $request->all());
        return response()->json($response);
    }

    public function createCustomer(Request $request)
    {
        $response = $this->netvisorAPI->sendRequest('POST', '/create-customer', $request->all());
        return response()->json($response);
    }

    public function createProduct(Request $request)
    {
        $response = $this->netvisorAPI->sendRequest('POST', '/create-product', $request->all());
        return response()->json($response);
    }

    public function test()
    {
        try {
            Log::info('Test method called');
            $netvisorAPI = new NetvisorAPIService();
            $data = $netvisorAPI->getSomeData();
            
            Log::info('Netvisor test data: ' . json_encode($data));
            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Test method error: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred'], 500);
        }
    }
}
