<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\NetvisorAPIService;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class NetvisorController extends Controller
{
    protected $user;
    protected $netvisorAPI;

    public function __construct(NetvisorAPIService $netvisorAPI)
    {
        $this->middleware("auth:api", ["except" => []]);
        $this->user = new User;
        $this->netvisorAPI = $netvisorAPI;
    }

    /**
     * Get list of customers from Netvisor
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomers()
    {
        try {
            $response = $this->netvisorAPI->getCustomers();
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving customers: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve customers'], 500);
        }
    }

    /**
     * Add a new customer to Netvisor
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addCustomer(Request $request)
    {
        try {
            $customerData = [
                'name' => $request->input('name'),
                'code' => $request->input('code'),
                'business_id' => $request->input('business_id'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'address' => $request->input('address'),
                'postcode' => $request->input('postcode'),
                'city' => $request->input('city'),
                'country' => $request->input('country', 'FI'),
                'auxiliary_name' => $request->input('auxiliary_name', ''),
                'is_active' => $request->input('is_active', 1),
            ];

            $response = $this->netvisorAPI->createCustomer($customerData);
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error adding customer: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add customer'], 500);
        }
    }

    /**
     * Create a new sales invoice in Netvisor
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createInvoice(Request $request)
    {
        try {
            $invoiceData = $request->input('invoice');
            $invoiceLines = $request->input('invoice_lines', []);

            $response = $this->netvisorAPI->createSalesInvoice($invoiceData, $invoiceLines);
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error creating invoice: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create invoice'], 500);
        }
    }

    /**
     * Get single invoice by Netvisor key
     *
     * @param string $netvisorKey
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInvoice($netvisorKey)
    {
        try {
            $response = $this->netvisorAPI->getSalesInvoice($netvisorKey);
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving invoice: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve invoice'], 500);
        }
    }
}
