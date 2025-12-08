<?php

namespace App\Jobs;

use App\Services\NetvisorAPIService;
use App\Models\User;
use App\Models\Domain;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SendMonthlyInvoices implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $netvisorAPI;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->netvisorAPI = new NetvisorAPIService();
    }

    /**
     * Execute the job.
     * Sends monthly invoices to all domains except the admin domain.
     *
     * @return void
     */
    public function handle()
    {
        Log::info('SendMonthlyInvoices Job started');

        try {
            // Get admin domain from .env (domains that should NOT be billed)
            $adminDomain = env('APP_DOMAIN_ADMIN', 'www.i4ware.fi');

            // Get price per user from settings (with 2 decimal precision)
            $pricePerUser = $this->getPricePerUser();

            if ($pricePerUser === null) {
                Log::error('Price per user not set in settings. Aborting billing.');
                return;
            }

            // Get all domains with user counts, excluding admin domain
            $domainUserCounts = $this->getDomainUserCounts($adminDomain);

            Log::info('Found ' . count($domainUserCounts) . ' domains to bill');

            $successCount = 0;
            $failCount = 0;

            // Process each domain
            foreach ($domainUserCounts as $domainData) {
                $domain = $domainData->domain;
                $userCount = $domainData->user_count;

                // Calculate total amount
                $totalAmount = $userCount * $pricePerUser;

                Log::info("Processing domain: {$domain}, Users: {$userCount}, Total: €{$totalAmount}");

                // Send invoice to Netvisor
                $result = $this->sendInvoiceToNetvisor($domain, $userCount, $pricePerUser, $totalAmount);

                if ($result) {
                    $successCount++;
                    Log::info("Invoice sent successfully for domain: {$domain}");
                } else {
                    $failCount++;
                    Log::error("Failed to send invoice for domain: {$domain}");
                }
            }

            Log::info("SendMonthlyInvoices Job completed. Success: {$successCount}, Failed: {$failCount}");

        } catch (\Exception $e) {
            Log::error('SendMonthlyInvoices Job failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get price per user from settings table.
     *
     * @return float|null
     */
    private function getPricePerUser()
    {
        $setting = Setting::where('setting_key', 'price_per_user')->first();

        if (!$setting) {
            return null;
        }

        // Return as float with 2 decimal precision
        return round((float) $setting->setting_value, 2);
    }

    /**
     * Get user counts grouped by domain, excluding admin domain.
     *
     * @param string $adminDomain
     * @return \Illuminate\Support\Collection
     */
    private function getDomainUserCounts($adminDomain)
    {
        return User::select('domain', DB::raw('COUNT(*) as user_count'))
            ->where('domain', '!=', $adminDomain)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->groupBy('domain')
            ->having('user_count', '>', 0)
            ->get();
    }

    /**
     * Send invoice to Netvisor for a specific domain.
     *
     * @param string $domain
     * @param int $userCount
     * @param float $pricePerUser
     * @param float $totalAmount
     * @return bool
     */
    private function sendInvoiceToNetvisor($domain, $userCount, $pricePerUser, $totalAmount)
    {
        try {
            // Get domain data from database
            $domainData = Domain::where('domain', $domain)->first();

            if (!$domainData) {
                Log::error("Domain not found in database: {$domain}");
                return false;
            }

            // Check if domain has customer_code (required for Netvisor)
            if (empty($domainData->customer_code)) {
                Log::error("Domain {$domain} does not have customer_code. Please sync customer to Netvisor first.");
                return false;
            }

            // Get current date for invoice
            $currentDate = date('Y-m-d');
            $dueDate = date('Y-m-d', strtotime('+14 days')); // 14 days payment term

            // Invoice description
            $productName = "Kuukausimaksu - i4ware SaaS";
            $description = "{$userCount} käyttäjää × €" . number_format($pricePerUser, 2, ',', ' ');

            // Calculate amount without VAT
            $amountWithoutVat = $totalAmount;
            $vatAmount = $amountWithoutVat * 0.255;
            $totalWithVat = $amountWithoutVat + $vatAmount;

            // Prepare invoice data for Netvisor API
            $invoiceData = [
                'invoice_date' => $currentDate,
                'delivery_date' => $currentDate,
                'due_date' => $dueDate,
                'customer_number' => $domainData->customer_code,
                'amount' => round($totalWithVat, 2),
                'reference_number' => '', // Netvisor generates this
                'status' => 'unsent',
            ];

            // Prepare invoice lines
            $invoiceLines = [
                [
                    'product_name' => $productName,
                    'product_code' => 'SAAS-MONTHLY',
                    'quantity' => $userCount,
                    'unit_price' => round($pricePerUser, 2),
                    'vat_percent' => 25.5,
                    'description' => $description,
                ]
            ];

            Log::info("Sending invoice to Netvisor for domain: {$domain}, Customer code: {$domainData->customer_code}");

            // Send invoice to Netvisor
            $response = $this->netvisorAPI->createSalesInvoice($invoiceData, $invoiceLines);

            if ($response && isset($response['status']) && $response['status'] === 'ok') {
                Log::info("Invoice created successfully for domain: {$domain}");
                return true;
            } else {
                Log::error("Failed to create invoice for domain: {$domain}", ['response' => $response]);
                return false;
            }

        } catch (\Exception $e) {
            Log::error("Error creating invoice for domain {$domain}: " . $e->getMessage());
            return false;
        }
    }
}
