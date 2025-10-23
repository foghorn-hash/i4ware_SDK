# Visma Netvisor Integration - Testing Guide

**Comprehensive testing procedures for Netvisor integration**

---

## 🎯 Testing Overview

This guide covers:
1. **Environment Setup** - Get test credentials and configure
2. **Unit Tests** - Individual component testing
3. **API Endpoint Tests** - All 7 endpoints
4. **Command Tests** - SendMonthlyInvoices
5. **Database Tests** - Migrations and models
6. **Integration Tests** - End-to-end workflows
7. **Error Handling Tests** - What happens when things fail

---

## 1. Environment Setup

### Step 1: Get Netvisor Test Credentials

Contact Netvisor to get sandbox/test credentials:
- Customer ID
- Organisation ID
- Customer Key
- Partner Key
- Partner ID

### Step 2: Configure .env

```bash
# Open .env file
cd saas-app
nano .env
```

Add Netvisor credentials:
```env
NETVISOR_BASE_URL=https://isvapi.netvisor.fi
NETVISOR_SENDER=i4ware_SDK
NETVISOR_CUSTOMER_ID=your_test_customer_id_here
NETVISOR_LANGUAGE=EN
NETVISOR_ORGANISATION_ID=your_test_organisation_id_here
NETVISOR_CUSTOMER_KEY=your_test_customer_key_here
NETVISOR_PARTNER_KEY=your_test_partner_key_here
NETVISOR_PARTNER_ID=your_test_partner_id_here
```

### Step 3: Verify Configuration

```bash
# Check config loads correctly
php artisan tinker
```

```php
>>> config('netvisor.customer_id')
=> "your_test_customer_id_here"

>>> config('netvisor.base_url')
=> "https://isvapi.netvisor.fi"

>>> exit
```

---

## 2. Database Tests

### Test 1: Verify Transactions Table

```bash
# Check migration status
php artisan migrate:status
```

**Expected output:**
```
✅ 2024_07_26_100833_create_transactions_table .......... Ran
```

**Verify table structure:**
```bash
php artisan tinker
```

```php
>>> Schema::hasTable('netvisor_transactions')
=> true

>>> Schema::hasColumn('netvisor_transactions', 'transaction_id')
=> true

>>> DB::select("SHOW INDEX FROM netvisor_transactions WHERE Key_name = 'transaction_id'")
=> [
     {
       +"Key_name": "transaction_id",
       +"Column_name": "transaction_id",
       +"Non_unique": 0,  // 0 = UNIQUE constraint exists ✅
     }
   ]
```

**✅ PASS if:**
- Table name is `netvisor_transactions`
- `transaction_id` column exists
- UNIQUE constraint exists (Non_unique = 0)

---

### Test 2: Verify Domains Table

```bash
php artisan tinker
```

```php
>>> Schema::hasTable('domains')
=> true

>>> Schema::hasColumn('domains', 'customer_code')
=> true

>>> Schema::hasColumn('domains', 'is_synced')
=> true

>>> Schema::hasColumn('domains', 'last_synced_at')
=> true

// List all Netvisor columns
>>> DB::select("DESCRIBE domains")
// Should show: customer_code, business_id, phone, email, e_invoice_address,
// e_invoice_operator, is_active, customer_group, price_group, invoice_language,
// payment_term, default_seller, delivery_address, delivery_postcode,
// delivery_city, delivery_country, contact_person, contact_person_phone,
// contact_person_email, private_customer, last_synced_at, is_synced
```

**✅ PASS if:** All 22 Netvisor fields exist in domains table

---

### Test 3: NetvisorTransaction Model

```bash
php artisan tinker
```

```php
>>> use App\Models\NetvisorTransaction;

>>> NetvisorTransaction::getTable()
=> "netvisor_transactions"

>>> $transaction = new NetvisorTransaction();
>>> $transaction->getFillable()
=> ["timestamp", "language", "transaction_id"]

>>> $transaction->timestamps
=> true

>>> exit
```

**✅ PASS if:**
- Model uses correct table name
- Fillable fields match
- Timestamps enabled

---

## 3. API Endpoint Tests (Manual with Postman/cURL)

### Test 4: GET /api/netvisor/customers

**cURL:**
```bash
curl -X GET http://localhost/i4ware_SDK/saas-app/public/api/netvisor/customers \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

**Expected Response:**
```json
{
  "status": "OK",
  "customers": [
    {
      "customer_code": "12345",
      "customer_name": "Test Customer Oy",
      "business_id": "1234567-8",
      ...
    }
  ]
}
```

**✅ PASS if:**
- Status 200
- Returns customer list from Netvisor
- No authentication errors

---

### Test 5: POST /api/netvisor/customers

**cURL:**
```bash
curl -X POST http://localhost/i4ware_SDK/saas-app/public/api/netvisor/customers \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test Company Oy",
    "code": "TEST001",
    "email": "test@example.com",
    "phone": "+358401234567"
  }'
```

**Expected Response:**
```json
{
  "status": "OK",
  "netvisor_key": "123456",
  "message": "Customer created successfully"
}
```

**✅ PASS if:**
- Status 200
- Customer created in Netvisor
- Returns Netvisor key

**Verify in Netvisor:**
Log into Netvisor portal and check if customer "TEST001" exists.

---

### Test 6: GET /api/netvisor/products

**cURL:**
```bash
curl -X GET http://localhost/i4ware_SDK/saas-app/public/api/netvisor/products \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "status": "OK",
  "products": [
    {
      "product_code": "PROD001",
      "product_name": "i4ware SaaS - Monthly Subscription",
      "unit_price": 99.00,
      ...
    }
  ]
}
```

**✅ PASS if:**
- Status 200
- Returns product list
- Products match Netvisor inventory

---

### Test 7: GET /api/netvisor/invoices

**cURL:**
```bash
curl -X GET http://localhost/i4ware_SDK/saas-app/public/api/netvisor/invoices \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "status": "OK",
  "invoices": [
    {
      "invoice_number": "2025-001",
      "customer_name": "Test Company Oy",
      "total_amount": 122.76,
      "invoice_date": "2025-10-21",
      ...
    }
  ]
}
```

**✅ PASS if:**
- Status 200
- Returns invoice list from Netvisor

---

### Test 8: POST /api/netvisor/invoices

**cURL:**
```bash
curl -X POST http://localhost/i4ware_SDK/saas-app/public/api/netvisor/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_date": "2025-10-21",
    "customer_number": "TEST001",
    "customer_name": "Test Company Oy",
    "amount": 99.00,
    "vat_amount": 23.76,
    "total_amount": 122.76,
    "lines": [
      {
        "productname": "i4ware SaaS - Monthly Subscription",
        "productunitprice": 99.00,
        "vatpercent": 24,
        "salesamount": 99.00
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "status": "OK",
  "invoice_number": "2025-001",
  "netvisor_key": "789012",
  "message": "Invoice created successfully"
}
```

**✅ PASS if:**
- Status 200
- Invoice created in Netvisor
- Returns invoice number and key

**Verify in Netvisor:**
Log into Netvisor and check if invoice "2025-001" exists.

---

### Test 9: GET /api/netvisor/invoices/{netvisorKey}

**cURL:**
```bash
# Use the netvisor_key from previous test (e.g., 789012)
curl -X GET http://localhost/i4ware_SDK/saas-app/public/api/netvisor/invoices/789012 \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "status": "OK",
  "invoice": {
    "invoice_number": "2025-001",
    "customer_name": "Test Company Oy",
    "total_amount": 122.76,
    "invoice_lines": [...]
  }
}
```

**✅ PASS if:**
- Status 200
- Returns specific invoice details

---

## 4. SendMonthlyInvoices Command Tests

### Test 10: Dry-Run Mode (Safe Testing)

**Prepare test data:**
```bash
php artisan tinker
```

```php
>>> use App\Models\Domain;

// Create test domain with Netvisor fields
>>> $domain = Domain::create([
      'company_name' => 'Test Company Oy',
      'customer_code' => 'TEST001',
      'is_active' => true,
      'is_synced' => true,
      'email' => 'test@example.com',
    ]);

>>> exit
```

**Run dry-run test:**
```bash
php artisan netvisor:send-monthly-invoices --dry-run
```

**Expected Output:**
```
🔍 DRY RUN MODE - No invoices will be sent
Found 1 domains to bill
 1/1 [============================] 100%

Would create invoice for Test Company Oy:
  Customer Code: TEST001
  Reference: TEST0012510254 (viitenumero with check digit)
  Amount: €122.76 (€99.00 + €23.76 VAT)

✅ Successfully processed: 1
🔍 This was a dry run. Use without --dry-run to send invoices.
```

**✅ PASS if:**
- Finds active domains with customer_code
- Generates Finnish reference number correctly
- Calculates pricing: €99 + 24% VAT = €122.76
- Shows progress bar
- NO actual invoices sent

---

### Test 11: Finnish Reference Number Validation

**Test reference number algorithm:**
```bash
php artisan tinker
```

```php
>>> use App\Console\Commands\SendMonthlyInvoices;
>>> use App\Models\Domain;
>>> use Carbon\Carbon;

// Create test domain
>>> $domain = new Domain(['customer_code' => '12345']);

// Generate reference number
>>> $command = new SendMonthlyInvoices();
>>> $ref = $command->generateReferenceNumber($domain);
// Example: "123452510254"
// Format: [customer_code][YYYYMM][check_digit]

// Verify check digit manually
>>> $base = $domain->customer_code . Carbon::now()->format('Ym');
=> "1234525102" // Without check digit

>>> $sum = 0;
>>> $multipliers = [7, 3, 1];
>>> $digits = str_split(strrev($base));
>>> foreach ($digits as $index => $digit) {
      $sum += $digit * $multipliers[$index % 3];
    }

>>> $checkDigit = (10 - ($sum % 10)) % 10;
>>> echo "Reference: " . $base . $checkDigit;
=> "Reference: 123452510254"

>>> exit
```

**Manual calculation example:**
```
Base: 1234525102
Reverse: 2015243521
Multiply: 2*7 + 0*3 + 1*1 + 5*7 + 2*3 + 4*1 + 3*7 + 5*3 + 2*1 + 1*7
        = 14 + 0 + 1 + 35 + 6 + 4 + 21 + 15 + 2 + 7
        = 105
Modulo 10: 105 % 10 = 5
Check digit: (10 - 5) % 10 = 5
Final: 12345251025 + 5 = 123452510255
```

**✅ PASS if:** Generated reference number matches manual calculation

---

### Test 12: Live Invoice Sending (CAREFUL!)

**Prerequisites:**
- Test 10 passed (dry-run works)
- Test customer exists in Netvisor
- Ready to create real invoice

```bash
# Run for single domain only
php artisan netvisor:send-monthly-invoices --domain=TEST001
```

**Expected Output:**
```
Found 1 domains to bill
 1/1 [============================] 100%

✅ Successfully processed: 1
```

**Verify:**
1. Check Netvisor portal for new invoice
2. Check invoice details match:
   - Customer: TEST001
   - Amount: €122.76
   - Reference number: Correct viitenumero
   - Date: Today's date

**✅ PASS if:**
- Invoice appears in Netvisor
- All details correct
- No errors in command output

---

### Test 13: Domain Filtering

**Test active/inactive filtering:**
```bash
php artisan tinker
```

```php
>>> use App\Models\Domain;

// Create inactive domain
>>> Domain::create([
      'company_name' => 'Inactive Company',
      'customer_code' => 'INACTIVE001',
      'is_active' => false,  // ❌ Should NOT be billed
      'is_synced' => true,
    ]);

// Create unsynced domain
>>> Domain::create([
      'company_name' => 'Unsynced Company',
      'customer_code' => 'UNSYNC001',
      'is_active' => true,
      'is_synced' => false,  // ❌ Should NOT be billed
    ]);

// Create domain without customer_code
>>> Domain::create([
      'company_name' => 'No Code Company',
      'customer_code' => null,  // ❌ Should NOT be billed
      'is_active' => true,
      'is_synced' => true,
    ]);

>>> exit
```

**Run dry-run:**
```bash
php artisan netvisor:send-monthly-invoices --dry-run
```

**✅ PASS if:**
- ONLY bills domains where:
  - `is_active = true`
  - `is_synced = true`
  - `customer_code IS NOT NULL`
- Skips all 3 test domains above

---

## 5. Service Class Tests

### Test 14: NetvisorAPIService Authentication

```bash
php artisan tinker
```

```php
>>> use App\Services\NetvisorAPIService;

>>> $service = new NetvisorAPIService();

// Test authentication header generation
>>> $timestamp = now()->format('Y-m-d H:i:s');
>>> $transactionId = uniqid();
>>> $mac = hash('sha256',
      config('netvisor.base_url') .
      config('netvisor.sender') .
      config('netvisor.customer_id') .
      $timestamp .
      config('netvisor.language') .
      config('netvisor.organisation_id') .
      $transactionId .
      config('netvisor.customer_key') .
      config('netvisor.partner_key')
   );

>>> echo "MAC: " . $mac;
=> "MAC: a1b2c3d4e5f6..." // Should be 64-character SHA-256 hash

>>> strlen($mac)
=> 64 // ✅ Correct length

>>> exit
```

**✅ PASS if:**
- MAC hash is exactly 64 characters
- Uses SHA-256 algorithm
- Includes all required parameters

---

### Test 15: XML Request/Response

**Test XML generation:**
```bash
php artisan tinker
```

```php
>>> use App\Services\NetvisorAPIService;
>>> use Spatie\ArrayToXml\ArrayToXml;

>>> $data = [
      'customer' => [
        'customername' => 'Test Company',
        'customercode' => 'TEST001',
      ]
    ];

>>> $xml = ArrayToXml::convert($data, 'root');
>>> echo $xml;
```

**Expected output:**
```xml
<?xml version="1.0"?>
<root>
  <customer>
    <customername>Test Company</customername>
    <customercode>TEST001</customercode>
  </customer>
</root>
```

**✅ PASS if:** XML is properly formatted

---

## 6. Error Handling Tests

### Test 16: Invalid Credentials

**Temporarily break credentials:**
```bash
# Edit .env
NETVISOR_CUSTOMER_KEY=INVALID_KEY_FOR_TESTING
```

**Test API call:**
```bash
curl -X GET http://localhost/i4ware_SDK/saas-app/public/api/netvisor/customers
```

**Expected Response:**
```json
{
  "status": "ERROR",
  "message": "Authentication failed",
  "error_code": 401
}
```

**✅ PASS if:**
- Returns proper error response
- Does NOT crash
- Error message is clear

**Restore credentials after test!**

---

### Test 17: Missing Required Fields

**Test invoice creation with missing data:**
```bash
curl -X POST http://localhost/i4ware_SDK/saas-app/public/api/netvisor/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customer_number": "TEST001"
  }'
```

**Expected Response:**
```json
{
  "status": "ERROR",
  "message": "Validation failed",
  "errors": {
    "invoice_date": ["The invoice date field is required."],
    "amount": ["The amount field is required."],
    ...
  }
}
```

**✅ PASS if:**
- Returns validation errors
- Lists all missing fields
- Does NOT send invalid request to Netvisor

---

### Test 18: Network Timeout

**Test timeout handling:**
```bash
# Edit NetvisorAPIService.php temporarily
# Set very short timeout (e.g., 0.001 seconds)
```

```bash
curl -X GET http://localhost/i4ware_SDK/saas-app/public/api/netvisor/products
```

**Expected Response:**
```json
{
  "status": "ERROR",
  "message": "Request timeout",
  "error_code": 408
}
```

**✅ PASS if:**
- Handles timeout gracefully
- Returns error instead of hanging
- Logs error for debugging

**Restore normal timeout after test!**

---

## 7. Integration Tests (End-to-End)

### Test 19: Complete Monthly Billing Flow

**Scenario:** Bill all active customers on 1st of month

**Setup:**
```bash
php artisan tinker
```

```php
>>> use App\Models\Domain;

// Create 3 test customers
>>> Domain::create([
      'company_name' => 'Customer A Oy',
      'customer_code' => 'CUST001',
      'is_active' => true,
      'is_synced' => true,
      'email' => 'customerA@example.com',
    ]);

>>> Domain::create([
      'company_name' => 'Customer B Oy',
      'customer_code' => 'CUST002',
      'is_active' => true,
      'is_synced' => true,
      'email' => 'customerB@example.com',
    ]);

>>> Domain::create([
      'company_name' => 'Customer C Oy',
      'customer_code' => 'CUST003',
      'is_active' => false,  // ❌ Should be skipped
      'is_synced' => true,
    ]);

>>> exit
```

**Execute:**
```bash
# Dry run first
php artisan netvisor:send-monthly-invoices --dry-run
```

**Expected:**
```
Found 2 domains to bill  # Only A and B (C is inactive)
...
✅ Successfully processed: 2
```

**Live run:**
```bash
php artisan netvisor:send-monthly-invoices
```

**Verify:**
1. ✅ 2 invoices created in Netvisor (CUST001, CUST002)
2. ✅ CUST003 skipped (inactive)
3. ✅ Both invoices have correct:
   - Amount: €122.76
   - Reference numbers (different for each)
   - Customer details
   - Date: today

**✅ PASS if:** All verifications pass

---

### Test 20: Customer Creation → Sync → Billing

**Complete workflow test:**

**Step 1: Create customer in app**
```bash
curl -X POST http://localhost/i4ware_SDK/saas-app/public/api/netvisor/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Customer Oy",
    "code": "NEW001",
    "email": "new@customer.com",
    "phone": "+358401234567"
  }'
```

**Step 2: Create domain record**
```bash
php artisan tinker
```

```php
>>> Domain::create([
      'company_name' => 'New Customer Oy',
      'customer_code' => 'NEW001',
      'is_active' => true,
      'is_synced' => true,
      'email' => 'new@customer.com',
      'last_synced_at' => now(),
    ]);
```

**Step 3: Bill customer**
```bash
php artisan netvisor:send-monthly-invoices --domain=NEW001
```

**Step 4: Verify invoice created**
```bash
# Get invoice from Netvisor
curl -X GET http://localhost/i4ware_SDK/saas-app/public/api/netvisor/invoices \
  | grep "NEW001"
```

**✅ PASS if:**
- Customer created in Netvisor
- Domain synced in database
- Invoice generated successfully
- All data consistent across systems

---

## 8. Performance Tests

### Test 21: Bulk Billing Performance

**Create 50 test domains:**
```bash
php artisan tinker
```

```php
>>> use App\Models\Domain;
>>> for ($i = 1; $i <= 50; $i++) {
      Domain::create([
        'company_name' => "Bulk Customer $i Oy",
        'customer_code' => sprintf('BULK%03d', $i),
        'is_active' => true,
        'is_synced' => true,
      ]);
    }
```

**Test billing speed:**
```bash
time php artisan netvisor:send-monthly-invoices --dry-run
```

**Expected:**
```
Found 50 domains to bill
 50/50 [============================] 100%
✅ Successfully processed: 50

real    0m15.234s  # Should complete in reasonable time
```

**✅ PASS if:**
- Processes 50 domains in < 1 minute
- Progress bar updates smoothly
- No memory errors
- No timeouts

---

## 9. Security Tests

### Test 22: SQL Injection Prevention

**Test malicious input:**
```bash
curl -X POST http://localhost/i4ware_SDK/saas-app/public/api/netvisor/customers \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST\"; DROP TABLE domains; --",
    "name": "Hacker Company"
  }'
```

**✅ PASS if:**
- Input is sanitized/escaped
- No SQL injection occurs
- Returns validation error or safely stores escaped value

---

### Test 23: Authentication Required

**Test without auth token:**
```bash
curl -X GET http://localhost/i4ware_SDK/saas-app/public/api/netvisor/customers
```

**Expected:** Should return 401 Unauthorized if endpoints are protected

**Note:** Check if routes in `api.php` have `auth:api` middleware

---

## 10. Checklist Summary

### ✅ All Tests Checklist:

- [ ] **Test 1:** Transactions table exists with UNIQUE constraint
- [ ] **Test 2:** Domains table has all 22 Netvisor fields
- [ ] **Test 3:** NetvisorTransaction model works
- [ ] **Test 4:** GET /customers returns customer list
- [ ] **Test 5:** POST /customers creates customer
- [ ] **Test 6:** GET /products returns products
- [ ] **Test 7:** GET /invoices returns invoices
- [ ] **Test 8:** POST /invoices creates invoice
- [ ] **Test 9:** GET /invoices/{key} returns specific invoice
- [ ] **Test 10:** Dry-run mode works without sending
- [ ] **Test 11:** Finnish reference numbers correct
- [ ] **Test 12:** Live invoicing creates real invoices
- [ ] **Test 13:** Domain filtering works (active/synced/customer_code)
- [ ] **Test 14:** Authentication MAC hash correct
- [ ] **Test 15:** XML generation works
- [ ] **Test 16:** Invalid credentials handled gracefully
- [ ] **Test 17:** Missing fields validated
- [ ] **Test 18:** Network timeout handled
- [ ] **Test 19:** End-to-end monthly billing works
- [ ] **Test 20:** Customer→Sync→Billing workflow complete
- [ ] **Test 21:** Bulk billing performance acceptable
- [ ] **Test 22:** SQL injection prevented
- [ ] **Test 23:** Authentication enforced

---

## 🎯 Quick Test Suite

**Fast verification (5 minutes):**
```bash
# 1. Database
php artisan migrate:status | grep netvisor

# 2. Config
php artisan tinker
>>> config('netvisor.customer_id')
>>> exit

# 3. Dry-run
php artisan netvisor:send-monthly-invoices --dry-run

# 4. API (replace with your URL)
curl http://localhost/i4ware_SDK/saas-app/public/api/netvisor/products
```

**✅ If all 4 pass:** Basic functionality works!

---

## 📞 Troubleshooting

### Common Issues:

**Issue:** "Authentication failed"
- Check .env credentials
- Verify MAC hash generation
- Check timestamp format

**Issue:** "Table not found"
- Run `php artisan migrate`
- Check migration status

**Issue:** "No domains found"
- Create test domain with customer_code, is_active=true, is_synced=true

**Issue:** "Timeout"
- Check Netvisor API status
- Increase timeout in service class

---

## 📄 Test Report Template

```markdown
# Netvisor Integration Test Report

**Date:** 2025-10-21
**Tester:** [Your Name]
**Environment:** Development

## Test Results:

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Transactions table | ✅ PASS | UNIQUE constraint verified |
| 2 | Domains table | ✅ PASS | All 22 fields present |
| ... | ... | ... | ... |

## Summary:
- Total Tests: 23
- Passed: 22
- Failed: 1
- Skipped: 0

## Issues Found:
1. [Describe any issues]

## Recommendations:
1. [Any improvements needed]
```

---

**End of Testing Guide**

Save test results and repeat tests after any code changes!
