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
    public function getOrder($orderKey)
    {
        try {
            $response = $this->netvisorAPI->getOrder($orderKey);
            Log::info('Sales order response: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving sales order: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve sales order'], 500);
        }
    }

    public function deleteSalesInvoice($invoiceKey)
    {
        try {
            $response = $this->netvisorAPI->deleteSalesInvoice($invoiceKey);
            Log::info('Sales invoice deleted: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error deleting sales invoice: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete sales invoice'], 500);
        }
    }

    public function updateSalesInvoiceStatus(Request $request)
    {
        try {
            $statusData = $request->all();
            $response = $this->netvisorAPI->updateSalesInvoiceStatus($statusData);
            Log::info('Sales invoice status updated: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error updating sales invoice status: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update invoice status'], 500);
        }
    }

    public function getDeletedSalesInvoices()
    {
        try {
            $response = $this->netvisorAPI->getDeletedSalesInvoices();
            Log::info('Deleted sales invoices response: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving deleted invoices: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve deleted invoices'], 500);
        }
    }

    public function getDeletedSalesOrders()
    {
        try {
            $response = $this->netvisorAPI->getDeletedSalesOrders();
            Log::info('Deleted sales orders response: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving deleted orders: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve deleted orders'], 500);
        }
    }

    public function addSalesInvoiceComment(Request $request)
    {
        try {
            $commentData = $request->all();
            $response = $this->netvisorAPI->addSalesInvoiceComment($commentData);
            Log::info('Sales invoice comment added: ' . json_encode($response));
            return response()->json($response, 201);
        } catch (\Exception $e) {
            Log::error('Error adding invoice comment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add comment'], 500);
        }
    }

    public function getPaymentTerms()
    {
        try {
            $response = $this->netvisorAPI->getPaymentTerms();
            Log::info('Payment terms response: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving payment terms: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve payment terms'], 500);
        }
    }

    public function getSalesPersonnel()
    {
        try {
            $response = $this->netvisorAPI->getSalesPersonnel();
            Log::info('Sales personnel response: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving sales personnel: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve sales personnel'], 500);
        }
    }

    public function getSalesPayments()
    {
        try {
            $response = $this->netvisorAPI->getSalesPayments();
            Log::info('Sales payments response: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving sales payments: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve sales payments'], 500);
        }
    }

    public function addSalesPayment(Request $request)
    {
        try {
            $paymentData = $request->all();
            $response = $this->netvisorAPI->addSalesPayment($paymentData);
            Log::info('Sales payment added: ' . json_encode($response));
            return response()->json($response, 201);
        } catch (\Exception $e) {
            Log::error('Error adding sales payment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add payment'], 500);
        }
    }

    public function deleteSalesPayment(Request $request)
    {
        try {
            $netvisorKey = $request->input('netvisorkey');
            $response = $this->netvisorAPI->deleteSalesPayment($netvisorKey);
            Log::info('Sales payment deleted: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error deleting sales payment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete payment'], 500);
        }
    }

    public function getDeletedSalesPayments()
    {
        try {
            $response = $this->netvisorAPI->getDeletedSalesPayments();
            Log::info('Deleted sales payments response: ' . json_encode($response));
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error retrieving deleted payments: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve deleted payments'], 500);
        }
    }

    public function matchPayment(Request $request)
    {
        try {
            $matchData = $request->all();
            $response = $this->netvisorAPI->matchPayment($matchData);
            Log::info('Payment matched: ' . json_encode($response));
            return response()->json($response, 201);
        } catch (\Exception $e) {
            Log::error('Error matching payment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to match payment'], 500);
        }
    }
}
