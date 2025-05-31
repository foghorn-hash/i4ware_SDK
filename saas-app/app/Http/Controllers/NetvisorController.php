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
}
