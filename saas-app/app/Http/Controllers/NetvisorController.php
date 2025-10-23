<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\NetvisorAPIService;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Auth;

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

    public function addCustomer(Request $request)
    {

        $customerBaseInfo = [ // Base information about the customer is aggregated in a single 'customerbaseinformation' key
            'internalidentifier' => '', // automatic (if given and customer code is left empty, the next free customer number is used automatically)
            'externalidentifier' => '', // Business ID or private customer's social security number
            'organizationunitnumber' => 1, // OVT identifier (Receiver's OVT identifier, if the information differs from the company's business ID)
            'name' => 'New Customer',
            'nameextension' => 'NewCust',
            'streetaddress' => 'NewCust',
            'additionaladdressline' => '',
            'city' => 'Helsinki',
            'postnumber' => '00100',
            'country' => 'FI', // Country code (if not provided, Finland is the default) and country code format is ISO-3166
            'customergroupname' => '', // Customer group name, customer is linked to the group by name. If the group does not exist, it is created.
            'phonenumber' => '',
            'faxnumber' => '',
            'email' => '',
            'homepageuri' => '',
            'isactive' => 1, // 1 = active, 0 = inactive
            'isprivatecustomer' => 0, // 1 = private customer, 0 = business customer
            'emailinvoicingaddress' => '', // Email invoicing address, must be a valid email address. Can be provided as a list separated by ;
        ];

        $finvoiceDetails = [ // Aggregated in a single 'customerfinvoicedetails' key
            'finvoiceaddress' => '',
            'finvoiceroutercode' => '',
            
        ];

        $deliveryDetails = [ // Aggregated in a single 'customerdeliverydetails' key
            'deliveryname' => '',
            'deliverystreetaddress' => '',
            'deliverycity' => '',
            'deliverypostnumber' => '',
            'deliverycountry' => '', // Country code format, always ISO-3166
        ];

        $contactDetails = [ //  	Aggregated in a single 'customercontactdetails' key
            'contactname' => '',
            'contactperson' => '',
            'contactpersonemail' => '',
            'contactpersonphone' => '',
            'deliverycountry' => '',
            'defaultsellername' => '',
        ];

        $defaultsalesperson = [ // Aggregated in a single 'defaultsalesperson' key
            'salespersonid' => '', // Salesperson ID, if not provided, the default salesperson is used
        ];

        $additionalInfo = [
            'comment' => '',
            'customeragreementIdentifier' => '',
            'usecreditorreferencenumber' => '', // Use RF reference for invoicing, 1=on 0=off
            'useorderreferencenumber' => '', // Use order reference number for invoicing, 1=on 0=off
            'invoicinglanguage' => '', // Customer's invoicing language, FI, EN, or SE. If this information is not provided in the message, the default language for the invoice is Finnish
            'invoiceprintchannelformat' => 2, // Invoice print format, 1 = Invoice + bank transfer, 2 = Invoice
            'yourdefaultreference' => '',
            'defaulttextbeforeinvoicelines' => '',
            'defaulttextafterinvoicelines' => '',
            'defaultpaymentterm' => '',
            'defaultsecondname' => '',
            'paymentinterest' => '',
            'balancelimit' => '',
            'receivablesmanagementautomationrule' => '',
            'FactoringAccount' => '',
            'taxhandlingtype' => '',
            'eustandardfinvoice' => '',
            'defaultsalesperson' => $defaultsalesperson, // Default salesperson information
        ];

        $dimensionDetails = [
            'dimension' => [
                'dimensionname' => '',
                'dimensionitem' => '',
            ]
        ];
        
        try {
            $response = $this->netvisorAPI->addCustomer($customerBaseInfo, $finvoiceDetails, $deliveryDetails, $contactDetails, $additionalInfo, $dimensionDetails);
            Log::info('Customer added successfully: ' . json_encode($response));
            return response()->json($response, 201);
        } catch (\Exception $e) {
            Log::error('Error adding customer: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add customer'], 500);
        }
    }

    public function getCustomers()
    {
        try {
            $response = $this->netvisorAPI->getCustomers();
            Log::info('Customers response: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving customers: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve customers'], 500);
        }
    }

    public function getProducts()
    {
        try {
            $response = $this->netvisorAPI->getProducts();
            Log::info('Products response: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving products: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve products'], 500);
        }
    }

    public function createInvoice(Request $request)
    {
        try {
            $invoiceData = $request->input('invoice', []);
            $invoiceLines = $request->input('lines', []);

            $response = $this->netvisorAPI->createSalesInvoice($invoiceData, $invoiceLines);

            Log::info('Sales invoice created: ' . json_encode($response));
            return response()->json($response, 201);
        } catch (\Exception $e) {
            Log::error('Error creating sales invoice: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create sales invoice'], 500);
        }
    }

    public function getInvoice($netvisorKey)
    {
        try {
            $response = $this->netvisorAPI->getSalesInvoice($netvisorKey);
            Log::info('Sales invoice response: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving sales invoice: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve sales invoice'], 500);
        }
    }

    public function getCustomer($customerId)
    {
        try {
            $response = $this->netvisorAPI->getCustomer($customerId);
            Log::info('Customer details response: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving customer: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve customer'], 500);
        }
    }

    public function deleteCustomer($customerId)
    {
        try {
            $response = $this->netvisorAPI->deleteCustomer($customerId);
            Log::info('Customer deleted: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error deleting customer: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete customer'], 500);
        }
    }

    public function addCustomerOffice(Request $request)
    {
        try {
            $officeData = $request->all();
            $response = $this->netvisorAPI->addCustomerOffice($officeData);
            Log::info('Customer office added: ' . json_encode($response));
            return response()->json($response, 201);
        } catch (\Exception $e) {
            Log::error('Error adding customer office: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add customer office'], 500);
        }
    }

    public function addContactPerson(Request $request)
    {
        try {
            $contactPersonData = $request->all();
            $response = $this->netvisorAPI->addContactPerson($contactPersonData);
            Log::info('Contact person added: ' . json_encode($response));
            return response()->json($response, 201);
        } catch (\Exception $e) {
            Log::error('Error adding contact person: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add contact person'], 500);
        }
    }
}
