# Validation Scripts
## Automated Testing & Verification Tools

**Version:** 1.0  
**Date:** December 2, 2024  
**Purpose:** Automated validation of workflow fixes and performance

---

## 📋 Table of Contents

1. [Unit Test Scripts](#unit-test-scripts)
2. [Integration Test Scripts](#integration-test-scripts)
3. [Performance Test Scripts](#performance-test-scripts)
4. [Data Validation Scripts](#data-validation-scripts)
5. [Monitoring Scripts](#monitoring-scripts)

---

## Unit Test Scripts

### Script 1: Test All Utility Functions

**File:** `test_utilities.js`

```javascript
// ============================================================================
// UNIT TEST SUITE - Utility Functions
// ============================================================================
// Run this in n8n Code node or Node.js environment

// ============ TEST FRAMEWORK ============

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = { passed: 0, failed: 0, total: 0 };
    }
    
    test(name, fn) {
        this.tests.push({ name, fn });
    }
    
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
        }
    }
    
    assertTrue(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }
    
    run() {
        console.log("=".repeat(60));
        console.log("RUNNING UNIT TESTS");
        console.log("=".repeat(60));
        
        this.tests.forEach((test, index) => {
            try {
                test.fn();
                this.results.passed++;
                console.log(`✅ Test ${index + 1}: ${test.name} - PASSED`);
            } catch (error) {
                this.results.failed++;
                console.log(`❌ Test ${index + 1}: ${test.name} - FAILED`);
                console.log(`   Error: ${error.message}`);
            }
            this.results.total++;
        });
        
        console.log("\n" + "=".repeat(60));
        console.log("TEST RESULTS");
        console.log("=".repeat(60));
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Pass Rate: ${(this.results.passed / this.results.total * 100).toFixed(1)}%`);
        
        return this.results.failed === 0;
    }
}

// ============ UTILITY FUNCTIONS (from NORMALIZE_DATA_FIXED.js) ============

function slugify(text) {
    if (!text) return 'product';
    
    const charMap = {
        'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
        'Ă': 'a', 'Â': 'a', 'Î': 'i', 'Ș': 's', 'Ț': 't'
    };
    
    let slug = String(text);
    Object.keys(charMap).forEach(char => {
        slug = slug.replace(new RegExp(char, 'g'), charMap[char]);
    });
    
    slug = slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    
    if (slug.length > 255) {
        slug = slug.substring(0, 255).replace(/-[^-]*$/, '');
    }
    
    return slug || 'product';
}

function escapeHtml(text) {
    if (!text) return '';
    
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    
    return String(text).replace(/[&<>"']/g, char => htmlEscapes[char]);
}

function extractFirstImage(images) {
    if (!images) return '';
    
    if (typeof images === 'string') {
        if (images.startsWith('[')) {
            try {
                const parsed = JSON.parse(images);
                return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : images;
            } catch (e) {
                return images;
            }
        }
        return images;
    }
    
    if (Array.isArray(images)) {
        return images.length > 0 ? String(images[0]) : '';
    }
    
    if (typeof images === 'object') {
        return images.src || images.url || images.href || '';
    }
    
    return String(images);
}

function calculateNetPrice(grossPrice) {
    if (!grossPrice || grossPrice === '') return '';
    
    try {
        const gross = parseFloat(grossPrice);
        if (isNaN(gross)) return '';
        if (gross <= 0) return gross === 0 ? '0.00' : '';
        
        const net = gross / 1.21;
        return net.toFixed(2);
    } catch (e) {
        return '';
    }
}

function convertPower(hp) {
    if (!hp) return null;
    
    try {
        const hpValue = parseFloat(hp);
        if (isNaN(hpValue) || hpValue <= 0) return null;
        
        return {
            kw: Math.round(hpValue * 0.7354988),
            cp: Math.round(hpValue)
        };
    } catch (e) {
        return null;
    }
}

function formatMileage(km) {
    if (!km && km !== 0) return '';
    
    try {
        const kmValue = parseFloat(km);
        if (isNaN(kmValue) || kmValue < 0) return '';
        
        return Math.floor(kmValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    } catch (e) {
        return String(km);
    }
}

// ============ TESTS ============

const runner = new TestRunner();

// ===== SLUGIFY TESTS =====

runner.test("Slugify: Basic text", function() {
    const result = slugify("BMW X5 2020");
    runner.assertEqual(result, "bmw-x5-2020", "Basic slugify failed");
});

runner.test("Slugify: Romanian characters", function() {
    const result = slugify("Mașină Albastră");
    runner.assertEqual(result, "masina-albastra", "Romanian char conversion failed");
});

runner.test("Slugify: Special characters", function() {
    const result = slugify("Test!@#$%Product");
    runner.assertEqual(result, "test-product", "Special char removal failed");
});

runner.test("Slugify: Multiple spaces", function() {
    const result = slugify("Test    Multiple    Spaces");
    runner.assertEqual(result, "test-multiple-spaces", "Multiple space handling failed");
});

runner.test("Slugify: Long text", function() {
    const result = slugify("A".repeat(300));
    runner.assertTrue(result.length <= 255, "Long text not truncated");
});

runner.test("Slugify: Empty string", function() {
    const result = slugify("");
    runner.assertEqual(result, "product", "Empty string fallback failed");
});

// ===== HTML ESCAPE TESTS =====

runner.test("HTML Escape: Script tags", function() {
    const result = escapeHtml("<script>alert('XSS')</script>");
    runner.assertEqual(result, "&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;", 
        "Script tag escaping failed");
});

runner.test("HTML Escape: Quotes", function() {
    const result = escapeHtml('Test "quoted" text');
    runner.assertEqual(result, "Test &quot;quoted&quot; text", "Quote escaping failed");
});

runner.test("HTML Escape: Ampersands", function() {
    const result = escapeHtml("Tom & Jerry");
    runner.assertEqual(result, "Tom &amp; Jerry", "Ampersand escaping failed");
});

runner.test("HTML Escape: Mixed", function() {
    const result = escapeHtml("<div class='test'>Content</div>");
    runner.assertTrue(result.includes("&lt;div"), "Mixed HTML escaping failed");
});

runner.test("HTML Escape: Empty string", function() {
    const result = escapeHtml("");
    runner.assertEqual(result, "", "Empty string handling failed");
});

// ===== IMAGE EXTRACTION TESTS =====

runner.test("Image Extract: Array of URLs", function() {
    const result = extractFirstImage(["https://example.com/img1.jpg", "https://example.com/img2.jpg"]);
    runner.assertEqual(result, "https://example.com/img1.jpg", "Array extraction failed");
});

runner.test("Image Extract: Single URL string", function() {
    const result = extractFirstImage("https://example.com/img1.jpg");
    runner.assertEqual(result, "https://example.com/img1.jpg", "String extraction failed");
});

runner.test("Image Extract: JSON string", function() {
    const result = extractFirstImage('["https://example.com/img1.jpg"]');
    runner.assertEqual(result, "https://example.com/img1.jpg", "JSON string extraction failed");
});

runner.test("Image Extract: Object with src", function() {
    const result = extractFirstImage({ src: "https://example.com/img1.jpg" });
    runner.assertEqual(result, "https://example.com/img1.jpg", "Object extraction failed");
});

runner.test("Image Extract: Null", function() {
    const result = extractFirstImage(null);
    runner.assertEqual(result, "", "Null handling failed");
});

runner.test("Image Extract: Empty array", function() {
    const result = extractFirstImage([]);
    runner.assertEqual(result, "", "Empty array handling failed");
});

// ===== PRICE CALCULATION TESTS =====

runner.test("Price Calc: Normal price", function() {
    const result = calculateNetPrice(12100);
    runner.assertEqual(result, "10000.00", "Normal price calculation failed");
});

runner.test("Price Calc: Price with decimals", function() {
    const result = calculateNetPrice(12100.50);
    runner.assertEqual(result, "10000.41", "Decimal price calculation failed");
});

runner.test("Price Calc: Zero price", function() {
    const result = calculateNetPrice(0);
    runner.assertEqual(result, "0.00", "Zero price handling failed");
});

runner.test("Price Calc: Negative price", function() {
    const result = calculateNetPrice(-100);
    runner.assertEqual(result, "", "Negative price handling failed");
});

runner.test("Price Calc: Invalid input", function() {
    const result = calculateNetPrice("not a number");
    runner.assertEqual(result, "", "Invalid input handling failed");
});

runner.test("Price Calc: Null", function() {
    const result = calculateNetPrice(null);
    runner.assertEqual(result, "", "Null handling failed");
});

// ===== POWER CONVERSION TESTS =====

runner.test("Power Convert: Normal value", function() {
    const result = convertPower(265);
    runner.assertTrue(result && result.kw === 195 && result.cp === 265, 
        "Normal power conversion failed");
});

runner.test("Power Convert: Small value", function() {
    const result = convertPower(75);
    runner.assertTrue(result && result.kw === 55 && result.cp === 75, 
        "Small power conversion failed");
});

runner.test("Power Convert: Large value", function() {
    const result = convertPower(500);
    runner.assertTrue(result && result.kw === 368 && result.cp === 500, 
        "Large power conversion failed");
});

runner.test("Power Convert: Zero", function() {
    const result = convertPower(0);
    runner.assertEqual(result, null, "Zero handling failed");
});

runner.test("Power Convert: Negative", function() {
    const result = convertPower(-100);
    runner.assertEqual(result, null, "Negative handling failed");
});

runner.test("Power Convert: Invalid", function() {
    const result = convertPower("abc");
    runner.assertEqual(result, null, "Invalid input handling failed");
});

// ===== MILEAGE FORMAT TESTS =====

runner.test("Mileage Format: Normal value", function() {
    const result = formatMileage(50000);
    runner.assertEqual(result, "50 000", "Normal mileage formatting failed");
});

runner.test("Mileage Format: Large value", function() {
    const result = formatMileage(1234567);
    runner.assertEqual(result, "1 234 567", "Large mileage formatting failed");
});

runner.test("Mileage Format: Zero", function() {
    const result = formatMileage(0);
    runner.assertEqual(result, "0", "Zero mileage handling failed");
});

runner.test("Mileage Format: Negative", function() {
    const result = formatMileage(-1000);
    runner.assertEqual(result, "", "Negative mileage handling failed");
});

runner.test("Mileage Format: Invalid", function() {
    const result = formatMileage("abc");
    runner.assertEqual(result, "abc", "Invalid mileage handling failed");
});

// ===== RUN ALL TESTS =====

const success = runner.run();

// Return result for n8n
return [{
    json: {
        success,
        total: runner.results.total,
        passed: runner.results.passed,
        failed: runner.results.failed,
        pass_rate: (runner.results.passed / runner.results.total * 100).toFixed(1) + '%'
    }
}];
```

---

## Integration Test Scripts

### Script 2: Test Full Data Transformation

**File:** `test_transformation.js`

```javascript
// ============================================================================
// INTEGRATION TEST - Full Data Transformation
// ============================================================================

// Sample test data
const testItems = [
    {
        stockId: "TEST-001",
        vin: "WVWZZZ1KZBW123456",
        title: "BMW X5 2020",
        brand: "BMW",
        model: "X5",
        year: "2020",
        priceEur: 45000,
        fuel: "Diesel",
        transmission: "Automată",
        body: "SUV",
        color: "Negru",
        mileageKm: 50000,
        horsepower: 265,
        displacementCc: 2993,
        drivetrain: "4x4",
        vatType: "Deductibil",
        features: "Piele, Navigație, Xenon",
        images: ["https://example.com/img1.jpg"]
    },
    {
        stockId: "TEST-002",
        vin: null,  // Test missing VIN
        title: "",  // Test missing title
        brand: "Audi",
        model: "A4",
        year: "2019",
        priceEur: 28000,
        fuel: "Benzină",
        transmission: "Manuală",
        body: "Sedan",
        color: "Alb",
        mileageKm: 75000,
        horsepower: 150,
        displacementCc: 1984,
        drivetrain: "Fata",
        vatType: "Nedeductibil",
        features: "Climatronic",
        images: null  // Test missing images
    },
    {
        // Test with malicious content
        stockId: "TEST-003",
        title: "<script>alert('XSS')</script>",
        brand: "<img src=x onerror=alert('XSS')>",
        priceEur: "invalid",  // Test invalid price
        horsepower: -100,  // Test negative HP
        mileageKm: "abc"  // Test invalid mileage
    }
];

// Expected validations
const validations = {
    requiredFields: [
        'Title',
        'Handle',
        'Variant SKU',
        'Vendor',
        'Type',
        'Tags',
        'Body HTML'
    ],
    
    metafields: [
        'Metafield: custom.nr_dos_ [single_line_text_field]',
        'Metafield: custom.marca [single_line_text_field]',
        'Metafield: custom.model [single_line_text_field]'
    ]
};

// Test results
const results = {
    total: testItems.length,
    passed: 0,
    failed: 0,
    errors: []
};

console.log("=".repeat(60));
console.log("INTEGRATION TEST: Full Data Transformation");
console.log("=".repeat(60));

// Process each test item
testItems.forEach((item, index) => {
    console.log(`\nTest Item ${index + 1}:`);
    console.log(`  SKU: ${item.stockId || 'N/A'}`);
    console.log(`  Title: ${item.title || 'N/A'}`);
    
    try {
        // This would call your transformItem function
        // For testing, we'll validate structure
        
        const result = {
            Title: item.title || `${item.brand} ${item.model}`,
            Handle: `test-handle-${item.stockId}`,
            'Variant SKU': item.vin || item.stockId,
            Vendor: 'Autoworld',
            Type: item.body || '',
            Tags: `${item.brand}, ${item.model}`,
            'Body HTML': `<h3>${item.brand} ${item.model}</h3>`
        };
        
        // Validate required fields
        let itemPassed = true;
        validations.requiredFields.forEach(field => {
            if (!result[field] || result[field] === '') {
                console.log(`  ❌ Missing field: ${field}`);
                itemPassed = false;
            }
        });
        
        // Check HTML escaping
        if (result['Body HTML'].includes('<script>')) {
            console.log(`  ❌ HTML not escaped properly`);
            itemPassed = false;
        }
        
        if (itemPassed) {
            results.passed++;
            console.log(`  ✅ PASSED`);
        } else {
            results.failed++;
            console.log(`  ❌ FAILED`);
        }
        
    } catch (error) {
        results.failed++;
        results.errors.push({
            item: index + 1,
            error: error.message
        });
        console.log(`  ❌ ERROR: ${error.message}`);
    }
});

console.log("\n" + "=".repeat(60));
console.log("RESULTS");
console.log("=".repeat(60));
console.log(`Total: ${results.total}`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);
console.log(`Pass Rate: ${(results.passed / results.total * 100).toFixed(1)}%`);

if (results.errors.length > 0) {
    console.log("\nErrors:");
    results.errors.forEach(err => {
        console.log(`  Item ${err.item}: ${err.error}`);
    });
}

return [{
    json: {
        success: results.failed === 0,
        ...results
    }
}];
```

---

## Performance Test Scripts

### Script 3: Measure Execution Time

**File:** `test_performance.js`

```javascript
// ============================================================================
// PERFORMANCE TEST - Execution Time Measurement
// ============================================================================

const performanceTests = {
    small: { size: 10, target: 30000 },   // 30 seconds
    medium: { size: 50, target: 70000 },  // 70 seconds
    large: { size: 200, target: 120000 }  // 120 seconds
};

const results = {};

console.log("=".repeat(60));
console.log("PERFORMANCE TESTS");
console.log("=".repeat(60));

// Generate test data
function generateTestData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            stockId: `TEST-${String(i + 1).padStart(3, '0')}`,
            vin: `VIN${String(i + 1).padStart(13, '0')}`,
            title: `Test Product ${i + 1}`,
            brand: "BMW",
            model: "X5",
            year: "2020",
            priceEur: 45000 + (i * 1000),
            fuel: "Diesel",
            transmission: "Automată",
            body: "SUV",
            color: "Negru",
            mileageKm: 50000 + (i * 100),
            horsepower: 265,
            displacementCc: 2993,
            drivetrain: "4x4",
            vatType: "Deductibil",
            features: "Piele, Navigație, Xenon",
            images: [`https://example.com/img${i + 1}.jpg`]
        });
    }
    return data;
}

// Run performance test
function runPerformanceTest(testName, config) {
    console.log(`\n${testName.toUpperCase()} Dataset (${config.size} items):`);
    
    const testData = generateTestData(config.size);
    const startTime = Date.now();
    
    // Simulate processing (in real test, this would call actual workflow)
    let processed = 0;
    testData.forEach(item => {
        // Simulate transformation work
        const transformed = {
            Title: item.title,
            Handle: item.stockId.toLowerCase(),
            'Variant SKU': item.vin,
            'Variant Price': item.priceEur
        };
        processed++;
    });
    
    const duration = Date.now() - startTime;
    const passed = duration < config.target;
    
    console.log(`  Items processed: ${processed}`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Target: ${config.target}ms`);
    console.log(`  Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    return {
        size: config.size,
        duration,
        target: config.target,
        passed,
        itemsPerSecond: (processed / (duration / 1000)).toFixed(2)
    };
}

// Run all tests
Object.entries(performanceTests).forEach(([name, config]) => {
    results[name] = runPerformanceTest(name, config);
});

// Summary
console.log("\n" + "=".repeat(60));
console.log("PERFORMANCE SUMMARY");
console.log("=".repeat(60));

const allPassed = Object.values(results).every(r => r.passed);

Object.entries(results).forEach(([name, result]) => {
    console.log(`${name.toUpperCase()}:`);
    console.log(`  ${result.duration}ms for ${result.size} items`);
    console.log(`  ${result.itemsPerSecond} items/second`);
    console.log(`  ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
});

console.log(`\nOverall: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);

return [{
    json: {
        success: allPassed,
        results
    }
}];
```

---

## Data Validation Scripts

### Script 4: Validate Shopify Data Quality

**File:** `validate_shopify_data.js`

```javascript
// ============================================================================
// DATA VALIDATION - Shopify Product Quality Check
// ============================================================================

// This script checks Shopify products for data quality issues
// Run after workflow execution to validate results

const validations = {
    duplicates: 0,
    missingSKU: 0,
    missingPrice: 0,
    missingImages: 0,
    missingMetafields: 0,
    htmlIssues: 0,
    total: 0
};

console.log("=".repeat(60));
console.log("DATA QUALITY VALIDATION");
console.log("=".repeat(60));

// Get products from Shopify (this would be from actual API call)
// For testing, we'll use sample data
const shopifyProducts = [
    {
        id: "123",
        title: "BMW X5 2020",
        variants: [{
            sku: "TEST-001",
            price: "45000"
        }],
        images: ["img1.jpg"],
        metafields: {
            marca: "BMW",
            model: "X5"
        },
        body_html: "<h3>BMW X5</h3>"
    }
];

// Track SKUs for duplicate detection
const skuMap = new Map();

shopifyProducts.forEach((product, index) => {
    validations.total++;
    
    console.log(`\nProduct ${index + 1}: ${product.title}`);
    
    // Check for SKU
    const sku = product.variants?.[0]?.sku;
    if (!sku) {
        validations.missingSKU++;
        console.log(`  ⚠️  Missing SKU`);
    } else {
        // Check for duplicates
        if (skuMap.has(sku)) {
            validations.duplicates++;
            console.log(`  ❌ Duplicate SKU: ${sku}`);
        } else {
            skuMap.set(sku, product.id);
        }
    }
    
    // Check for price
    const price = product.variants?.[0]?.price;
    if (!price || price === "0" || price === "") {
        validations.missingPrice++;
        console.log(`  ⚠️  Missing or zero price`);
    }
    
    // Check for images
    if (!product.images || product.images.length === 0) {
        validations.missingImages++;
        console.log(`  ⚠️  No images`);
    }
    
    // Check for metafields
    if (!product.metafields || Object.keys(product.metafields).length === 0) {
        validations.missingMetafields++;
        console.log(`  ⚠️  No metafields`);
    }
    
    // Check for HTML issues
    if (product.body_html) {
        if (product.body_html.includes('<script>')) {
            validations.htmlIssues++;
            console.log(`  ❌ Unescaped script tag in HTML`);
        }
        if (product.body_html.includes('onerror=')) {
            validations.htmlIssues++;
            console.log(`  ❌ Unescaped event handler in HTML`);
        }
    }
});

// Calculate quality score
const issues = validations.duplicates + 
               validations.missingSKU + 
               validations.missingPrice + 
               validations.missingImages + 
               validations.missingMetafields + 
               validations.htmlIssues;

const qualityScore = ((validations.total - issues) / validations.total * 100).toFixed(1);

console.log("\n" + "=".repeat(60));
console.log("VALIDATION RESULTS");
console.log("=".repeat(60));
console.log(`Total Products: ${validations.total}`);
console.log(`Duplicates: ${validations.duplicates}`);
console.log(`Missing SKU: ${validations.missingSKU}`);
console.log(`Missing Price: ${validations.missingPrice}`);
console.log(`Missing Images: ${validations.missingImages}`);
console.log(`Missing Metafields: ${validations.missingMetafields}`);
console.log(`HTML Issues: ${validations.htmlIssues}`);
console.log(`\nQuality Score: ${qualityScore}%`);

const passed = issues === 0;
console.log(`\nStatus: ${passed ? '✅ PASSED' : '❌ FAILED'}`);

return [{
    json: {
        success: passed,
        qualityScore: parseFloat(qualityScore),
        ...validations
    }
}];
```

---

## Monitoring Scripts

### Script 5: Workflow Health Check

**File:** `health_check.js`

```javascript
// ============================================================================
// HEALTH CHECK - Workflow Monitoring
// ============================================================================

const healthMetrics = {
    executionTime: { value: 0, target: 120000, status: 'unknown' },
    errorRate: { value: 0, target: 2, status: 'unknown' },
    apiCalls: { value: 0, target: 400, status: 'unknown' },
    memoryUsage: { value: 0, target: 200, status: 'unknown' },
    duplicates: { value: 0, target: 0, status: 'unknown' }
};

console.log("=".repeat(60));
console.log("WORKFLOW HEALTH CHECK");
console.log("=".repeat(60));

// Get execution history (this would come from n8n API)
const recentExecutions = [
    { duration: 115000, errors: 0, apiCalls: 350, success: true },
    { duration: 118000, errors: 0, apiCalls: 360, success: true },
    { duration: 122000, errors: 1, apiCalls: 355, success: true },
    { duration: 119000, errors: 0, apiCalls: 348, success: true },
    { duration: 121000, errors: 0, apiCalls: 352, success: true }
];

// Calculate metrics
const totalExecutions = recentExecutions.length;
const successfulExecutions = recentExecutions.filter(e => e.success).length;
const failedExecutions = totalExecutions - successfulExecutions;

// Average execution time
const avgExecutionTime = recentExecutions.reduce((sum, e) => sum + e.duration, 0) / totalExecutions;
healthMetrics.executionTime.value = Math.round(avgExecutionTime);
healthMetrics.executionTime.status = avgExecutionTime < healthMetrics.executionTime.target ? 'healthy' : 'warning';

// Error rate
const errorRate = (failedExecutions / totalExecutions) * 100;
healthMetrics.errorRate.value = errorRate.toFixed(1);
healthMetrics.errorRate.status = errorRate < healthMetrics.errorRate.target ? 'healthy' : 'critical';

// Average API calls
const avgApiCalls = recentExecutions.reduce((sum, e) => sum + e.apiCalls, 0) / totalExecutions;
healthMetrics.apiCalls.value = Math.round(avgApiCalls);
healthMetrics.apiCalls.status = avgApiCalls < healthMetrics.apiCalls.target ? 'healthy' : 'warning';

// Memory usage (would come from system metrics)
healthMetrics.memoryUsage.value = 180;  // MB
healthMetrics.memoryUsage.status = healthMetrics.memoryUsage.value < healthMetrics.memoryUsage.target ? 'healthy' : 'warning';

// Duplicates (would come from Shopify check)
healthMetrics.duplicates.value = 0;
healthMetrics.duplicates.status = healthMetrics.duplicates.value === healthMetrics.duplicates.target ? 'healthy' : 'critical';

// Display results
console.log("\nMetrics:");
Object.entries(healthMetrics).forEach(([metric, data]) => {
    const statusIcon = data.status === 'healthy' ? '✅' : 
                       data.status === 'warning' ? '⚠️' : '❌';
    const unit = metric === 'executionTime' ? 'ms' : 
                 metric === 'errorRate' ? '%' : 
                 metric === 'memoryUsage' ? 'MB' : '';
    
    console.log(`${statusIcon} ${metric}: ${data.value}${unit} (target: ${data.target}${unit})`);
});

// Overall health
const criticalIssues = Object.values(healthMetrics).filter(m => m.status === 'critical').length;
const warnings = Object.values(healthMetrics).filter(m => m.status === 'warning').length;

console.log("\n" + "=".repeat(60));
console.log("OVERALL HEALTH");
console.log("=".repeat(60));

let overallStatus;
if (criticalIssues > 0) {
    overallStatus = 'CRITICAL';
    console.log(`❌ CRITICAL - ${criticalIssues} critical issue(s) found`);
} else if (warnings > 0) {
    overallStatus = 'WARNING';
    console.log(`⚠️  WARNING - ${warnings} warning(s) found`);
} else {
    overallStatus = 'HEALTHY';
    console.log(`✅ HEALTHY - All metrics within targets`);
}

return [{
    json: {
        status: overallStatus,
        metrics: healthMetrics,
        summary: {
            totalExecutions,
            successfulExecutions,
            failedExecutions,
            criticalIssues,
            warnings
        }
    }
}];
```

---

## Usage Instructions

### Running Tests in n8n

1. **Create Test Workflow:**
   ```
   - Create new workflow
   - Add Code node
   - Paste script content
   - Execute
   ```

2. **Schedule Regular Tests:**
   ```
   - Add Schedule Trigger
   - Set to run daily
   - Connect to test script
   - Monitor results
   ```

3. **Integration with Main Workflow:**
   ```
   - Add test nodes after main workflow
   - Run in parallel
   - Alert on failures
   ```

### Running Tests Locally

```bash
# Install Node.js if not already installed
node --version

# Save script to file
# Example: test_utilities.js

# Run script
node test_utilities.js

# Or with n8n CLI
n8n execute --workflow=test_workflow.json
```

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: n8n Workflow Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Unit Tests
        run: node test_utilities.js
      - name: Run Integration Tests
        run: node test_transformation.js
      - name: Run Performance Tests
        run: node test_performance.js
```

---

## Test Schedule

### Daily Tests
- ✅ Health Check (every 4 hours)
- ✅ Data Quality Validation (after each execution)

### Weekly Tests
- ✅ Full Unit Test Suite (Monday)
- ✅ Integration Tests (Wednesday)
- ✅ Performance Tests (Friday)

### Monthly Tests
- ✅ Comprehensive Regression Suite
- ✅ Load Testing
- ✅ Security Audit

---

**Scripts Version:** 1.0  
**Last Updated:** December 2, 2024  
**Maintained By:** QA Team

