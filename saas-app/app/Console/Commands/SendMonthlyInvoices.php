<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Domain;
use App\Services\NetvisorAPIService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SendMonthlyInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'netvisor:send-monthly-invoices
                            {--domain= : Specific domain to invoice}
                            {--dry-run : Run without actually sending invoices}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send monthly invoices to all active domains via Netvisor API';

    /**
     * Netvisor API Service
     *
     * @var NetvisorAPIService
     */
    protected $netvisorAPI;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(NetvisorAPIService $netvisorAPI)
    {
        parent::__construct();
        $this->netvisorAPI = $netvisorAPI;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting monthly invoice generation...');
        $this->info('Date: ' . Carbon::now()->format('Y-m-d H:i:s'));

        $dryRun = $this->option('dry-run');
        $specificDomain = $this->option('domain');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No invoices will be sent');
        }

        // Get domains to invoice
        $query = Domain::where('is_active', true)
            ->where('is_synced', true)
            ->whereNotNull('customer_code');

        if ($specificDomain) {
            $query->where('domain', $specificDomain);
        }

        $domains = $query->get();

        if ($domains->isEmpty()) {
            $this->error('No domains found matching criteria');
            return 1;
        }

        $this->info("Found {$domains->count()} domain(s) to process");
        $this->newLine();

        $bar = $this->output->createProgressBar($domains->count());
        $bar->start();

        $successCount = 0;
        $failureCount = 0;

        foreach ($domains as $domain) {
            try {
                if ($dryRun) {
                    $this->newLine();
                    $this->line("[DRY RUN] Would create invoice for: {$domain->domain} ({$domain->customer_code})");
                    $referenceNumber = $this->generateReferenceNumber($domain);
                    $this->line("[DRY RUN] Reference number would be: {$referenceNumber}");
                    $this->line("[DRY RUN] Amount: €124.25 (€99.00 + €25.25 VAT)");
                } else {
                    $this->createInvoice($domain);
                    $successCount++;
                    $this->newLine();
                    $this->info("✓ Invoice created for {$domain->domain}: €124.25");
                }
            } catch (\Exception $e) {
                $failureCount++;
                Log::error("Failed to create invoice for domain {$domain->domain}: " . $e->getMessage());
                $this->newLine();
                $this->error("✗ Failed to create invoice for {$domain->domain}: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info('=== Invoice Generation Complete ===');

        if (!$dryRun) {
            $this->info("Successfully sent: {$successCount}");

            if ($failureCount > 0) {
                $this->warn("Failed: {$failureCount}");
            }
        }

        return 0;
    }

    /**
     * Create an invoice for a specific domain
     *
     * @param Domain $domain
     * @return void
     */
    protected function createInvoice(Domain $domain)
    {
        $currentDate = Carbon::now();
        $invoiceDate = $currentDate->format('Y-m-d');
        $deliveryDate = $currentDate->format('Y-m-d');
        $dueDate = $currentDate->addDays((int)$domain->payment_term ?: 14)->format('Y-m-d');

        // Calculate monthly subscription amount
        $monthlyFee = 99.00; // €99/month
        $vatRate = 0.255; // 25.5% VAT (Finland, effective September 2024)
        $vatAmount = round($monthlyFee * $vatRate, 2);
        $totalAmount = $monthlyFee + $vatAmount;

        $invoiceData = [
            'invoice_date' => $invoiceDate,
            'delivery_date' => $deliveryDate,
            'due_date' => $dueDate,
            'reference_number' => $this->generateReferenceNumber($domain),
            'amount' => $monthlyFee,
            'vat_amount' => $vatAmount,
            'total_amount' => $totalAmount,
            'seller' => $domain->default_seller ?: '',
            'status' => 'unsent',
            'customer_number' => $domain->customer_code,
            'customer_name' => $domain->domain,
        ];

        $invoiceLines = [
            [
                'product_name' => 'Monthly Subscription Fee',
                'product_code' => 'SUB-MONTHLY',
                'quantity' => 1,
                'unit_price' => $monthlyFee,
                'vat_percent' => 25.5,
                'description' => "Monthly subscription for {$currentDate->format('F Y')}"
            ]
        ];

        // Send to Netvisor
        $response = $this->netvisorAPI->createSalesInvoice($invoiceData, $invoiceLines);

        if (isset($response['error'])) {
            throw new \Exception($response['message'] ?? 'Unknown error from Netvisor API');
        }

        // Update domain last_synced_at
        $domain->last_synced_at = Carbon::now();
        $domain->save();

        Log::info("Invoice created successfully for domain: {$domain->domain}", [
            'reference_number' => $invoiceData['reference_number'],
            'total_amount' => $totalAmount
        ]);
    }

    /**
     * Generate Finnish reference number (viitenumero) with check digit
     * Uses modulo-10 algorithm
     *
     * @param Domain $domain
     * @return string
     */
    protected function generateReferenceNumber(Domain $domain)
    {
        // Simple reference: customer_code + YYYYMM
        $base = $domain->customer_code . Carbon::now()->format('Ym');

        // Calculate check digit using modulo 10 algorithm
        $sum = 0;
        $multipliers = [7, 3, 1];
        $digits = str_split(strrev($base));

        foreach ($digits as $index => $digit) {
            $sum += $digit * $multipliers[$index % 3];
        }

        $checkDigit = (10 - ($sum % 10)) % 10;

        return $base . $checkDigit;
    }
}
