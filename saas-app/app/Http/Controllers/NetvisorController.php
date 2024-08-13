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

    public function getCustomers()
    {
        try {
            // Corrected endpoint for retrieving customer list
            $data = $this->netvisorAPI->sendRequest('GET', '/customerlist.nv');
            Log::info('Customers response: ' . json_encode($data));
            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Error retrieving customers: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve customers'], 500);
        }
    }

    public function getProducts()
    {
        try {
            $response = $this->netvisorAPI->sendRequest('GET', '/productlist.nv');
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving products: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve products'], 500);
        }
    }

    public function getInvoices()
    {
        try {
            $response = $this->netvisorAPI->sendRequest('GET', '/salesinvoicelist.nv');
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving invoices: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve invoices'], 500);
        }
    }

    public function createInvoice(Request $request)
    {
        try {
            $response = $this->netvisorAPI->sendRequest('POST', '/salesinvoice.nv?method=add', $request->all());
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error creating invoice: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create invoice'], 500);
        }
    }

    public function createCustomer(Request $request)
    {
        try {
            $response = $this->netvisorAPI->sendRequest('POST', '/customer.nv?method=add', $request->all());
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error creating customer: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create customer'], 500);
        }
    }

    public function createProduct(Request $request)
    {
        try {
            $response = $this->netvisorAPI->sendRequest('POST', '/product.nv?method=add', $request->all());
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create product'], 500);
        }
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
}
