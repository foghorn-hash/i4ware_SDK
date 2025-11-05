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
        $this->timestamp = substr($this->timestamp, 0, 23);

        $this->client = new Client([
            'timeout'  => 10.0,
        ]);
    }

    /**
     * Generate MAC hash for Netvisor API authentication
     *
     * @param string $url
     * @return string
     */
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

        $parameters = array_map('strval', $parameters);
        $sha256string = implode('&', $parameters);
        $h_mac = hash("sha256", $sha256string);

        Log::info('Calculated HMAC: ' . $h_mac);

        return $h_mac;
    }

    /**
     * Send HTTP request to Netvisor API
     *
     * @param string $endpoint
     * @param string $method
     * @param array|null $body
     * @return array
     */
    public function sendRequest($endpoint, $method = 'GET', $body = null)
    {
        $url = $this->baseUrl . $endpoint;
        $mac = $this->getMAC($url);

        $headers = [
            'X-Netvisor-Authentication-Sender' => $this->sender,
            'X-Netvisor-Authentication-CustomerId' => $this->customerId,
            'X-Netvisor-Authentication-PartnerId' => $this->partnerId,
            'X-Netvisor-Authentication-Timestamp' => $this->timestamp,
            'X-Netvisor-Authentication-TransactionId' => $this->transactionId,
            'X-Netvisor-Authentication-MAC' => $mac,
            'X-Netvisor-Interface-Language' => $this->language,
            'X-Netvisor-Organisation-ID' => $this->organisationId,
            'Content-Type' => 'text/xml; charset=utf-8'
        ];

        $options = [
            'headers' => $headers,
        ];

        if ($body) {
            $options['body'] = $body;
        }

        try {
            $response = $this->client->request($method, $url, $options);
            $xmlResponse = $response->getBody()->getContents();

            // Store transaction
            NetvisorTransaction::create([
                'timestamp' => $this->timestamp,
                'language' => $this->language,
                'transaction_id' => $this->transactionId,
            ]);

            return [
                'status' => 'success',
                'data' => simplexml_load_string($xmlResponse),
                'raw' => $xmlResponse
            ];

        } catch (RequestException $e) {
            Log::error('Netvisor API Error: ' . $e->getMessage());

            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get list of customers from Netvisor
     *
     * @return array
     */
    public function getCustomers()
    {
        return $this->sendRequest('/customerlist.nv', 'GET');
    }

    /**
     * Get single sales invoice by Netvisor key
     *
     * @param string $netvisorKey
     * @return array
     */
    public function getSalesInvoice($netvisorKey)
    {
        return $this->sendRequest('/getsalesinvoice.nv?netvisorkey=' . $netvisorKey, 'GET');
    }

    /**
     * Create new sales invoice in Netvisor
     *
     * @param array $invoiceData
     * @param array $invoiceLines
     * @return array
     */
    public function createSalesInvoice(array $invoiceData, array $invoiceLines = [])
    {
        // Build invoice XML structure
        $invoice = [
            'SalesInvoice' => [
                'SalesInvoiceDate' => $invoiceData['invoice_date'] ?? date('Y-m-d'),
                'SalesInvoiceDeliveryDate' => $invoiceData['delivery_date'] ?? date('Y-m-d'),
                'SalesInvoiceDueDate' => $invoiceData['due_date'] ?? date('Y-m-d', strtotime('+14 days')),
                'SalesInvoiceReferenceNumber' => $invoiceData['reference_number'] ?? '',
                'SalesInvoiceAmount' => $invoiceData['amount'] ?? 0,
                'SellerIdentifier' => $invoiceData['seller'] ?? '',
                'InvoiceStatus' => $invoiceData['status'] ?? 'unsent',
                'SalesInvoiceCustomerCode' => $invoiceData['customer_number'] ?? '',
                'InvoiceLines' => []
            ]
        ];

        // Add invoice lines
        foreach ($invoiceLines as $line) {
            $invoice['SalesInvoice']['InvoiceLines'][] = [
                'InvoiceLine' => [
                    'ProductName' => $line['product_name'] ?? '',
                    'ProductCode' => $line['product_code'] ?? '',
                    'Quantity' => $line['quantity'] ?? 1,
                    'UnitPrice' => $line['unit_price'] ?? 0,
                    'VatPercent' => $line['vat_percent'] ?? 25.5,
                    'Description' => $line['description'] ?? ''
                ]
            ];
        }

        $xml = ArrayToXml::convert($invoice, 'Root');

        return $this->sendRequest('/salesinvoice.nv', 'POST', $xml);
    }
}
