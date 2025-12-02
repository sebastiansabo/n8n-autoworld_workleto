# 🔧 FIX: Unified Filter Data Structure Issue

## 🔴 **ROOT CAUSE FOUND!**

The **Unified Filter** is looking for Shopify data in the wrong structure!

### **What the Unified Filter Expects:**
```javascript
const shopifyResults = $input.all().map(i => i.json);

for (const result of shopifyResults) {
  const productsData = result?.data?.products;  // ← Looking for .data.products
  const productEdges = productsData.edges ?? [];
  // ...
}
```

### **What "Get Shopify Products" Actually Returns:**

The HTTP Request node returns the GraphQL response directly:

```javascript
{
  "data": {
    "products": {
      "edges": [
        {
          "node": {
            "id": "gid://shopify/Product/...",
            "variants": { ... }
          }
        }
      ]
    }
  }
}
```

So the structure **IS** correct (`result.data.products.edges`), but there might be an issue with how the data flows from "Get Shopify Products" to "Unified Filter".

---

## 🔍 **Diagnostic Check**

The issue is likely one of these:

### **Issue 1: Unified Filter is Connected to Wrong Node**

**Check:** Is the Unified Filter connected to "Get Shopify Products" node?

Looking at your workflow screenshot:
- **Split Images** (143 items) → **Get Shopify Products** (143 items) → **Unified Filter** (246 items)

**Problem:** The Unified Filter should receive data from **Get Shopify Products**, but it's receiving data from the **previous node** (Split Images)!

### **Issue 2: Unified Filter is Reading from Wrong Source**

The Unified Filter code has this line:
```javascript
const shopifyResults = $input.all().map(i => i.json);
```

This reads from the **direct input** (the node connected to it).

But then later it tries to access Split Images data:
```javascript
try {
  const splitImagesItems = $('Split Images').all();
  incomingProductsRaw = splitImagesItems.map(item => item.json);
} catch (error) {
  // ...
}
```

**This is backwards!** The Unified Filter should:
1. Receive **Shopify data** from its input (`$input.all()`)
2. Access **Apify data** from Split Images node (`$('Split Images').all()`)

---

## ✅ **THE FIX**

### **Option 1: Fix the Workflow Connections** (Recommended)

The Unified Filter needs to receive data from **BOTH** sources:
1. **Shopify data** from "Get Shopify Products" (via direct connection)
2. **Apify data** from "Split Images" (via node reference)

**Current (Wrong):**
```
Split Images (143) → Get Shopify Products (143) → Unified Filter (246)
```

**Should Be:**
```
Split Images (143) ──┐
                      ├─→ Unified Filter (246)
Get Shopify Products (143) ──┘
```

**How to Fix:**
1. In n8n, disconnect the wire from "Split Images" to "Get Shopify Products"
2. Connect "Split Images" directly to "Unified Filter" (input 1)
3. Connect "Get Shopify Products" to "Unified Filter" (input 2)

OR

**Keep current connection and swap the logic:**

### **Option 2: Fix the Unified Filter Code** (Quick Fix)

Change the Unified Filter code to swap the data sources:

**Find this code (around line 18):**
```javascript
// 1) Build Shopify SKU index
const shopifyResults = $input.all().map(i => i.json);
```

**Replace with:**
```javascript
// 1) Build Shopify SKU index
const shopifyResults = $('Get Shopify Products').all().map(i => i.json);
```

**And find this code (around line 70):**
```javascript
// 2) Get and deduplicate incoming products
let incomingProductsRaw = [];
try {
  const splitImagesItems = $('Split Images').all();
  incomingProductsRaw = splitImagesItems.map(item => item.json);
} catch (error) {
  console.log(`Error accessing Split Images: ${error.message}`);
  return [{ json: { error: "Cannot access Split Images data" } }];
}
```

**Replace with:**
```javascript
// 2) Get and deduplicate incoming products
let incomingProductsRaw = [];
try {
  incomingProductsRaw = $input.all().map(item => item.json);
} catch (error) {
  console.log(`Error accessing input data: ${error.message}`);
  return [{ json: { error: "Cannot access input data" } }];
}
```

---

## 🎯 **Complete Fixed Unified Filter Code**

Here's the corrected version:

```javascript
// OPTIMIZED UNIFIED FILTER
// Handles CREATE, UPDATE, and DEACTIVATE with improved SKU matching

const normalizeSKU = (raw) => {
  if (raw == null) return '';
  return String(raw)
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, '')
    .trim()
    .toUpperCase();
};

const gidNum = (gid) => String(gid || '').split('/').pop();

console.log("=== OPTIMIZED UNIFIED FILTER ===");

// 1) Build Shopify SKU index from "Get Shopify Products" node
const shopifyResults = $('Get Shopify Products').all().map(i => i.json);  // ← FIXED
const shopifySkuMap = new Map();
let totalShopifyVariants = 0;

for (const result of shopifyResults) {
  const productsData = result?.data?.products;
  if (!productsData) {
    console.log("Warning: No products data found in Shopify response");
    console.log("Result structure:", JSON.stringify(result).substring(0, 200));
    continue;
  }

  const productEdges = productsData.edges ?? [];

  for (const productEdge of productEdges) {
    const product = productEdge.node;
    if (!product) continue;

    const productId = gidNum(product.id);
    const productTitle = product.title || '';
    const handle = product.handle || '';

    const variantEdges = product.variants?.edges ?? [];
    totalShopifyVariants += variantEdges.length;

    for (const variantEdge of variantEdges) {
      const variant = variantEdge.node;
      if (!variant) continue;

      const variantId = gidNum(variant.id);
      const skuRaw = variant.sku ? String(variant.sku).trim() : '';
      const skuKey = normalizeSKU(skuRaw);
      
      if (!skuKey || !variantId) continue;

      // Store only first occurrence
      if (!shopifySkuMap.has(skuKey)) {
        shopifySkuMap.set(skuKey, {
          product_id: productId,
          variant_id: variantId,
          handle,
          product_title: productTitle,
          variant_title: variant.title || 'Default Title',
          sku_raw: skuRaw,
          sku_key: skuKey,
          price: variant.price?.amount || variant.price || '',
          compare_at_price: variant.compareAtPrice?.amount || variant.compareAtPrice || '',
          inventory: variant.inventoryQuantity || 0
        });
      }
    }
  }
}

console.log(`Shopify: ${totalShopifyVariants} variants → ${shopifySkuMap.size} unique SKUs`);

// 2) Get and deduplicate incoming products from direct input (Split Images)
let incomingProductsRaw = [];
try {
  incomingProductsRaw = $input.all().map(item => item.json);  // ← FIXED
} catch (error) {
  console.log(`Error accessing input data: ${error.message}`);
  return [{ json: { error: "Cannot access input data" } }];
}

const incomingSkuMap = new Map();
const incomingSKUSet = new Set();
let duplicatesRemoved = 0;

for (const product of incomingProductsRaw) {
  const skuRaw = String(
    product['Variant SKU'] ||
    product.variant_sku ||
    product.sku ||
    product.SKU ||
    ''
  ).trim();
  
  const skuKey = normalizeSKU(skuRaw);
  
  if (!skuKey) {
    // Handle products without SKU separately
    const uniqueKey = `no_sku_${Math.random().toString(36).substr(2, 9)}`;
    incomingSkuMap.set(uniqueKey, {
      ...product,
      sku_raw: skuRaw,
      sku_key: '',
      no_sku: true
    });
    continue;
  }
  
  if (incomingSkuMap.has(skuKey)) {
    duplicatesRemoved++;
  } else {
    incomingSkuMap.set(skuKey, {
      ...product,
      sku_raw: skuRaw,
      sku_key: skuKey
    });
    incomingSKUSet.add(skuKey);
  }
}

console.log(`Incoming: ${incomingProductsRaw.length} raw → ${incomingSkuMap.size} unique (${duplicatesRemoved} duplicates removed)`);

// 3) Process CREATE and UPDATE actions
const results = [];
let createCount = 0;
let updateCount = 0;
let noSkuCount = 0;

for (const [key, product] of incomingSkuMap.entries()) {
  if (product.no_sku) {
    results.push({
      json: {
        ...product,
        action: 'create',
        no_sku_warning: true
      }
    });
    createCount++;
    noSkuCount++;
    continue;
  }
  
  const skuKey = product.sku_key;
  const match = shopifySkuMap.get(skuKey);
  
  if (match) {
    // UPDATE
    results.push({
      json: {
        ...product,
        action: 'update',
        shopify_product_id: match.product_id,
        shopify_variant_id: match.variant_id,
        shopify_handle: match.handle,
        existing_product_title: match.product_title,
        existing_variant_title: match.variant_title,
        existing_price: match.price,
        existing_compare_at_price: match.compare_at_price
      }
    });
    updateCount++;
  } else {
    // CREATE
    results.push({
      json: {
        ...product,
        action: 'create'
      }
    });
    createCount++;
  }
}

// 4) Process DEACTIVATE actions
let deactivateCount = 0;

for (const [skuKey, shopifyData] of shopifySkuMap.entries()) {
  if (!incomingSKUSet.has(skuKey)) {
    results.push({
      json: {
        action: 'deactivate',
        shopify_product_id: shopifyData.product_id,
        shopify_variant_id: shopifyData.variant_id,
        shopify_handle: shopifyData.handle,
        product_title: shopifyData.product_title,
        variant_title: shopifyData.variant_title,
        sku_raw: shopifyData.sku_raw,
        sku_key: shopifyData.sku_key,
        existing_price: shopifyData.price,
        existing_inventory: shopifyData.inventory,
        reason: 'SKU not found in source data'
      }
    });
    deactivateCount++;
  }
}

console.log(`\n=== RESULTS ===`);
console.log(`CREATE: ${createCount} (${noSkuCount} without SKU)`);
console.log(`UPDATE: ${updateCount}`);
console.log(`DEACTIVATE: ${deactivateCount}`);
console.log(`TOTAL: ${results.length}`);

return results;
```

---

## 📋 **How to Apply the Fix**

1. Open n8n Cloud: https://autoworld.app.n8n.cloud
2. Open workflow: `ATW_WKT_Live_OPTIMIZED`
3. Click on **"Unified Filter"** node
4. Replace the entire code with the fixed version above
5. Save the node
6. Save the workflow
7. Test execution

---

## ✅ **Expected Result After Fix**

```
=== OPTIMIZED UNIFIED FILTER ===
Shopify: 143 variants → 143 unique SKUs
Incoming: 143 raw → 143 unique (0 duplicates removed)

=== RESULTS ===
CREATE: 0
UPDATE: 143
DEACTIVATE: 0
TOTAL: 143
```

---

**Status:** 🔧 **FIX READY**  
**Issue:** Data source confusion in Unified Filter  
**Solution:** Swap `$input.all()` and `$('Get Shopify Products').all()`

