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
        
        Log::info('Original parameters: ', $parameters);

        // Ensure all parameters are string type
        $parameters = array_map('strval', $parameters);

        // Encode all parameters to ISO-8859-15
        // $encodedParameters = array_map(function($param) {
        // $encodedParam = mb_convert_encoding($param, 'ISO-8859-15', 'UTF-8');
        // return $encodedParam;
        // }, $parameters);

        // Concatenate the encoded parameters into a single string
        $sha256string = implode('&', $parameters);

        Log::info('Concatenated and encoded string for MAC: ' . $sha256string);
        
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
            'url' => $this->baseUrl,
            'sender' => $this->sender,
            'customer_id' => $this->customerId,
            'timestamp' => $this->timestamp,
            'language' => $this->language,
            'organisation_id' => $this->organisationId,
            'transaction_id' => $this->transactionId,
            'customer_key' => $this->customerKey,
            'partner_key' => $this->partnerKey,
            // 'partner_id' => $this->partnerId,
            'mac' => $this->getMAC($this->baseUrl)
        ]);
    }

    public function sendRequest($method, $endpoint, $data = [])
    {
        $url = $this->baseUrl . $endpoint;

        try {
            $mac = $this->getMAC($url);
            Log::info('MAC used in sendRequest: ' . $mac);
            Log::info('Sending request to Netvisor API', ['method' => $method, 'url' => $url, 'data' => $data]);
            $response = $this->client->request($method, $url, [
                'headers' => $this->getHeaders($url),
                'json' => $data,
            ]);

            $this->saveTransaction();
        
            $body = $response->getBody()->getContents();
            Log::info('Raw response body: ' . $body);
    
             // Parse the XML response
            $xml = simplexml_load_string($body, "SimpleXMLElement", LIBXML_NOCDATA);
            $json = json_encode($xml);
            $responseArray = json_decode($json, true);

            Log::info('Parsed Sales invoices response: ' . json_encode($responseArray));

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

    public function getSomeData()
    {
        try {
            $url = $this->baseUrl . '/customerlist.nv';
            
            $headers = $this->getHeaders($url);
            // Log the MAC explicitly in getSomeData
            $mac = $this->getMAC($url);
            Log::info('MAC used in getSomeData: ' . $mac);
            Log::info('Netvisor API request headers', $headers);
    
            $response = $this->client->get($url, [
                'headers' => $headers,
            ]);
    
            $body = $response->getBody()->getContents();
            $statusCode = $response->getStatusCode();
            $responseHeaders = $response->getHeaders();
    
            Log::info('Netvisor API response', [
                'url' => $url,
                'status_code' => $statusCode,
                'headers' => $responseHeaders,
                'body' => $body
            ]);
    
        // Convert the XML response to a PHP array
            $xml = simplexml_load_string($body, "SimpleXMLElement", LIBXML_NOCDATA);
            $json = json_encode($xml);
            $dataArray = json_decode($json, true);

            Log::info('Data retrieved from Netvisor API: ' . json_encode($dataArray));

            return $dataArray;
        } catch (RequestException $e) {
            Log::error('Netvisor API request failed', ['message' => $e->getMessage()]);
            return ['error' => 'Failed to connect to Netvisor API'];
        }
    }
    
    // Add more methods as needed for other API endpoints
}