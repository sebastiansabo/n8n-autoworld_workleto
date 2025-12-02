# Comprehensive Test Plan
## ATW_WKT_Live Workflow Testing & Validation

**Version:** 1.0  
**Date:** December 2, 2024  
**Status:** Ready for Execution

---

## 📋 Table of Contents

1. [Test Overview](#test-overview)
2. [Pre-Test Setup](#pre-test-setup)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [Performance Tests](#performance-tests)
6. [Security Tests](#security-tests)
7. [Edge Case Tests](#edge-case-tests)
8. [Regression Tests](#regression-tests)
9. [Acceptance Criteria](#acceptance-criteria)
10. [Test Data](#test-data)

---

## Test Overview

### Objectives

- ✅ Verify all code fixes are working
- ✅ Validate performance improvements
- ✅ Ensure data integrity
- ✅ Confirm no regressions
- ✅ Test edge cases and error handling

### Test Environment

| Component | Details |
|-----------|---------|
| **n8n Version** | Latest stable (1.122.3+) |
| **Environment** | Development → Staging → Production |
| **Test Data** | 10 items (small), 50 items (medium), 200 items (full) |
| **Duration** | ~4 hours total |

### Test Phases

1. **Phase 1:** Unit Tests (1 hour)
2. **Phase 2:** Integration Tests (1.5 hours)
3. **Phase 3:** Performance Tests (1 hour)
4. **Phase 4:** Final Validation (30 min)

---

## Pre-Test Setup

### 1. Environment Preparation

```bash
# Checklist
- [ ] n8n instance accessible
- [ ] Apify credentials configured
- [ ] Shopify credentials configured
- [ ] Test Shopify store available
- [ ] Backup of current workflow
- [ ] Test data prepared
```

### 2. Backup Current State

```bash
# Export current workflow
1. Open n8n
2. Go to Workflows → ATW_WKT_Live
3. Click "..." → Export
4. Save as: ATW_WKT_Live_BACKUP_$(date +%Y%m%d).json
```

### 3. Import Fixed Workflow

```bash
# Import the fixed version
1. Copy NORMALIZE_DATA_FIXED.js content
2. Open ATW_WKT_Live-OPTIMIZED.json in n8n
3. Replace "Normalize Data" node code
4. Save as: ATW_WKT_Live_FIXED
5. Do NOT activate yet
```

### 4. Prepare Test Data

Create test dataset with known values:

```json
{
  "test_items": [
    {
      "stockId": "TEST-001",
      "vin": "WVWZZZ1KZBW123456",
      "title": "BMW X5 2020",
      "brand": "BMW",
      "model": "X5",
      "year": "2020",
      "priceEur": 45000,
      "fuel": "Diesel",
      "transmission": "Automată",
      "body": "SUV",
      "color": "Negru",
      "mileageKm": 50000,
      "horsepower": 265,
      "displacementCc": 2993,
      "drivetrain": "4x4",
      "vatType": "Deductibil",
      "features": "Piele, Navigație, Xenon",
      "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
    }
  ]
}
```

---

## Unit Tests

### Test 1.1: Slugify Function

**Objective:** Verify URL-friendly slug generation

**Test Cases:**

```javascript
// Test Case 1: Basic text
Input: "BMW X5 2020"
Expected: "bmw-x5-2020"

// Test Case 2: Romanian characters
Input: "Mașină Albastră"
Expected: "masina-albastra"

// Test Case 3: Special characters
Input: "Test!@#$%Product"
Expected: "test-product"

// Test Case 4: Multiple spaces
Input: "Test    Multiple    Spaces"
Expected: "test-multiple-spaces"

// Test Case 5: Long text (>255 chars)
Input: "A".repeat(300)
Expected: Length <= 255

// Test Case 6: Empty string
Input: ""
Expected: "product"
```

**Validation:**
```javascript
function testSlugify() {
    const tests = [
        { input: "BMW X5 2020", expected: "bmw-x5-2020" },
        { input: "Mașină Albastră", expected: "masina-albastra" },
        { input: "Test!@#$%Product", expected: "test-product" },
        { input: "Test    Multiple    Spaces", expected: "test-multiple-spaces" },
        { input: "A".repeat(300), expectedLength: 255 },
        { input: "", expected: "product" }
    ];
    
    tests.forEach((test, i) => {
        const result = slugify(test.input);
        if (test.expected) {
            console.assert(result === test.expected, 
                `Test ${i+1} failed: expected "${test.expected}", got "${result}"`);
        } else if (test.expectedLength) {
            console.assert(result.length <= test.expectedLength,
                `Test ${i+1} failed: length ${result.length} > ${test.expectedLength}`);
        }
    });
    
    console.log("✅ Slugify tests passed");
}
```

### Test 1.2: HTML Escaping

**Objective:** Prevent XSS injection

**Test Cases:**

```javascript
// Test Case 1: Basic HTML tags
Input: "<script>alert('XSS')</script>"
Expected: "&lt;script&gt;alert('XSS')&lt;/script&gt;"

// Test Case 2: Quotes
Input: 'Test "quoted" text'
Expected: "Test &quot;quoted&quot; text"

// Test Case 3: Ampersands
Input: "Tom & Jerry"
Expected: "Tom &amp; Jerry"

// Test Case 4: Mixed
Input: "<div class='test'>Content</div>"
Expected: "&lt;div class=&#39;test&#39;&gt;Content&lt;/div&gt;"

// Test Case 5: Already escaped
Input: "&lt;div&gt;"
Expected: "&amp;lt;div&amp;gt;"
```

**Validation:**
```javascript
function testEscapeHtml() {
    const tests = [
        { 
            input: "<script>alert('XSS')</script>",
            expected: "&lt;script&gt;alert('XSS')&lt;/script&gt;"
        },
        {
            input: 'Test "quoted" text',
            expected: "Test &quot;quoted&quot; text"
        },
        {
            input: "Tom & Jerry",
            expected: "Tom &amp; Jerry"
        }
    ];
    
    tests.forEach((test, i) => {
        const result = escapeHtml(test.input);
        console.assert(result === test.expected,
            `Test ${i+1} failed: expected "${test.expected}", got "${result}"`);
    });
    
    console.log("✅ HTML escape tests passed");
}
```

### Test 1.3: Image Extraction

**Objective:** Extract first image URL from various formats

**Test Cases:**

```javascript
// Test Case 1: Array of URLs
Input: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
Expected: "https://example.com/img1.jpg"

// Test Case 2: Single URL string
Input: "https://example.com/img1.jpg"
Expected: "https://example.com/img1.jpg"

// Test Case 3: JSON string
Input: '["https://example.com/img1.jpg"]'
Expected: "https://example.com/img1.jpg"

// Test Case 4: Object with src
Input: { src: "https://example.com/img1.jpg" }
Expected: "https://example.com/img1.jpg"

// Test Case 5: Empty/null
Input: null
Expected: ""

// Test Case 6: Empty array
Input: []
Expected: ""
```

**Validation:**
```javascript
function testExtractFirstImage() {
    const tests = [
        {
            input: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
            expected: "https://example.com/img1.jpg"
        },
        {
            input: "https://example.com/img1.jpg",
            expected: "https://example.com/img1.jpg"
        },
        {
            input: '["https://example.com/img1.jpg"]',
            expected: "https://example.com/img1.jpg"
        },
        {
            input: { src: "https://example.com/img1.jpg" },
            expected: "https://example.com/img1.jpg"
        },
        {
            input: null,
            expected: ""
        },
        {
            input: [],
            expected: ""
        }
    ];
    
    tests.forEach((test, i) => {
        const result = extractFirstImage(test.input);
        console.assert(result === test.expected,
            `Test ${i+1} failed: expected "${test.expected}", got "${result}"`);
    });
    
    console.log("✅ Image extraction tests passed");
}
```

### Test 1.4: Price Calculations

**Objective:** Verify VAT calculations are correct

**Test Cases:**

```javascript
// Test Case 1: Normal price
Input: 12100
Expected: "10000.00" (12100 / 1.21)

// Test Case 2: Price with decimals
Input: 12100.50
Expected: "10000.41"

// Test Case 3: Zero price
Input: 0
Expected: "0.00"

// Test Case 4: Negative price
Input: -100
Expected: ""

// Test Case 5: Invalid input
Input: "not a number"
Expected: ""

// Test Case 6: Null
Input: null
Expected: ""
```

**Validation:**
```javascript
function testCalculateNetPrice() {
    const tests = [
        { input: 12100, expected: "10000.00" },
        { input: 12100.50, expected: "10000.41" },
        { input: 0, expected: "0.00" },
        { input: -100, expected: "" },
        { input: "not a number", expected: "" },
        { input: null, expected: "" }
    ];
    
    tests.forEach((test, i) => {
        const result = calculateNetPrice(test.input);
        console.assert(result === test.expected,
            `Test ${i+1} failed: expected "${test.expected}", got "${result}"`);
    });
    
    console.log("✅ Price calculation tests passed");
}
```

### Test 1.5: Power Conversion

**Objective:** Verify HP to KW conversion

**Test Cases:**

```javascript
// Test Case 1: Normal value
Input: 265 HP
Expected: { kw: 195, cp: 265 }

// Test Case 2: Small value
Input: 75 HP
Expected: { kw: 55, cp: 75 }

// Test Case 3: Large value
Input: 500 HP
Expected: { kw: 368, cp: 500 }

// Test Case 4: Zero
Input: 0
Expected: null

// Test Case 5: Negative
Input: -100
Expected: null

// Test Case 6: Invalid
Input: "abc"
Expected: null
```

**Validation:**
```javascript
function testConvertPower() {
    const tests = [
        { input: 265, expected: { kw: 195, cp: 265 } },
        { input: 75, expected: { kw: 55, cp: 75 } },
        { input: 500, expected: { kw: 368, cp: 500 } },
        { input: 0, expected: null },
        { input: -100, expected: null },
        { input: "abc", expected: null }
    ];
    
    tests.forEach((test, i) => {
        const result = convertPower(test.input);
        if (test.expected === null) {
            console.assert(result === null,
                `Test ${i+1} failed: expected null, got ${JSON.stringify(result)}`);
        } else {
            console.assert(result.kw === test.expected.kw && result.cp === test.expected.cp,
                `Test ${i+1} failed: expected ${JSON.stringify(test.expected)}, got ${JSON.stringify(result)}`);
        }
    });
    
    console.log("✅ Power conversion tests passed");
}
```

---

## Integration Tests

### Test 2.1: Full Data Transformation

**Objective:** Verify complete item transformation

**Test Procedure:**

1. **Prepare Test Item:**
```json
{
  "stockId": "TEST-001",
  "vin": "WVWZZZ1KZBW123456",
  "title": "BMW X5 2020",
  "brand": "BMW",
  "model": "X5",
  "year": "2020",
  "priceEur": 45000,
  "fuel": "Diesel",
  "transmission": "Automată",
  "body": "SUV",
  "color": "Negru",
  "mileageKm": 50000,
  "horsepower": 265,
  "displacementCc": 2993,
  "drivetrain": "4x4",
  "vatType": "Deductibil",
  "features": "Piele, Navigație, Xenon",
  "images": ["https://example.com/img1.jpg"]
}
```

2. **Run Transformation:**
```javascript
const result = transformItem(testItem);
```

3. **Validate Output:**
```javascript
// Check all required fields
const requiredFields = [
    'Title',
    'Handle',
    'Variant SKU',
    'Variant Price',
    'Vendor',
    'Type',
    'Tags',
    'Image Src',
    'Body HTML'
];

requiredFields.forEach(field => {
    console.assert(result[field] !== undefined && result[field] !== '',
        `Missing or empty field: ${field}`);
});

// Check specific values
console.assert(result.Title === "BMW X5 2020", "Title mismatch");
console.assert(result['Variant SKU'] === "WVWZZZ1KZBW123456", "SKU mismatch");
console.assert(result['Variant Price'] === "45000", "Price mismatch");
console.assert(result.Vendor === "Autoworld", "Vendor mismatch");

// Check metafields
console.assert(result['Metafield: custom.pret_fara_tva [single_line_text_field]'] === "37190.08",
    "Net price calculation incorrect");
console.assert(result['Metafield: custom.putere_kw [single_line_text_field]'] === "195",
    "KW conversion incorrect");
console.assert(result['Metafield: custom.putere_cp [single_line_text_field]'] === "265",
    "CP value incorrect");

// Check HTML escaping in Body HTML
console.assert(!result['Body HTML'].includes('<script>'),
    "HTML not properly escaped");

console.log("✅ Full transformation test passed");
```

### Test 2.2: Normalize Data Node

**Objective:** Test complete node execution

**Test Procedure:**

1. **Setup:**
   - Create test workflow with only "Normalize Data" node
   - Inject test data (10 items)

2. **Execute:**
   - Run workflow manually
   - Monitor execution logs

3. **Validate:**
```javascript
// Check output count
console.assert(output.length === 10, `Expected 10 items, got ${output.length}`);

// Check for errors
const errors = output.filter(item => item.json.error);
console.assert(errors.length === 0, `Found ${errors.length} errors`);

// Validate random samples
const sample1 = output[0].json;
console.assert(sample1.Title, "Missing title in output");
console.assert(sample1['Variant SKU'], "Missing SKU in output");
console.assert(sample1['Body HTML'], "Missing Body HTML in output");

console.log("✅ Normalize Data node test passed");
```

### Test 2.3: Split Images Node

**Objective:** Verify image splitting works correctly

**Test Data:**
```json
{
  "Title": "Test Product",
  "Image Src": ["img1.jpg", "img2.jpg", "img3.jpg"],
  "images": ["img4.jpg", "img5.jpg"]
}
```

**Expected Output:**
```json
{
  "Title": "Test Product",
  "Image 1": "img1.jpg",
  "Image 2": "img2.jpg",
  "Image 3": "img3.jpg",
  "Image 4": "img4.jpg",
  "Image 5": "img5.jpg"
  // Original "Image Src" and "images" fields removed
}
```

**Validation:**
```javascript
// Check image fields created
for (let i = 1; i <= 5; i++) {
    console.assert(output[`Image ${i}`], `Missing Image ${i}`);
}

// Check original fields removed
console.assert(!output['Image Src'], "Image Src not removed");
console.assert(!output.images, "images not removed");

console.log("✅ Split Images test passed");
```

### Test 2.4: Unified Filter Node

**Objective:** Verify CREATE/UPDATE/DEACTIVATE logic

**Test Scenarios:**

**Scenario A: New Product (CREATE)**
```javascript
// Shopify: Empty
// Incoming: SKU "TEST-001"
// Expected: action = 'create'

const result = unifiedFilter([], [{ 'Variant SKU': 'TEST-001' }]);
console.assert(result[0].json.action === 'create', "Should be CREATE action");
```

**Scenario B: Existing Product (UPDATE)**
```javascript
// Shopify: SKU "TEST-001" exists
// Incoming: SKU "TEST-001" with new price
// Expected: action = 'update'

const shopifyData = [{ sku: 'TEST-001', product_id: '123' }];
const incomingData = [{ 'Variant SKU': 'TEST-001', 'Variant Price': '50000' }];
const result = unifiedFilter(shopifyData, incomingData);

console.assert(result[0].json.action === 'update', "Should be UPDATE action");
console.assert(result[0].json.shopify_product_id === '123', "Product ID mismatch");
```

**Scenario C: Removed Product (DEACTIVATE)**
```javascript
// Shopify: SKU "TEST-002" exists
// Incoming: No SKU "TEST-002"
// Expected: action = 'deactivate'

const shopifyData = [{ sku: 'TEST-002', product_id: '456' }];
const incomingData = [{ 'Variant SKU': 'TEST-001' }];
const result = unifiedFilter(shopifyData, incomingData);

const deactivateItem = result.find(r => r.json.action === 'deactivate');
console.assert(deactivateItem, "Should have DEACTIVATE action");
console.assert(deactivateItem.json.sku_raw === 'TEST-002', "Wrong SKU deactivated");
```

**Scenario D: Duplicate SKUs (DEDUPLICATION)**
```javascript
// Incoming: Same SKU appears 3 times
// Expected: Only 1 output, duplicates removed

const incomingData = [
    { 'Variant SKU': 'TEST-001', Title: 'Product 1' },
    { 'Variant SKU': 'TEST-001', Title: 'Product 1' },
    { 'Variant SKU': 'TEST-001', Title: 'Product 1' }
];
const result = unifiedFilter([], incomingData);

console.assert(result.length === 1, `Expected 1 item, got ${result.length}`);
console.log("✅ Deduplication working");
```

### Test 2.5: End-to-End Workflow

**Objective:** Test complete workflow execution

**Test Procedure:**

1. **Setup:**
   - Activate fixed workflow
   - Use test Shopify store
   - Prepare 10 test items in Apify dataset

2. **Execute:**
   - Trigger workflow manually
   - Monitor all nodes

3. **Validate:**

```javascript
// Check each phase
const phases = {
    'Get Apify Dataset': { expected: 10 },
    'Normalize Data': { expected: 10 },
    'Split Images': { expected: 10 },
    'Get Shopify Products': { expected: 1 },
    'Unified Filter': { expected: 10 },
    'Route: Create?': { expected: 10 },
    'Create Product': { expected: 10 },
    'Build Metafields': { expected: 10 },
    'Update Variant': { expected: 10 },
    'Set Metafields': { expected: 10 }
};

Object.entries(phases).forEach(([node, config]) => {
    const output = $(node).all();
    console.assert(output.length === config.expected,
        `${node}: expected ${config.expected}, got ${output.length}`);
});

// Check Shopify store
// Manually verify 10 products created
// Check metafields populated
// Verify images loaded

console.log("✅ End-to-end test passed");
```

---

## Performance Tests

### Test 3.1: Execution Time

**Objective:** Verify performance improvements

**Test Procedure:**

1. **Small Dataset (10 items):**
```javascript
const start = Date.now();
// Execute workflow
const duration = Date.now() - start;

console.assert(duration < 30000, `Execution took ${duration}ms, expected < 30s`);
console.log(`✅ Small dataset: ${duration}ms`);
```

**Target:** < 30 seconds

2. **Medium Dataset (50 items):**
```javascript
const start = Date.now();
// Execute workflow
const duration = Date.now() - start;

console.assert(duration < 70000, `Execution took ${duration}ms, expected < 70s`);
console.log(`✅ Medium dataset: ${duration}ms`);
```

**Target:** < 70 seconds

3. **Large Dataset (200 items):**
```javascript
const start = Date.now();
// Execute workflow
const duration = Date.now() - start;

console.assert(duration < 120000, `Execution took ${duration}ms, expected < 120s`);
console.log(`✅ Large dataset: ${duration}ms`);
```

**Target:** < 120 seconds

### Test 3.2: API Call Count

**Objective:** Verify API usage reduction

**Test Procedure:**

1. **Monitor API Calls:**
```javascript
// Use n8n execution logs
// Count API calls per execution

const apiCalls = {
    apify: 0,
    shopify_graphql: 0,
    shopify_rest: 0
};

// Parse logs and count
// Expected: < 400 total calls for 200 items

console.assert(apiCalls.apify + apiCalls.shopify_graphql + apiCalls.shopify_rest < 400,
    `Too many API calls: ${JSON.stringify(apiCalls)}`);
```

**Targets:**
- Apify: 1 call
- Shopify GraphQL: 1 call (Get Products)
- Shopify REST: ~10-20 calls (Creates)
- **Total:** < 400 calls for 200 items

### Test 3.3: Memory Usage

**Objective:** Monitor memory consumption

**Test Procedure:**

1. **Check n8n Logs:**
```bash
# Monitor during execution
docker stats n8n  # If using Docker
# OR
top -p $(pgrep -f n8n)  # If running directly
```

**Target:** Peak memory < 200MB

### Test 3.4: Error Rate

**Objective:** Measure execution reliability

**Test Procedure:**

1. **Run 10 Executions:**
```javascript
let successCount = 0;
let failureCount = 0;

for (let i = 0; i < 10; i++) {
    try {
        // Execute workflow
        successCount++;
    } catch (error) {
        failureCount++;
        console.log(`Execution ${i+1} failed: ${error.message}`);
    }
}

const errorRate = (failureCount / 10) * 100;
console.assert(errorRate < 2, `Error rate ${errorRate}% exceeds 2% threshold`);
console.log(`✅ Error rate: ${errorRate}%`);
```

**Target:** < 2% error rate

---

## Security Tests

### Test 4.1: XSS Prevention

**Objective:** Verify HTML injection is prevented

**Test Data:**
```json
{
  "title": "<script>alert('XSS')</script>",
  "brand": "<img src=x onerror=alert('XSS')>",
  "features": "Normal feature <script>malicious()</script>"
}
```

**Validation:**
```javascript
const result = transformItem(testData);

// Check Body HTML doesn't contain unescaped scripts
console.assert(!result['Body HTML'].includes('<script>'),
    "Script tag not escaped");
console.assert(!result['Body HTML'].includes('onerror='),
    "Event handler not escaped");
console.assert(result['Body HTML'].includes('&lt;script&gt;'),
    "Script not properly escaped");

console.log("✅ XSS prevention test passed");
```

### Test 4.2: SQL Injection (N/A)

Not applicable - workflow doesn't use SQL databases.

### Test 4.3: Credential Security

**Objective:** Verify credentials are not exposed

**Test Procedure:**

1. **Check Workflow JSON:**
```bash
# Search for hardcoded tokens
grep -i "shpat_" ATW_WKT_Live_FIXED.json
grep -i "apify" ATW_WKT_Live_FIXED.json

# Should find: "YOUR_SHOPIFY_ACCESS_TOKEN" (placeholder)
# Should NOT find: Actual token values
```

2. **Check Execution Logs:**
```javascript
// Verify logs don't contain credentials
const logs = getExecutionLogs();
console.assert(!logs.includes('shpat_'), "Token exposed in logs");
console.assert(!logs.includes('apify_key'), "API key exposed in logs");
```

---

## Edge Case Tests

### Test 5.1: Missing Data

**Objective:** Handle missing/null fields gracefully

**Test Cases:**

```javascript
// Test Case 1: Missing title
const test1 = { brand: "BMW", model: "X5" };
const result1 = transformItem(test1);
console.assert(result1.Title === "BMW X5", "Should generate title from brand+model");

// Test Case 2: Missing price
const test2 = { title: "Test", priceEur: null };
const result2 = transformItem(test2);
console.assert(result2['Variant Price'] === '', "Should handle null price");

// Test Case 3: Missing images
const test3 = { title: "Test", images: null };
const result3 = transformItem(test3);
console.assert(result3['Image Src'] === '', "Should handle null images");

// Test Case 4: Missing SKU
const test4 = { title: "Test", vin: null, stockId: null };
const result4 = transformItem(test4);
console.assert(result4['Variant SKU'] === '', "Should handle missing SKU");

console.log("✅ Missing data tests passed");
```

### Test 5.2: Invalid Data Types

**Objective:** Handle incorrect data types

**Test Cases:**

```javascript
// Test Case 1: Price as string
const test1 = { priceEur: "45000" };
const result1 = transformItem(test1);
console.assert(result1['Variant Price'] === "45000", "Should handle string price");

// Test Case 2: Mileage as string
const test2 = { mileageKm: "50000" };
const result2 = transformItem(test2);
console.assert(result2['Metafield: custom.km [single_line_text_field]'] === "50000",
    "Should handle string mileage");

// Test Case 3: Year as number
const test3 = { year: 2020 };
const result3 = transformItem(test3);
console.assert(result3['Metafield: custom.data_livrarii [single_line_text_field]'] === "2020",
    "Should handle number year");

console.log("✅ Invalid data type tests passed");
```

### Test 5.3: Extreme Values

**Objective:** Handle boundary conditions

**Test Cases:**

```javascript
// Test Case 1: Very long title
const test1 = { title: "A".repeat(500) };
const result1 = transformItem(test1);
console.assert(result1.Handle.length <= 255, "Handle should be truncated");

// Test Case 2: Zero price
const test2 = { priceEur: 0 };
const result2 = transformItem(test2);
console.assert(result2['Metafield: custom.pret_fara_tva [single_line_text_field]'] === "0.00",
    "Should handle zero price");

// Test Case 3: Negative mileage
const test3 = { mileageKm: -1000 };
const result3 = transformItem(test3);
console.assert(result3['Metafield: custom.km [single_line_text_field]'] === "-1000",
    "Should preserve negative mileage");

// Test Case 4: Very high horsepower
const test4 = { horsepower: 10000 };
const result4 = transformItem(test4);
console.assert(result4['Metafield: custom.putere_cp [single_line_text_field]'] === "10000",
    "Should handle extreme horsepower");

console.log("✅ Extreme value tests passed");
```

### Test 5.4: Duplicate SKUs

**Objective:** Verify deduplication works

**Test Data:**
```json
[
  { "Variant SKU": "TEST-001", "Title": "Product 1" },
  { "Variant SKU": "TEST-001", "Title": "Product 1" },
  { "Variant SKU": "TEST-001", "Title": "Product 1" },
  { "Variant SKU": "TEST-002", "Title": "Product 2" }
]
```

**Expected:**
- Output: 2 items (TEST-001, TEST-002)
- Duplicates removed: 2

**Validation:**
```javascript
const result = unifiedFilter([], testData);
console.assert(result.length === 2, `Expected 2 items, got ${result.length}`);

const skus = result.map(r => r.json.sku_key);
const uniqueSkus = [...new Set(skus)];
console.assert(skus.length === uniqueSkus.length, "Duplicates not removed");

console.log("✅ Duplicate SKU test passed");
```

---

## Regression Tests

### Test 6.1: Original Functionality

**Objective:** Ensure no existing features broken

**Test Checklist:**

```javascript
// All original features still work
- [ ] Products created in Shopify
- [ ] Metafields populated
- [ ] Images uploaded
- [ ] Prices set correctly
- [ ] Tags applied
- [ ] Product type set
- [ ] Vendor set to "Autoworld"
- [ ] Handle generated correctly
```

### Test 6.2: Compare with Original

**Objective:** Verify output matches original workflow

**Test Procedure:**

1. **Run Original Workflow:**
   - Execute with 10 test items
   - Export results

2. **Run Fixed Workflow:**
   - Execute with same 10 test items
   - Export results

3. **Compare:**
```javascript
// Fields that SHOULD match
const fieldsToMatch = [
    'Title',
    'Variant SKU',
    'Vendor',
    'Type',
    'Tags'
];

fieldsToMatch.forEach(field => {
    console.assert(original[field] === fixed[field],
        `Field ${field} mismatch: "${original[field]}" vs "${fixed[field]}"`);
});

// Fields that SHOULD differ (improvements)
const improvedFields = [
    'Image Src',  // Now extracts first URL properly
    'Body HTML'   // Now has HTML escaping
];

console.log("✅ Regression test passed");
```

---

## Acceptance Criteria

### Must Pass (Blocking)

- ✅ All unit tests pass (100%)
- ✅ No XSS vulnerabilities
- ✅ No syntax errors
- ✅ Execution time < 120s for 200 items
- ✅ Error rate < 2%
- ✅ Zero duplicate products created
- ✅ All metafields populated correctly

### Should Pass (Non-Blocking)

- ⚠️ API calls < 400 per execution
- ⚠️ Memory usage < 200MB
- ⚠️ SKU match accuracy > 99%
- ⚠️ Price update ratio < 10%

### Nice to Have

- 💡 Execution time < 90s
- 💡 API calls < 300
- 💡 Memory usage < 150MB

---

## Test Data

### Sample Test Dataset

```json
{
  "test_items": [
    {
      "stockId": "TEST-001",
      "vin": "WVWZZZ1KZBW123456",
      "title": "BMW X5 2020",
      "brand": "BMW",
      "model": "X5",
      "year": "2020",
      "priceEur": 45000,
      "fuel": "Diesel",
      "transmission": "Automată",
      "body": "SUV",
      "color": "Negru",
      "mileageKm": 50000,
      "horsepower": 265,
      "displacementCc": 2993,
      "drivetrain": "4x4",
      "vatType": "Deductibil",
      "features": "Piele, Navigație, Xenon",
      "images": ["https://example.com/img1.jpg"]
    },
    {
      "stockId": "TEST-002",
      "vin": "WBAAA1234567890",
      "title": "Audi A4 2019",
      "brand": "Audi",
      "model": "A4",
      "year": "2019",
      "priceEur": 28000,
      "fuel": "Benzină",
      "transmission": "Manuală",
      "body": "Sedan",
      "color": "Alb",
      "mileageKm": 75000,
      "horsepower": 150,
      "displacementCc": 1984,
      "drivetrain": "Fata",
      "vatType": "Nedeductibil",
      "features": "Climatronic, Senzori parcare",
      "images": ["https://example.com/img2.jpg", "https://example.com/img3.jpg"]
    }
  ]
}
```

---

## Test Execution Log

### Execution Template

```markdown
## Test Execution: [Date]

**Tester:** [Name]
**Environment:** [Dev/Staging/Prod]
**n8n Version:** [Version]

### Results

| Test ID | Test Name | Status | Duration | Notes |
|---------|-----------|--------|----------|-------|
| 1.1 | Slugify Function | ✅ PASS | 5s | All cases passed |
| 1.2 | HTML Escaping | ✅ PASS | 3s | XSS prevented |
| 1.3 | Image Extraction | ✅ PASS | 4s | All formats handled |
| ... | ... | ... | ... | ... |

### Summary

- **Total Tests:** 30
- **Passed:** 28
- **Failed:** 2
- **Blocked:** 0
- **Pass Rate:** 93.3%

### Failed Tests

1. **Test 3.1** - Execution time exceeded (125s > 120s target)
   - **Action:** Optimize image processing
   
2. **Test 5.3** - Negative mileage not handled
   - **Action:** Add validation

### Overall Status

- [ ] Ready for Production
- [x] Needs Fixes
- [ ] Blocked

### Next Steps

1. Fix failed tests
2. Re-run regression tests
3. Schedule production deployment
```

---

## Appendix: Test Scripts

### Quick Test Runner

```javascript
// test-runner.js
// Run all unit tests

function runAllTests() {
    console.log("=== RUNNING ALL TESTS ===\n");
    
    const tests = [
        { name: "Slugify", fn: testSlugify },
        { name: "HTML Escape", fn: testEscapeHtml },
        { name: "Image Extract", fn: testExtractFirstImage },
        { name: "Price Calc", fn: testCalculateNetPrice },
        { name: "Power Convert", fn: testConvertPower }
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
        try {
            test.fn();
            passed++;
            console.log(`✅ ${test.name} PASSED`);
        } catch (error) {
            failed++;
            console.log(`❌ ${test.name} FAILED: ${error.message}`);
        }
    });
    
    console.log(`\n=== RESULTS ===`);
    console.log(`Passed: ${passed}/${tests.length}`);
    console.log(`Failed: ${failed}/${tests.length}`);
    console.log(`Pass Rate: ${(passed/tests.length*100).toFixed(1)}%`);
    
    return failed === 0;
}

// Run tests
runAllTests();
```

---

**Test Plan Version:** 1.0  
**Last Updated:** December 2, 2024  
**Status:** ✅ Ready for Execution

**Next Review:** After first production deployment

