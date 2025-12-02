# 🔴 DEBUG: SKU Matching Failure

## ❌ **Problem**

**Expected Behavior:**
- Apify has 143 products
- Shopify has 143 products (same products)
- Unified Filter should output: **UPDATE: 143, CREATE: 0**

**Actual Behavior:**
- Unified Filter is outputting: **CREATE: 246**
- This means SKU matching is **failing**

---

## 🔍 **Possible Causes**

### **Cause 1: SKU Field Name Mismatch**

The Unified Filter looks for SKU in these fields:
```javascript
const skuRaw = String(
  product['Variant SKU'] ||
  product.variant_sku ||
  product.sku ||
  product.SKU ||
  ''
).trim();
```

**Check:** Does the Normalize Data node output `Variant SKU` field?

---

### **Cause 2: SKU Normalization Mismatch**

The filter normalizes SKUs like this:
```javascript
const normalizeSKU = (raw) => {
  if (raw == null) return '';
  return String(raw)
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')  // Remove zero-width spaces
    .replace(/\s+/g, '')                     // Remove all whitespace
    .trim()
    .toUpperCase();                          // Convert to uppercase
};
```

**Examples:**
- `"LSJW74090RZ131352"` → `"LSJW74090RZ131352"` ✅
- `"lsjw74090rz131352"` → `"LSJW74090RZ131352"` ✅
- `"LSJW 74090 RZ131352"` → `"LSJW74090RZ131352"` ✅
- `"LSJW-74090-RZ131352"` → `"LSJW-74090-RZ131352"` ❌ (dash preserved)

**Check:** Are there dashes, special characters, or formatting differences between Apify and Shopify SKUs?

---

### **Cause 3: Shopify Data Not Parsed Correctly**

The Unified Filter expects Shopify data in this structure:
```javascript
const shopifyResults = $input.all().map(i => i.json);

for (const result of shopifyResults) {
  const productsData = result?.data?.products;  // ← Looking for .data.products
  // ...
}
```

**Check:** Does "Get Shopify Products" output have `data.products.edges` structure?

---

### **Cause 4: Empty SKUs**

If either Apify or Shopify SKUs are empty, they won't match:
```javascript
if (!skuKey || !variantId) continue;  // Skip if SKU is empty
```

**Check:** Are all products in both systems actually using SKUs (not empty)?

---

## 🔧 **Debugging Steps**

### **Step 1: Check Normalize Data Output**

1. Click on **"Normalize Data"** node
2. Check the output
3. Look for a product and verify:
   - ✅ Does it have `Variant SKU` field?
   - ✅ What is the value? (e.g., `"LSJW74090RZ131352"`)

### **Step 2: Check Get Shopify Products Output**

1. Click on **"Get Shopify Products"** node
2. Check the output structure
3. Verify:
   - ✅ Is it `{ data: { products: { edges: [...] } } }`?
   - ✅ Do variants have `sku` field?
   - ✅ What is the SKU value for the same product?

### **Step 3: Add Debug Logging to Unified Filter**

Add this code at the beginning of the Unified Filter (after line 20):

```javascript
console.log("=== DEBUG: SHOPIFY DATA STRUCTURE ===");
console.log("shopifyResults length:", shopifyResults.length);
console.log("First result structure:", JSON.stringify(shopifyResults[0], null, 2).substring(0, 500));

// After building shopifySkuMap (around line 60):
console.log("=== DEBUG: SHOPIFY SKU MAP ===");
console.log("Total SKUs in Shopify:", shopifySkuMap.size);
console.log("First 5 SKUs:", Array.from(shopifySkuMap.keys()).slice(0, 5));

// After building incomingSkuMap (around line 100):
console.log("=== DEBUG: INCOMING SKU MAP ===");
console.log("Total incoming SKUs:", incomingSkuMap.size);
console.log("First 5 incoming SKUs:", Array.from(incomingSkuMap.keys()).slice(0, 5));

// After matching (around line 130):
console.log("=== DEBUG: MATCHING ===");
const firstIncomingSku = Array.from(incomingSkuMap.keys())[0];
const firstIncomingProduct = incomingSkuMap.get(firstIncomingSku);
const match = shopifySkuMap.get(firstIncomingProduct.sku_key);
console.log("First incoming SKU:", firstIncomingSku);
console.log("Normalized:", firstIncomingProduct.sku_key);
console.log("Match found?", match ? "YES" : "NO");
if (match) {
  console.log("Matched to:", match.sku_raw);
}
```

### **Step 4: Compare SKU Values**

Create a simple test:

1. Pick one product you know exists in both systems
2. Note the SKU from Shopify: `_________________`
3. Note the SKU from Apify: `_________________`
4. Are they **exactly the same**? (case, spacing, special chars)

---

## 🎯 **Most Likely Cause**

Based on the symptoms, I suspect **one of these**:

### **Hypothesis 1: Shopify Data Structure Issue**
The "Get Shopify Products" output might not be in the expected format, so the Unified Filter can't find the products.

**Test:** Check if `shopifyResults[0]?.data?.products?.edges` exists

### **Hypothesis 2: SKU Field Name Mismatch**
The Normalize Data node might be outputting SKUs with a different field name than `Variant SKU`.

**Test:** Check the exact field name in Normalize Data output

### **Hypothesis 3: SKU Format Mismatch**
Apify and Shopify might have SKUs in different formats (e.g., with/without dashes).

**Test:** Compare actual SKU values from both sources

---

## 📋 **Quick Diagnostic Checklist**

Please check and report:

- [ ] What is the **exact field name** for SKU in Normalize Data output?
- [ ] What is a **sample SKU value** from Normalize Data? (e.g., `"ABC-123"`)
- [ ] What is the **same product's SKU** in Shopify? (e.g., `"ABC123"`)
- [ ] Does "Get Shopify Products" output have `data.products.edges` structure?
- [ ] How many items does "Normalize Data" output? (should be ~143)
- [ ] How many items does "Split Images" output? (should be ~143)

---

## 🔧 **Temporary Fix: Force Debug Mode**

Add this to the **very beginning** of Unified Filter (line 1):

```javascript
// === EMERGENCY DEBUG MODE ===
const DEBUG = true;

if (DEBUG) {
  console.log("=== FULL INPUT DUMP ===");
  const allInputs = $input.all();
  console.log("Total inputs:", allInputs.length);
  
  if (allInputs.length > 0) {
    console.log("First input keys:", Object.keys(allInputs[0].json));
    console.log("First input sample:", JSON.stringify(allInputs[0].json, null, 2).substring(0, 1000));
  }
  
  // Check Split Images data
  try {
    const splitImagesData = $('Split Images').all();
    console.log("Split Images count:", splitImagesData.length);
    if (splitImagesData.length > 0) {
      console.log("Split Images first item keys:", Object.keys(splitImagesData[0].json));
      console.log("Split Images SKU field:", splitImagesData[0].json['Variant SKU']);
    }
  } catch (e) {
    console.log("Error accessing Split Images:", e.message);
  }
}
// === END DEBUG ===
```

Then run the workflow and send me the console output.

---

**Status:** 🔴 **INVESTIGATION REQUIRED**  
**Next Step:** Check the diagnostic items above and report findings

