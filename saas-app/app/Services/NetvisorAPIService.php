<?php

namespace App\Services;

use App\Models\Transaction;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

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
        Transaction::create([
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
        return $this->sendtRequest('GET', '/productlist.nv');
    }

    public function getSalesInvoices()
    {
        return $this->sendRequest('GET', '/salesinvoicelist.nv');
    }

    public function addCustomer(array $customerBaseInfo, array $finvoiceDetails = [], array $deliveryDetails = [], array $contactDetails = [], array $additionalInfo = [], array $dimensionDetails = [])
    {
        return $this->sendRequest('POST', '/customer.nv?method=add', [
            'customer' => [ // Customer details is aggregated in a single 'customer' key
                'customerbaseinformation' => $customerBaseInfo, // Base information about the customer
                ],[
                'customerfinvoicedetails' => $finvoiceDetails, // Aggregated in a single 'customerfinvoicedetails' key
                ],[
                'customerdeliverydetails' => $deliveryDetails
                ],[
                'customercontactdetails' => $contactDetails
                ],[
                'customeradditionalinformation' => $additionalInfo
                ],[
                'customerdimensiondetails' => [
                        $dimensionDetails
                    ]
                ],
            ]          
        );
    }
    
    // Add more methods as needed for other API endpoints
}