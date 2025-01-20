<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;


class AtlassianSalesController extends Controller
{
    public function getMergedSales()
    {
        try {
            // Fetch Atlassian sales
            $atlassianSales = $this->fetchTransactions();

            // Fetch local sales (from invoices)
            $localSales = Invoice::orderBy('due_date')->get()->map(function ($invoice) {
                    return [
                        'saleDate' => $invoice->due_date,
                        'vendorAmount' => $invoice->total_including_vat,
                        'description' => "Invoice #{$invoice->id}",
                    ];
            });

            // Normalize Atlassian sales
            $normalizedAtlassianSales = array_map(function ($transaction) {
                return [
                    'saleDate' => $transaction['saleDate'],
                    'vendorAmount' => $transaction['vendorAmount'],
                    'description' => 'Atlassian Sale',
                ];
            }, $atlassianSales['root']);

            // Merge sales data
            $mergedSales = collect($normalizedAtlassianSales)
                ->merge($localSales)
                ->sortBy('saleDate')
                ->values()
                ->all();

            // Return merged sales as JSON
            return response()->json(['root' => $mergedSales]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getCombinedSales()
    {
        // Step 1: Fetch local sales
        $localSales = $this->getLocalSales();

        // Step 2: Fetch Atlassian sales
        $atlassianSales = $this->fetchTransactions()['root'];

        // Step 3: Combine data
        $combinedSales = [
            'localSales' => $localSales,
            'atlassianSales' => $atlassianSales,
        ];

        // Step 4: Return combined data
        return response()->json($combinedSales);
    }

    private function getLocalSales()
    {
        // Fetch invoices and calculate totals
        $invoices = Invoice::orderBy('due_date')->get();

        $totalExcludingVat = 0;
        $totalIncludingVat = 0;

        foreach ($invoices as $invoice) {
            $totalExcludingVat += $invoice->total_excluding_vat;
            $totalIncludingVat += $invoice->total_including_vat;
        }

        return [
            'totalInvoices' => $invoices->count(),
            'totalExcludingVat' => number_format($totalExcludingVat, 2),
            'totalIncludingVat' => number_format($totalIncludingVat, 2),
            'invoices' => $invoices,
        ];
    }

    public function getTransactions()
    {
        // Set response header type
        return response()->json($this->fetchTransactions());
    }

    public function addTransaction(Request $request)
    {
        
        $totalIncludingVat = $request->totalExcludingVat + (($request->totalExcludingVat*$request->vatPercentage)/100);
      
        try{ 
            DB::table('invoices')->insert([[
                'customer_id' => $request->customerID , 
                'invoice_number' => $request->invoiceNumber ,
                'total_excluding_vat' => $request->totalExcludingVat ,
                'vat_percentage' => $request->vatPercentage ,
                'total_including_vat' => $totalIncludingVat ,
                'due_date' => $request->dueDate ,
                'status' => $request->status ,
                'created_at' => date('Y-m-d H:i:s'), 
                'updated_at' => date('Y-m-d H:i:s')
                ]]);

            }
            catch (\Throwable $th) {

                return response()->json([
                    'success' => false,
                    'data' => $th->getMessage(),
                ], 400);

        }

        return response()->json([
            'Details' => $request->invoiceNumber,
            'data' => 'Transcation created!'
        ], 200);
    }

    public function getAllCustomer(){

            $customers = DB::table('customers')->select('*')->get();

            return response()->json(['data' => $customers ], 200);

    }

    public function addCustomer(Request $request)
    {
            
                $exists = DB::table('customers')->where('name', $request->customerName)->exists();

                if ($exists) {
                    return response()->json(['message' => 'Customer name already exists'], 409);
                }
      
            try{ 
            DB::table('customers')->insert([[
               'name' => $request->customerName, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')]]);
            }
            catch (\Throwable $th) {
              
                return response()->json(['message' => $th->getMessage()], 409);
        }
        return response()->json([ 'message' => 'Customer is created!'  ], 201);
    }

    public function getSalesReport()
    {
        // Configurations
        $vendorId = env('ATLASSIAN_VENDOR_ID');
        $username = env('ATLASSIAN_USERNAME');
        $password = env('ATLASSIAN_PASSWORD');

        $uri = "https://marketplace.atlassian.com/rest/2/vendors/{$vendorId}/reporting/sales/transactions/export";

        // Fetch Atlassian sales data
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

        // Initialize variables for Atlassian sales
        $json = ['root' => []];
        foreach ($transactions as $transaction) {
            $vendorAmount = (float)($transaction['purchaseDetails']['vendorAmount'] ?? 0);
            $saleDate = $transaction['purchaseDetails']['saleDate'] ?? null;

            if ($saleDate) {
                $saleYear = date("Y", strtotime($saleDate));

                // Aggregate Atlassian sales per year
                if (!isset($json['root'][$saleYear])) {
                    $json['root'][$saleYear] = [
                        'balanceVendor' => 0,
                        'saleYear' => $saleYear,
                    ];
                }

                $json['root'][$saleYear]['balanceVendor'] += $vendorAmount;
            }
        }

        // Fetch local sales data
        $localSales = Invoice::orderBy('due_date')->get()->map(function ($invoice) {
                return [
                    'saleYear' => date('Y', strtotime($invoice->due_date)),
                    'amount' => $invoice->total_including_vat,
                ];
        });

        // Aggregate local sales data per year
        foreach ($localSales as $localSale) {
            $saleYear = $localSale['saleYear'];
            $amount = (float)$localSale['amount'];

            if (!isset($json['root'][$saleYear])) {
                $json['root'][$saleYear] = [
                    'balanceVendor' => 0,
                    'saleYear' => $saleYear,
                ];
            }

            $json['root'][$saleYear]['balanceVendor'] += $amount;
        }

        // Convert the aggregated data into a flat array
        $yearData = ['root' => []];
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
            $response = Http::withBasicAuth($username, $password)->get($apiUrl);

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch data from Atlassian'], 500);
            }

            $salesData = $response->json();
            $salesByDate = [];
            $cumulativeVendorBalance = 0;

            // Process Atlassian sales
            foreach ($salesData as $transaction) {
                $saleDate = $transaction['purchaseDetails']['saleDate'] ?? null;
                $vendorAmount = (float)($transaction['purchaseDetails']['vendorAmount'] ?? 0);

                if ($saleDate) {
                    $formattedDate = date('Y-m', strtotime($saleDate)); // Group by Year-Month
                    $salesByDate[$formattedDate] = ($salesByDate[$formattedDate] ?? 0) + $vendorAmount;
                }
            }

            // Fetch local sales
            $localSales = Invoice::orderBy('due_date') // Order invoices by due_date
                ->get()
                ->map(function ($invoice) {
                        return [
                            'saleDate' => date('Y-m', strtotime($invoice->due_date)), // Use due_date for saleDate
                            'amount' => (float) $invoice->total_including_vat,       // Ensure amount is numeric
                        ];
                });

            // Add local sales to salesByDate
            foreach ($localSales as $localSale) {
                $saleDate = $localSale['saleDate'];
                $amount = (float)$localSale['amount'];

                $salesByDate[$saleDate] = ($salesByDate[$saleDate] ?? 0) + $amount;
            }

            // Sort sales by date
            ksort($salesByDate);

            // Calculate cumulative balance
            $cumulativeData = [];
            foreach ($salesByDate as $saleDate => $amount) {
                $cumulativeVendorBalance += $amount;

                $cumulativeData[] = [
                    'saleDate' => $saleDate,
                    'cumulativeVendorBalance' => $cumulativeVendorBalance,
                ];
            }

            return response()->json(['root' => $cumulativeData]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

}

