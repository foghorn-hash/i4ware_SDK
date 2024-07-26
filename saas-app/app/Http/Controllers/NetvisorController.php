<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\NetvisorAPIService;

class NetvisorController extends Controller
{
    protected $netvisorAPI;

    public function __construct(NetvisorAPIService $netvisorAPI)
    {
        $this->netvisorAPI = $netvisorAPI;
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
}
