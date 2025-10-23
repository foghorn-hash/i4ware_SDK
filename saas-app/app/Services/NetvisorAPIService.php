<?php

namespace App\Services;

use App\Models\NetvisorTransaction;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Spatie\ArrayToXml\ArrayToXml;

class NetvisorAPIService
{
    protected $client;
    protected $baseUrl;
    protected $sender;
    protected $customerId;
    protected $language;
    protected $organisationId;
    protected $transactionId;
    protected $customerKey;
    protected $partnerKey;
    protected $timestamp;
    protected $partnerId;

    public function __construct()
    {
        $this->baseUrl = config('netvisor.base_url');
        $this->sender = config('netvisor.sender');
        $this->customerId = config('netvisor.customer_id');
        $this->language = config('netvisor.language', 'FI');
        $this->organisationId = config('netvisor.organisation_id');
        $this->customerKey = config('netvisor.customer_key');
        $this->partnerKey = config('netvisor.partner_key');
        $this->partnerId = strtolower(config('netvisor.partner_id'));

        $this->transactionId = uniqid();
        date_default_timezone_set('UTC');
        $this->timestamp = now()->format('Y-m-d H:i:s.u');
        $this->timestamp = substr($this->timestamp, 0, 23); // Reduce the last numbers to 3

        $this->client = new Client([
            'timeout'  => 10.0,
        ]);
    }

    public function getMAC($url)
    {
        $parameters = array(
            $url,
            $this->sender,
            $this->customerId,
            $this->timestamp,
            $this->language,
            $this->organisationId,
            $this->transactionId,
            $this->customerKey,
            $this->partnerKey,
        );

        // Ensure all parameters are string type
        $parameters = array_map('strval', $parameters);

        // Encode all parameters to ISO-8859-15
        //$encodedParameters = array_map(function($param) {
            //$encodedParam = mb_convert_encoding($param, 'ISO-8859-15', 'UTF-8');
            //return $encodedParam;
        //}, $parameters);

        // Concatenate the encoded parameters into a single string
        $sha256string = implode('&', $parameters);
        
        // Calculate the HMAC using SHA-256
        $h_mac = hash("sha256", $sha256string);
        
        // Log the calculated HMAC for debugging purposes
        Log::info('Calculated HMAC: ' . $h_mac);

        // Return the calculated HMAC
        return $h_mac;
    }

    public function getHeaders($url)
    {
        $mac = $this->getMAC($url);

        return [
            'Content-Type' => 'text/plain',
            'X-Netvisor-Authentication-Sender' => $this->sender,
            'X-Netvisor-Authentication-CustomerId' => $this->customerId,
            'X-Netvisor-Authentication-PartnerId' => $this->partnerId,
            'X-Netvisor-Authentication-Timestamp' => $this->timestamp,
            'X-Netvisor-Authentication-TransactionId' => $this->transactionId,
            'X-Netvisor-Interface-Language' => $this->language,
            'X-Netvisor-Organisation-ID' => $this->organisationId,
            'X-Netvisor-Authentication-MAC' => $mac,
            'X-Netvisor-Authentication-MACHashCalculationAlgorithm' => 'SHA256',
        ];
    }

    public function saveTransaction()
    {
        NetvisorTransaction::create([
            'timestamp' => $this->timestamp,
            'language' => $this->language,
            'transaction_id' => $this->transactionId,
        ]);
    }

    public function sendRequest($method, $endpoint, $data = [], $sendAsXml = false)
    {
        $url = $this->baseUrl . $endpoint;

        try {
            $mac = $this->getMAC($url);
            $headers = $this->getHeaders($url);
            $options = ['headers' => $headers];

            if ($sendAsXml) {
                $xmlBody = ArrayToXml::convert($data, 'root', true, 'UTF-8'); // You can change 'root' to 'customer' if needed
                $options['body'] = $xmlBody;
                $options['headers']['Content-Type'] = 'text/xml';
            } else {
                $options['json'] = $data;
            }

            $response = $this->client->request($method, $url, $options);

            $this->saveTransaction();
        
            $body = $response->getBody()->getContents();
    
             // Parse the XML response
            $xml = simplexml_load_string($body, "SimpleXMLElement", LIBXML_NOCDATA);
            $json = json_encode($xml);
            $responseArray = json_decode($json, true);

            return $responseArray;
            // return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Netvisor API request failed', ['message' => $e->getMessage()]);
            return [
                'error' => true,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getCustomers()
    {
        return $this->sendRequest('GET', '/customerlist.nv');
    }
    
    public function getProducts()
    {
        return $this->sendRequest('GET', '/productlist.nv');
    }

    public function getSalesInvoices()
    {
        return $this->sendRequest('GET', '/salesinvoicelist.nv');
    }

    public function addCustomer(array $customerBaseInfo, array $finvoiceDetails = [], array $deliveryDetails = [], array $contactDetails = [], array $additionalInfo = [], array $dimensionDetails = [])
    {
        return $this->sendRequest('POST', '/customer.nv?method=add', [
            'customer' => [
                'customerbaseinformation' => $customerBaseInfo,
                'customerfinvoicedetails' => $finvoiceDetails,
                'customerdeliverydetails' => $deliveryDetails,
                'customercontactdetails' => $contactDetails,
                'customeradditionalinformation' => $additionalInfo,
                'customerdimensiondetails' => $dimensionDetails
            ]
        ]);
    }

    /**
     * Get customer details by Netvisor ID
     *
     * @param int $netvisorId
     * @return array
     */
    public function getCustomer($netvisorId)
    {
        return $this->sendRequest('GET', '/getcustomer.nv', [
            'id' => $netvisorId
        ]);
    }

    /**
     * Delete customer by Netvisor ID
     *
     * @param int $netvisorId
     * @return array
     */
    public function deleteCustomer($netvisorId)
    {
        return $this->sendRequest('GET', '/deletecustomer.nv', [
            'id' => $netvisorId
        ]);
    }

    /**
     * Add customer office details
     *
     * @param array $officeData
     * @return array
     */
    public function addCustomerOffice(array $officeData)
    {
        return $this->sendRequest('POST', '/office.nv', [
            'office' => $officeData
        ]);
    }

    /**
     * Add customer contact person
     *
     * @param array $contactPersonData
     * @return array
     */
    public function addContactPerson(array $contactPersonData)
    {
        return $this->sendRequest('POST', '/contactperson.nv', [
            'contactperson' => $contactPersonData
        ]);
    }

    /**
     * Create a sales invoice in Netvisor
     *
     * @param array $invoiceData
     * @param array $invoiceLines
     * @return array
     */
    public function createSalesInvoice(array $invoiceData, array $invoiceLines = [])
    {
        $invoice = [
            'salesinvoice' => [
                'salesinvoicedate' => $invoiceData['invoice_date'] ?? date('Y-m-d'),
                'salesinvoicedeliverydate' => $invoiceData['delivery_date'] ?? date('Y-m-d'),
                'salesinvoicereferencenumber' => $invoiceData['reference_number'] ?? '',
                'salesinvoiceamount' => $invoiceData['amount'] ?? 0,
                'salesinvoicevatamount' => $invoiceData['vat_amount'] ?? 0,
                'salesinvoicetotalamount' => $invoiceData['total_amount'] ?? 0,
                'salesinvoiceseller' => $invoiceData['seller'] ?? '',
                'invoicingstatus' => $invoiceData['status'] ?? 'unsent',
                'customernumber' => $invoiceData['customer_number'] ?? '',
                'customername' => $invoiceData['customer_name'] ?? '',
                'invoicelines' => [
                    'invoiceline' => $invoiceLines
                ]
            ]
        ];

        return $this->sendRequest('POST', '/salesinvoice.nv', $invoice, true);
    }

    /**
     * Get a specific sales invoice by Netvisor key
     *
     * @param string $netvisorKey
     * @return array
     */
    public function getSalesInvoice(string $netvisorKey)
    {
        return $this->sendRequest('GET', "/getsalesinvoice.nv?netvisorkey={$netvisorKey}");
    }

    // Add more methods as needed for other API endpoints
}