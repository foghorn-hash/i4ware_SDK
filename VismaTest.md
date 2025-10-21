# Visma Netvisor Integration - Testing Guide

**Created:** 2025-10-17
**Branch:** `Visma-Netvisor-Integration`
**Purpose:** Complete testing instructions for Netvisor integration

---

## 📋 Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Database Migration](#database-migration)
3. [Environment Configuration](#environment-configuration)
4. [Backend Testing](#backend-testing)
5. [Frontend Testing](#frontend-testing)
6. [Automated Billing Testing](#automated-billing-testing)
7. [API Endpoint Testing](#api-endpoint-testing)
8. [Common Issues & Solutions](#common-issues--solutions)
9. [Test Checklist](#test-checklist)

---

## 🔧 Pre-Testing Setup

### **Requirements:**

- ✅ XAMPP/MAMP running (MySQL + Apache)
- ✅ PHP 8.0+ installed
- ✅ Node.js 18.x installed
- ✅ Composer installed
- ✅ Git repository on `Visma-Netvisor-Integration` branch

### **Verify Current Branch:**

```bash
cd /Users/jonihaarala/Repot/i4ware_SDK
git branch
# Should show: * Visma-Netvisor-Integration
```

---

## 🗄️ Database Migration

### **CRITICAL: Fix Transaction Table Name**

The migration was updated to create `netvisor_transactions` instead of `transactions` and add a UNIQUE index to `transaction_id`.

#### **Option A: Fresh Migration (Recommended for Testing)**

**⚠️ WARNING: This will delete ALL data in the database!**

```bash
cd saas-app

# Reset database completely
php artisan migrate:fresh

# Optional: With seeders
php artisan migrate:fresh --seed
```

**Expected Output:**
```
Dropped all tables successfully.
Migration table created successfully.
Migrating: 2024_07_26_100833_create_transactions_table
Migrated:  2024_07_26_100833_create_transactions_table (XX.XXms)
...
```

#### **Option B: Manual Table Cleanup (If You Have Data to Preserve)**

**Step 1: Drop old table manually**

Using phpMyAdmin or MySQL CLI:

```sql
-- Check if old 'transactions' table exists
SHOW TABLES LIKE 'transactions';

-- If exists, drop it
DROP TABLE IF EXISTS `transactions`;
```

**Step 2: Run migrations**

```bash
cd saas-app
php artisan migrate
```

#### **Verify Migration Success:**

```bash
php artisan migrate:status
```

**Expected Output:**
```
+------+----------------------------------------------------+-------+
| Ran? | Migration                                          | Batch |
+------+----------------------------------------------------+-------+
| Yes  | 2024_07_26_100833_create_transactions_table        | 1     |
| Yes  | 2025_05_30_160838_alter_domains_table_for_netvisor | 1     |
+------+----------------------------------------------------+-------+
```

#### **Verify Table Structure:**

Using phpMyAdmin or MySQL CLI:

```sql
-- Check netvisor_transactions table
DESCRIBE netvisor_transactions;
```

**Expected Result:**
```
+----------------+--------------+------+-----+---------+----------------+
| Field          | Type         | Null | Key | Default | Extra          |
+----------------+--------------+------+-----+---------+----------------+
| id             | bigint(20)   | NO   | PRI | NULL    | auto_increment |
| timestamp      | varchar(255) | NO   |     | NULL    |                |
| language       | varchar(255) | NO   |     | NULL    |                |
| transaction_id | varchar(255) | NO   | UNI | NULL    |                | ← UNIQUE!
| created_at     | timestamp    | YES  |     | NULL    |                |
| updated_at     | timestamp    | YES  |     | NULL    |                |
+----------------+--------------+------+-----+---------+----------------+
```

**✅ Verify:** `transaction_id` has `UNI` (UNIQUE) key!

---

## ⚙️ Environment Configuration

### **Check .env File:**

```bash
cd saas-app
cat .env | grep NETVISOR
```

### **Required Netvisor Configuration:**

Add these to `saas-app/.env` if missing:

```env
# Netvisor API Configuration
NETVISOR_BASE_URL=https://integration.netvisor.fi
NETVISOR_SENDER=Your Company Name
NETVISOR_CUSTOMER_ID=123456
NETVISOR_LANGUAGE=FI
NETVISOR_ORGANISATION_ID=1234567-8
NETVISOR_CUSTOMER_KEY=your_customer_key_here
NETVISOR_PARTNER_KEY=your_partner_key_here
NETVISOR_PARTNER_ID=your_partner_id_here
```

**⚠️ IMPORTANT:**
- Replace ALL placeholder values with real Netvisor credentials
- Without valid credentials, API calls will fail with 401/403 errors
- Get credentials from: https://netvisor.fi (admin panel)

### **Verify Configuration Loaded:**

```bash
cd saas-app
php artisan tinker
```

In Tinker:
```php
config('netvisor.base_url');
// Should output: "https://integration.netvisor.fi"

config('netvisor.customer_id');
// Should output your customer ID

exit
```

---

## 🖥️ Backend Testing

### **1. Start Laravel Backend:**

```bash
cd saas-app
php artisan serve
```

**Expected Output:**
```
Starting Laravel development server: http://127.0.0.1:8000
[Fri Oct 17 15:30:00 2025] PHP 8.1.0 Development Server (http://127.0.0.1:8000) started
```

**✅ Backend running at:** http://localhost:8000

### **2. Verify Routes Exist:**

```bash
cd saas-app
php artisan route:list | grep netvisor
```

**Expected Output (7 routes):**
```
GET|HEAD  api/netvisor/customers ................... NetvisorController@getCustomers
POST      api/netvisor/customers ................... NetvisorController@addCustomer
GET|HEAD  api/netvisor/invoices .................... NetvisorController@getSalesInvoices
GET|HEAD  api/netvisor/invoices/{netvisorKey} ...... NetvisorController@getInvoice
POST      api/netvisor/invoices .................... NetvisorController@createInvoice
GET|HEAD  api/netvisor/products .................... NetvisorController@getProducts
```

**✅ All 7 routes should be listed!**

### **3. Check Logs (Keep Open in Separate Terminal):**

```bash
cd saas-app
tail -f storage/logs/laravel.log
```

This will show real-time logs of all API calls and errors.

---

## 🌐 Frontend Testing

### **1. Start React Frontend:**

```bash
cd login-form
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view login-form in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.X:3000
```

**✅ Frontend running at:** http://localhost:3000

### **2. Login to Application:**

1. Open browser: http://localhost:3000
2. Login with your credentials
3. Navigate to **Settings** page

### **3. Test "Verify Netvisor" Button:**

#### **Location:**
Settings page → Scroll down → Find "Verify Netvisor" button

#### **How to Test:**

1. Click **"Verify Netvisor"** button
2. Wait 2-5 seconds
3. Observe alert message

#### **Expected Results:**

**✅ Success (if Netvisor credentials valid):**
```
┌─────────────────────────────────────────────┐
│ ✓ Netvisor Connection Succeessful!         │  ← Green alert
│                                         [X] │
└─────────────────────────────────────────────┘
```

**❌ Failure (if credentials invalid/missing):**
```
┌─────────────────────────────────────────────┐
│ ✗ Netvisor Connection Failed!              │  ← Red alert
│                                         [X] │
└─────────────────────────────────────────────┘
```

#### **Check Browser Console:**

Open Developer Tools (F12) → Console tab

**Success Response:**
```javascript
Netvisor Response: {
  SalesInvoiceList: {
    SalesInvoice: [...]
  }
}
```

**Error Response:**
```javascript
Verification failed: Error: Request failed with status code 401
```

#### **Check Laravel Logs:**

In the `tail -f storage/logs/laravel.log` terminal:

**Success:**
```
[2025-10-17 15:30:00] local.INFO: Sales invoices response: {"SalesInvoiceList":...}
[2025-10-17 15:30:00] local.INFO: Calculated HMAC: abc123...
```

**Failure:**
```
[2025-10-17 15:30:00] local.ERROR: Netvisor API request failed {"message":"401 Unauthorized"}
```

---

## 🤖 Automated Billing Testing

### **1. Prepare Test Domain Data:**

Before testing automated billing, you need domains in the database.

#### **Option A: Using phpMyAdmin**

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Select your database (e.g., `i4ware_db`)
3. Click `domains` table
4. Click "Insert" tab
5. Add test domain:

```sql
INSERT INTO `domains` (
    `domain`,
    `customer_code`,
    `is_active`,
    `is_synced`,
    `payment_term`,
    `default_seller`,
    `created_at`,
    `updated_at`
) VALUES (
    'test-company.com',     -- Domain name
    'TEST001',              -- Netvisor customer code
    1,                      -- Active
    1,                      -- Synced with Netvisor
    '14',                   -- 14 days payment term
    'Sales Person Name',    -- Default seller
    NOW(),
    NOW()
);
```

#### **Option B: Using MySQL CLI**

```bash
mysql -u root -p i4ware_db
```

```sql
INSERT INTO domains (domain, customer_code, is_active, is_synced, payment_term, default_seller, created_at, updated_at)
VALUES ('test-company.com', 'TEST001', 1, 1, '14', 'Sales Person Name', NOW(), NOW());

-- Verify insert
SELECT id, domain, customer_code, is_active, is_synced FROM domains;
```

**Expected Result:**
```
+----+-------------------+---------------+-----------+-----------+
| id | domain            | customer_code | is_active | is_synced |
+----+-------------------+---------------+-----------+-----------+
|  1 | test-company.com  | TEST001       |         1 |         1 |
+----+-------------------+---------------+-----------+-----------+
```

### **2. Test Dry Run Mode (Recommended First!):**

**⚠️ ALWAYS test with --dry-run first to avoid sending real invoices!**

```bash
cd saas-app
php artisan netvisor:send-monthly-invoices --dry-run
```

#### **Expected Output:**

```
Starting monthly invoice generation...
Date: 2025-10-17 15:30:45
DRY RUN MODE - No invoices will be sent

Found 1 domain(s) to process

 1/1 [============================] 100%

[DRY RUN] Would create invoice for: test-company.com (TEST001)
[DRY RUN] Reference number would be: TEST0012510X
[DRY RUN] Amount: €122.76 (€99.00 + €23.76 VAT)

=== Invoice Generation Complete ===
```

**✅ Verify:**
- Found domains count > 0
- Dry run message appears
- Reference number generated correctly
- Amount calculated: €99 + 24% VAT = €122.76

### **3. Test Specific Domain:**

```bash
cd saas-app
php artisan netvisor:send-monthly-invoices --domain=test-company.com --dry-run
```

**Expected Output:**
```
Starting monthly invoice generation...
Date: 2025-10-17 15:30:45
DRY RUN MODE - No invoices will be sent

Found 1 domain(s) to process

[DRY RUN] Would create invoice for: test-company.com (TEST001)
[DRY RUN] Reference number would be: TEST0012510X
[DRY RUN] Amount: €122.76 (€99.00 + €23.76 VAT)

=== Invoice Generation Complete ===
```

### **4. Test No Domains Found:**

```bash
cd saas-app
php artisan netvisor:send-monthly-invoices --domain=nonexistent.com --dry-run
```

**Expected Output:**
```
Starting monthly invoice generation...
Date: 2025-10-17 15:30:45
DRY RUN MODE - No invoices will be sent

No domains found matching criteria
```

**✅ This is correct behavior!**

### **5. Test Real Invoice Creation (USE WITH CAUTION!):**

**⚠️ WARNING: This will send REAL invoices to Netvisor!**

**Only run this if:**
- ✅ You have valid Netvisor credentials
- ✅ Dry run works successfully
- ✅ You want to test actual invoice creation
- ✅ Test domain has valid `customer_code` that exists in Netvisor

```bash
cd saas-app

# Send invoice to ONE specific domain
php artisan netvisor:send-monthly-invoices --domain=test-company.com
```

**Expected Output (Success):**
```
Starting monthly invoice generation...
Date: 2025-10-17 15:30:45

Found 1 domain(s) to process

 1/1 [============================] 100%

✓ Invoice created for test-company.com: €122.76

=== Invoice Generation Complete ===
Successfully sent: 1
Failed: 0
```

**Check Laravel Logs:**
```bash
tail -f storage/logs/laravel.log
```

**Success Log:**
```
[2025-10-17 15:30:00] local.INFO: Invoice created successfully for domain: test-company.com
{"reference_number":"TEST0012510X","total_amount":122.76}
```

**Verify in Database:**
```sql
SELECT domain, last_synced_at FROM domains WHERE domain = 'test-company.com';
```

**Expected:**
```
+-------------------+---------------------+
| domain            | last_synced_at      |
+-------------------+---------------------+
| test-company.com  | 2025-10-17 15:30:00 | ← Updated!
+-------------------+---------------------+
```

### **6. Test Invoice Creation Failure:**

Test what happens when domain has invalid `customer_code`:

```sql
-- Create domain with invalid customer code
INSERT INTO domains (domain, customer_code, is_active, is_synced, created_at, updated_at)
VALUES ('invalid-test.com', 'INVALID999', 1, 1, NOW(), NOW());
```

```bash
php artisan netvisor:send-monthly-invoices --domain=invalid-test.com
```

**Expected Output:**
```
Starting monthly invoice generation...
Date: 2025-10-17 15:30:45

Found 1 domain(s) to process

 1/1 [============================] 100%

✗ Failed to create invoice for invalid-test.com: <Error message from Netvisor>

=== Invoice Generation Complete ===
Successfully sent: 0
Failed: 1
```

**✅ This is correct error handling!**

---

## 🔌 API Endpoint Testing

### **Prerequisites:**

1. Backend running: `php artisan serve`
2. User logged in to get auth token
3. Tool: Postman, Insomnia, or curl

### **Get Authentication Token:**

#### **Method 1: From Browser (Easiest)**

1. Login to frontend: http://localhost:3000
2. Open Developer Tools (F12) → Application tab → Local Storage
3. Find key: `token` or `access_token`
4. Copy the value (JWT token)

#### **Method 2: API Login**

```bash
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "Bearer",
  "expires_in": 31536000
}
```

Copy the `access_token` value.

---

### **Test Endpoint 1: Get Sales Invoices**

```bash
curl -X GET http://localhost:8000/api/netvisor/invoices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Expected Success Response:**
```json
{
  "SalesInvoiceList": {
    "SalesInvoice": [
      {
        "NetvisorKey": "12345",
        "InvoiceNumber": "INV-001",
        "InvoiceDate": "2025-10-17",
        "CustomerName": "Test Company",
        "InvoiceSum": "122.76"
      }
    ]
  }
}
```

**Expected Error Response (Invalid token):**
```json
{
  "message": "Unauthenticated."
}
```

**Expected Error Response (Netvisor credentials invalid):**
```json
{
  "error": true,
  "message": "401 Unauthorized"
}
```

---

### **Test Endpoint 2: Get Customers**

```bash
curl -X GET http://localhost:8000/api/netvisor/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "CustomerList": {
    "Customer": [
      {
        "NetvisorKey": "67890",
        "Name": "Customer Name",
        "Code": "CUST001",
        "OrganisationIdentifier": "1234567-8"
      }
    ]
  }
}
```

---

### **Test Endpoint 3: Get Products**

```bash
curl -X GET http://localhost:8000/api/netvisor/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "ProductList": {
    "Product": [
      {
        "NetvisorKey": "111",
        "ProductCode": "PROD-001",
        "Name": "Monthly Subscription",
        "UnitPrice": "99.00"
      }
    ]
  }
}
```

---

### **Test Endpoint 4: Get Specific Invoice**

```bash
curl -X GET "http://localhost:8000/api/netvisor/invoices/12345" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Replace `12345` with actual Netvisor invoice key.

**Expected Response:**
```json
{
  "SalesInvoice": {
    "NetvisorKey": "12345",
    "InvoiceNumber": "INV-001",
    "InvoiceDate": "2025-10-17",
    "CustomerName": "Test Company",
    "InvoiceSum": "122.76",
    "InvoiceLines": { ... }
  }
}
```

---

### **Test Endpoint 5: Create Invoice**

```bash
curl -X POST http://localhost:8000/api/netvisor/invoices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice": {
      "invoice_date": "2025-10-17",
      "delivery_date": "2025-10-17",
      "reference_number": "TEST0012510X",
      "amount": 99.00,
      "vat_amount": 23.76,
      "total_amount": 122.76,
      "seller": "Sales Person",
      "status": "unsent",
      "customer_number": "TEST001",
      "customer_name": "Test Company"
    },
    "lines": [
      {
        "product_name": "Monthly Subscription Fee",
        "product_code": "SUB-MONTHLY",
        "quantity": 1,
        "unit_price": 99.00,
        "vat_percent": 24,
        "description": "Monthly subscription for October 2025"
      }
    ]
  }'
```

**Expected Success Response:**
```json
{
  "ResponseStatus": {
    "Status": "OK"
  },
  "Replies": {
    "InsertedDataIdentifier": {
      "NetvisorKey": "98765"
    }
  }
}
```

**Expected Error Response (Invalid customer):**
```json
{
  "ResponseStatus": {
    "Status": "FAILED"
  },
  "Errors": {
    "Error": "Customer not found"
  }
}
```

---

### **Test Endpoint 6: Add Customer**

**⚠️ Uses hardcoded test data from controller!**

```bash
curl -X POST http://localhost:8000/api/netvisor/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "ResponseStatus": {
    "Status": "OK"
  },
  "Replies": {
    "InsertedDataIdentifier": {
      "NetvisorKey": "54321"
    }
  }
}
```

**Note:** This endpoint currently uses hardcoded test data. For production, it should accept customer data from request body.

---

## ⚠️ Common Issues & Solutions

### **Issue 1: "Table 'transactions' doesn't exist"**

**Cause:** Migration created `netvisor_transactions` but code is looking for old `transactions` table.

**Solution:**
```bash
cd saas-app
php artisan migrate:fresh
```

---

### **Issue 2: "Netvisor Connection Failed" (401/403)**

**Cause:** Invalid or missing Netvisor credentials in `.env`

**Solution:**
1. Check `.env` file has all `NETVISOR_*` variables
2. Verify credentials are correct (not placeholders)
3. Check `php artisan tinker` → `config('netvisor.customer_key')`
4. Restart Laravel: `php artisan config:clear && php artisan serve`

---

### **Issue 3: "No domains found matching criteria"**

**Cause:** No domains in database with `is_active=1`, `is_synced=1`, and `customer_code` set.

**Solution:**
```sql
-- Check existing domains
SELECT id, domain, customer_code, is_active, is_synced FROM domains;

-- Update existing domain
UPDATE domains
SET is_active = 1, is_synced = 1, customer_code = 'TEST001'
WHERE id = 1;

-- Or insert new test domain
INSERT INTO domains (domain, customer_code, is_active, is_synced, created_at, updated_at)
VALUES ('test.com', 'TEST001', 1, 1, NOW(), NOW());
```

---

### **Issue 4: "Class 'ArrayToXml' not found"**

**Cause:** Spatie package not installed or not loaded.

**Solution:**
```bash
cd saas-app
composer require spatie/array-to-xml
composer dump-autoload
```

---

### **Issue 5: "Unauthenticated" on API calls**

**Cause:** Missing or expired auth token.

**Solution:**
1. Login again to frontend
2. Get fresh token from Local Storage
3. Use `Bearer TOKEN` format in Authorization header
4. Verify token not expired (default: 1 year)

---

### **Issue 6: Command not found: netvisor:send-monthly-invoices**

**Cause:** Laravel hasn't loaded the new command.

**Solution:**
```bash
cd saas-app
composer dump-autoload
php artisan list | grep netvisor
# Should show: netvisor:send-monthly-invoices
```

---

### **Issue 7: "SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry"**

**Cause:** Transaction with same `transaction_id` already exists (UNIQUE constraint).

**Solution:**

This is **expected behavior**! The UNIQUE constraint prevents duplicate API calls.

If you need to clear transactions:
```sql
TRUNCATE TABLE netvisor_transactions;
```

---

### **Issue 8: Reference number check digit incorrect**

**Cause:** Modulo-10 algorithm implementation error.

**Test Reference Number Generation:**
```bash
cd saas-app
php artisan tinker
```

```php
$domain = new \App\Models\Domain();
$domain->customer_code = 'TEST001';

$base = $domain->customer_code . \Carbon\Carbon::now()->format('Ym');
echo "Base: " . $base . "\n";

$sum = 0;
$multipliers = [7, 3, 1];
$digits = str_split(strrev($base));

foreach ($digits as $index => $digit) {
    $mult = $multipliers[$index % 3];
    $sum += $digit * $mult;
    echo "Digit: {$digit} × {$mult} = " . ($digit * $mult) . "\n";
}

echo "Sum: " . $sum . "\n";
$checkDigit = (10 - ($sum % 10)) % 10;
echo "Check Digit: " . $checkDigit . "\n";
echo "Reference Number: " . $base . $checkDigit . "\n";

exit
```

**Expected Output:**
```
Base: TEST0012510
Digit: 0 × 7 = 0
Digit: 1 × 3 = 3
...
Sum: 87
Check Digit: 3
Reference Number: TEST00125103
```

---

## ✅ Test Checklist

Use this checklist to verify all features work:

### **Database Setup:**
- [ ] Migration `create_netvisor_transactions_table` ran successfully
- [ ] Table `netvisor_transactions` exists
- [ ] Column `transaction_id` has UNIQUE index
- [ ] Model `NetvisorTransaction` exists and works
- [ ] Migration `alter_domains_table_for_netvisor` ran successfully
- [ ] Domains table has 22 Netvisor-related fields

### **Configuration:**
- [ ] `.env` file has all 8 `NETVISOR_*` variables
- [ ] Config values load correctly in Tinker
- [ ] Valid Netvisor credentials (not placeholders)

### **Backend:**
- [ ] Laravel backend starts: `php artisan serve`
- [ ] 7 Netvisor routes exist: `php artisan route:list | grep netvisor`
- [ ] Logs show no errors on startup

### **Frontend:**
- [ ] React frontend starts: `npm start`
- [ ] Can login successfully
- [ ] Settings page loads
- [ ] "Verify Netvisor" button visible
- [ ] Button shows success/error alert

### **API Endpoints:**
- [ ] GET `/api/netvisor/invoices` returns data
- [ ] GET `/api/netvisor/customers` returns data
- [ ] GET `/api/netvisor/products` returns data
- [ ] GET `/api/netvisor/invoices/{key}` returns specific invoice
- [ ] POST `/api/netvisor/invoices` creates invoice
- [ ] POST `/api/netvisor/customers` adds customer
- [ ] All endpoints require authentication

### **Automated Billing:**
- [ ] Command exists: `php artisan list | grep netvisor`
- [ ] Dry run works with test domain
- [ ] Dry run shows correct reference number
- [ ] Dry run calculates €122.76 total
- [ ] Real invoice creation works (optional)
- [ ] Failed invoices show error message
- [ ] Success updates `last_synced_at` in database
- [ ] Progress bar displays correctly

### **Error Handling:**
- [ ] Invalid credentials show proper error
- [ ] Missing token returns 401 Unauthenticated
- [ ] Non-existent domain handled gracefully
- [ ] Duplicate transaction_id prevented by UNIQUE constraint
- [ ] Laravel logs capture all errors

---

## 🎯 Quick Test Script

Copy-paste this entire script to test everything quickly:

```bash
#!/bin/bash

echo "=== Visma Netvisor Integration Test ==="
echo ""

# 1. Check branch
echo "1. Checking branch..."
git branch | grep "* Visma-Netvisor-Integration" && echo "✅ Correct branch" || echo "❌ Wrong branch"
echo ""

# 2. Check migration
echo "2. Checking database..."
cd saas-app
php artisan migrate:status | grep "create_transactions_table" && echo "✅ Migration exists" || echo "❌ Migration missing"
echo ""

# 3. Check .env
echo "3. Checking configuration..."
grep "NETVISOR_BASE_URL" .env && echo "✅ Config found" || echo "❌ Config missing"
echo ""

# 4. Check routes
echo "4. Checking routes..."
php artisan route:list | grep -c "netvisor" | awk '{if ($1 == 7) print "✅ All 7 routes exist"; else print "❌ Missing routes: " 7-$1}'
echo ""

# 5. Check command
echo "5. Checking command..."
php artisan list | grep "netvisor:send-monthly-invoices" && echo "✅ Command exists" || echo "❌ Command missing"
echo ""

# 6. Test dry run
echo "6. Testing dry run..."
php artisan netvisor:send-monthly-invoices --dry-run 2>&1 | grep "DRY RUN MODE" && echo "✅ Dry run works" || echo "❌ Dry run failed"
echo ""

echo "=== Test Complete ==="
```

**Save as:** `test-netvisor.sh`

**Run:**
```bash
chmod +x test-netvisor.sh
./test-netvisor.sh
```

---

## 📝 Test Report Template

After testing, document your results:

```markdown
# Visma Netvisor Integration Test Report

**Date:** 2025-10-17
**Tester:** [Your Name]
**Environment:** macOS / Windows / Linux
**PHP Version:** 8.x
**Laravel Version:** 9.x

## Test Results

### Database Migration
- [ ] PASS / [ ] FAIL - Migration ran successfully
- [ ] PASS / [ ] FAIL - netvisor_transactions table created
- [ ] PASS / [ ] FAIL - transaction_id has UNIQUE index

### Configuration
- [ ] PASS / [ ] FAIL - .env has all Netvisor credentials
- [ ] PASS / [ ] FAIL - Config loads in Tinker

### Backend
- [ ] PASS / [ ] FAIL - Backend starts without errors
- [ ] PASS / [ ] FAIL - All 7 routes exist

### Frontend
- [ ] PASS / [ ] FAIL - Frontend starts without errors
- [ ] PASS / [ ] FAIL - Verify Netvisor button works
- [ ] PASS / [ ] FAIL - Shows success/error alert

### API Endpoints (with valid credentials)
- [ ] PASS / [ ] FAIL - GET /invoices
- [ ] PASS / [ ] FAIL - GET /customers
- [ ] PASS / [ ] FAIL - GET /products
- [ ] PASS / [ ] FAIL - POST /invoices
- [ ] PASS / [ ] FAIL - GET /invoices/{key}

### Automated Billing
- [ ] PASS / [ ] FAIL - Dry run works
- [ ] PASS / [ ] FAIL - Reference number generated correctly
- [ ] PASS / [ ] FAIL - Amount calculated correctly (€122.76)
- [ ] PASS / [ ] FAIL - Real invoice creation (optional)

## Issues Found

1. [Issue description]
   - **Error:** [Error message]
   - **Solution:** [How fixed]

2. ...

## Recommendations

- [Any suggestions for improvement]

## Overall Status

- [ ] ✅ ALL TESTS PASSED - Ready for production
- [ ] ⚠️ MINOR ISSUES - Needs polish
- [ ] ❌ CRITICAL ISSUES - Needs fixes
```

---

## 📞 Support

If you encounter issues not covered here:

1. Check Laravel logs: `tail -f saas-app/storage/logs/laravel.log`
2. Check browser console (F12)
3. Review VismaNetvisor.md for implementation details
4. Test with `--dry-run` first before real API calls

---

*Document created: 2025-10-17*
*Branch: Visma-Netvisor-Integration*
*Status: ✅ Complete Testing Guide*
