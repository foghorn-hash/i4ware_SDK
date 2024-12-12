<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AtlassianSalesController extends Controller
{

    public function getTransactions()
    {
        // Set response header type
        return response()->json($this->fetchTransactions());
    }

    public function getSalesReport()
    {
        // Configurations
        $vendorId = env('ATLASSIAN_VENDOR_ID');
        $username = env('ATLASSIAN_USERNAME');
        $password = env('ATLASSIAN_PASSWORD');

        $uri = "https://marketplace.atlassian.com/rest/2/vendors/{$vendorId}/reporting/sales/transactions/export";

        // Make GET request with basic authentication
        $response = Http::withBasicAuth($username, $password)
            ->timeout(60)
            ->accept('application/json')
            ->get($uri, [
                'accept' => 'json',
                'order' => 'asc',
            ]);

        // Check if response is successful
        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to fetch data from Atlassian API'], $response->status());
        }

        $transactions = $response->json();

        // Initialize variables
        $json = ['root' => []];
        $yearData = ['root' => []];

        foreach ($transactions as $transaction) {
            $vendorAmount = number_format((float)($transaction['purchaseDetails']['vendorAmount'] ?? 0), 2, '.', '');
            $saleDate = $transaction['purchaseDetails']['saleDate'] ?? null;

            if ($saleDate) {
                $saleYear = date("Y", strtotime($saleDate));

                // Aggregate balanceVendor per year
                if (!isset($json['root'][$saleYear])) {
                    $json['root'][$saleYear] = [
                        'balanceVendor' => 0,
                        'saleYear' => $saleYear,
                    ];
                }

                $json['root'][$saleYear]['balanceVendor'] += $vendorAmount;
            }
        }

        // Convert the aggregated data into a flat array
        $i = 0;
        foreach ($json['root'] as $year => $data) {
            $yearData['root'][$i] = $data;
            $i++;
        }

        // Return JSON response
        return response()->json($yearData);
    }

    private function fetchTransactions()
    {
        // Configurations
        $vendorId = env('ATLASSIAN_VENDOR_ID');
        $username = env('ATLASSIAN_USERNAME');
        $password = env('ATLASSIAN_PASSWORD');
        
        $uri = "https://marketplace.atlassian.com/rest/2/vendors/{$vendorId}/reporting/sales/transactions/export?accept=json&order=asc";

        // Make GET request with basic authentication
        $response = Http::withBasicAuth($username, $password)
            ->timeout(60)
            ->accept('application/json')
            ->get($uri);

        // Check if response is successful
        if (!$response->successful()) {
            abort($response->status(), 'Error fetching data from Atlassian API');
        }

        $transactions = $response->json();

        // Process data
        $balanceVendor = 0;
        $json = ['root' => []];

        foreach ($transactions as $i => $transaction) {
            $vendorAmount = number_format((float)($transaction['purchaseDetails']['vendorAmount'] ?? 0), 2, '.', '');
            $balanceVendor += $vendorAmount;

            $json['root'][$i] = [
                'vendorAmount' => $vendorAmount,
                'saleDate' => $transaction['purchaseDetails']['saleDate'] ?? null,
            ];
        }

        return $json;
    }

    public function getCumulativeSales()
    {

        // Configurations
        $vendorId = env('ATLASSIAN_VENDOR_ID');
        $username = env('ATLASSIAN_USERNAME');
        $password = env('ATLASSIAN_PASSWORD');
        
        try {
            // Replace with your Atlassian API URL
            $apiUrl = "https://marketplace.atlassian.com/rest/2/vendors/{$vendorId}/reporting/sales/transactions/export?accept=json&order=asc";

            // Fetch data from Atlassian API
            $response = Http::withBasicAuth(env('ATLASSIAN_USERNAME'), env('ATLASSIAN_PASSWORD'))
                ->get($apiUrl);

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch data from Atlassian'], 500);
            }

            $salesData = $response->json();
            $cumulativeData = [];

            $cumulativeVendorBalance = 0;

            foreach ($salesData as $transaction) {
                $saleDate = $transaction['purchaseDetails']['saleDate'] ?? null;
                $vendorAmount = (float)($transaction['purchaseDetails']['vendorAmount'] ?? 0);

                if ($saleDate) {
                    $formattedDate = date('Y-m', strtotime($saleDate)); // Group by Year-Month
                    $cumulativeVendorBalance += $vendorAmount;

                    // Prepare cumulative data by date
                    if (!isset($cumulativeData[$formattedDate])) {
                        $cumulativeData[$formattedDate] = [
                            'saleDate' => $formattedDate,
                            'cumulativeVendorBalance' => $cumulativeVendorBalance,
                        ];
                    } else {
                        $cumulativeData[$formattedDate]['cumulativeVendorBalance'] = $cumulativeVendorBalance;
                    }
                }
            }

            // Convert data to a sorted array
            $cumulativeData = array_values($cumulativeData);

            return response()->json(['root' => $cumulativeData]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

