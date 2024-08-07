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
    protected $apiKey;
    protected $apiSecret;
    protected $sender;
    protected $customerId;
    protected $language;
    protected $organisationId;
    protected $transactionId;
    protected $customerKey;
    protected $partnerKey;

    public function __construct()
    {
        $this->baseUrl = config('netvisor.base_url');
        $this->apiKey = config('netvisor.api_key');
        $this->apiSecret = config('netvisor.api_secret');
        $this->sender = 'YourSender'; // Replace with actual sender value
        $this->customerId = 'YourCustomerID'; // Replace with actual customer ID
        $this->language = 'FI'; // Replace with actual language
        $this->organisationId = 'YourOrganisationID'; // Replace with actual organisation ID
        $this->transactionId = uniqid(); // Generate a unique transaction ID
        $this->customerKey = 'YourCustomerKey'; // Replace with actual customer key
        $this->partnerKey = 'YourPartnerKey'; // Replace with actual partner key
      
        $this->client = new Client([
            'base_url' => $this->baseUrl,
            'timeout'  => 10.0,
        ]);
    }

    public function getMAC()
    {
        $parameters = array(
            $this->baseUrl,
            $this->sender,
            $this->customerId,
            now()->timestamp,
            $this->language,
            $this->organisationId,
            $this->transactionId,
            $this->customerKey,
            $this->partnerKey
        );
        
        $parameters = array_map("strval", $parameters);
        return hash("sha256", implode("", $parameters));
    }

    public function saveTransaction()
    {
        $mac = $this->getMAC();
        Transaction::create([
            'url' => $this->baseUrl,
            'sender' => $this->sender,
            'customer_id' => $this->customerId,
            'timestamp' => now()->timestamp,
            'language' => $this->language,
            'organisation_id' => $this->organisationId,
            'transaction_id' => $this->transactionId,
            'customer_key' => $this->customerKey,
            'partner_key' => $this->partnerKey,
            'mac' => $mac,
        ]);
    }

    public function sendRequest($method, $endpoint, $data = [])
    {
        $url = $this->baseUrl . $endpoint;

        try {
            $response = $this->client->request($method, $url, [
                'headers' => $this->getHeaders(),
                'json' => $data,
            ]);

            $this->saveTransaction();

            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            return [
                'error' => true,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getSomeData()
    {
        try {
            $response = $this->client->get($this->baseUrl . '/some-endpoint', [
                'headers' => [
                    'API-KEY' => $this->apiKey,
                    'API-SECRET' => $this->apiSecret,
                ],
            ]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            Log::error('Netvisor API request failed', ['message' => $e->getMessage()]);
            return ['error' => 'Failed to connect to Netvisor API'];
        }
    }
    // Add more methods as needed for other API endpoints
}