<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Carbon\CarbonImmutable;


class AtlassianSalesController extends Controller
{
    public function __construct()
    {
        //$this->apiToken = uniqid(base64_encode(Str::random(40)));
        $this->middleware('auth:api');
    }

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
        
        $exists = DB::table('invoices')->where('invoice_number', $request->invoiceNumber)->exists();

                if ($exists) {
                    return response()->json(['data' => 'Invoice number already exists'], 409);
                }

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
                    return response()->json(['data' => 'Customer name already exists'], 409);
                }
      
            try{ 
            DB::table('customers')->insert([[
               'name' => $request->customerName, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')]]);
            }
            catch (\Throwable $th) {
              
                return response()->json(['data' => $th->getMessage()], 400);
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

    public function getIncomeByMonthAllYears(Request $request)
    {
        try {
            $year   = (int) $request->query('year', now()->year);
            $source = 'all'; // $request->query('source', 'all'); // 'all', 'atlassian', 'kela', 'hourly', 'grandparents'

            // --- Atlassian (if requested) ---
            $atlRows = [];
            if ($source === 'all' || $source === 'atlassian') {
                // Must return: ['root' => [ ['saleDate' => 'YYYY-MM-DD', 'vendorAmount' => 123.45], ... ]]
                $atl = $this->fetchTransactions();
                foreach (($atl['root'] ?? []) as $tx) {
                    $atlRows[] = [
                        'saleDate'     => $tx['saleDate'] ?? null,
                        'vendorAmount' => (float) ($tx['vendorAmount'] ?? 0),
                    ];
                }
            }

            // --- Local invoices (if requested) ---
            $localRows = collect();
            if (in_array($source, ['all','kela','hourly','grandparents'], true)) {
                $q = Invoice::query()->orderBy('due_date');
                if ($source === 'kela') {
                    $q->whereIn('customer_id', [1, 7]);
                } elseif ($source === 'hourly') {
                    $q->whereNotIn('customer_id', [1, 7, 8]);
                } elseif ($source === 'grandparents') {
                    $q->where('customer_id', 8);
                }

                $localRows = $q->get()->map(fn($inv) => [
                    'saleDate'     => $inv->due_date,
                    'vendorAmount' => (float) $inv->total_including_vat,
                ]);
            }

            // --- Merge + keep only requested year ---
            $merged = collect($atlRows)->merge($localRows)
                ->filter(function ($r) use ($year) {
                    try { return CarbonImmutable::parse($r['saleDate'])->year === $year; }
                    catch (\Throwable $e) { return false; }
                });

            // --- Sum per month (1..12) ---
            $perMonth = array_fill(1, 12, 0.0);
            foreach ($merged as $r) {
                $d = CarbonImmutable::parse($r['saleDate']);
                $perMonth[(int)$d->month] += (float) ($r['vendorAmount'] ?? 0);
            }

            // --- Build 12 rows (Jan..Dec), zero-filled, + totals ---
            $labels = [];
            for ($m=1;$m<=12;$m++) $labels[$m] = CarbonImmutable::create($year, $m, 1)->format('M');

            $root = [];
            $yearTotal = 0.0;
            for ($m=1;$m<=12;$m++) {
                $total = round($perMonth[$m], 2);
                $yearTotal += $total;
                $root[] = ['label' => $labels[$m], 'total' => $total];
            }

            return response()->json([
                'status'    => 'success',
                'year'      => $year,
                'source'    => $source,
                'yearTotal' => round($yearTotal, 2),
                'root'      => $root, // 12 items
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch merged monthly sums.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function getIncomeYears(Request $request)
    {
        try {
            $source = 'all';

            // ---- Invoices (local DB) ----
            $invoiceQuery = Invoice::query();
    
            // DISTINCT years from due_date
            $invoiceYears = $invoiceQuery
                ->selectRaw('DISTINCT YEAR(due_date) as y')
                ->orderBy('y')
                ->pluck('y')
                ->map(fn ($y) => (int) $y)
                ->all();

            // ---- Atlassian (optional) ----
            $atlassianYears = [];
            if ($source === 'all' || $source === 'atlassian') {
                // Expected: ['root' => [ ['saleDate' => 'YYYY-MM-DD...', 'vendorAmount' => ...], ... ]]
                $atl = $this->fetchTransactions();
                foreach (($atl['root'] ?? []) as $tx) {
                    if (!empty($tx['saleDate'])) {
                        try {
                            $y = CarbonImmutable::parse($tx['saleDate'])->year;
                            $atlassianYears[] = (int) $y;
                        } catch (\Throwable $e) {
                            // skip bad dates
                        }
                    }
                }
            }

            // ---- Merge, unique, sort ----
            $years = collect($invoiceYears)
                ->merge($atlassianYears)
                ->unique()
                ->sort()
                ->values()
                ->all();

            return response()->json([
                'status' => 'success',
                'source' => $source,
                'years'  => $years, // e.g. [2003, 2004, ..., 2025]
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch years.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

}

