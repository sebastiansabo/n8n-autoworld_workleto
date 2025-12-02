# 🚨 CRITICAL FIX REQUIRED - Workflow Currently Broken

## ❌ **Current Status: WORKFLOW NOT WORKING**

The `ATW_WKT_Live_OPTIMIZED` workflow is **currently failing** due to a Shopify GraphQL API incompatibility.

---

## 🔴 **The Problem**

**Node:** `Get Shopify Products` (ID: `3c7338c0-7750-4f43-a3bc-6b999f2e41e7`)

**Error:**
```
Selections can't be made on scalars (field 'price' returns Money but has selections ["amount", "currencyCode"])
```

**Root Cause:**  
The GraphQL query uses **Shopify API 2023 format** where `price` was a `Money` object:
```graphql
price { amount currencyCode }
```

But in **Shopify API 2024-07**, `price` is now a **String**:
```graphql
price  # Returns "25000.00" directly
```

---

## ✅ **The Solution**

### **Quick Fix (2 minutes via n8n UI)**

1. **Open n8n Cloud:** https://autoworld.app.n8n.cloud
2. **Open Workflow:** `ATW_WKT_Live_OPTIMIZED`
3. **Find Node:** "Get Shopify Products"
4. **Replace the `jsonBody` field** with this:

```json
{
  "query": "{ products(first: 250, query: \"vendor:Autoworld status:active\", sortKey: UPDATED_AT, reverse: true) { pageInfo { hasNextPage endCursor } edges { node { id title handle publishedAt updatedAt variants(first: 250) { edges { node { id sku title price compareAtPrice inventoryQuantity } } } } } } }"
}
```

5. **Save** the node
6. **Save** the workflow
7. **Test** by clicking "Execute Workflow"

---

## 📋 **What Changed**

| Field | Old (Broken) | New (Fixed) |
|-------|-------------|-------------|
| `price` | `price { amount currencyCode }` | `price` |
| `compareAtPrice` | `compareAtPrice { amount currencyCode }` | `compareAtPrice` |

---

## ✅ **Unified Filter Already Compatible**

The **Unified Filter** node already handles both formats correctly:

```javascript
price: variant.price?.amount || variant.price || ''
```

This code works with:
- ✅ Old format: `variant.price.amount` (Money object)
- ✅ New format: `variant.price` (String)

**So the Unified Filter doesn't need any changes!** 🎉

---

## 🧪 **Testing After Fix**

After applying the fix, you should see:

### **Before (Error):**
```json
{
  "errors": [
    {
      "message": "Selections can't be made on scalars...",
      "code": "selectionMismatch"
    }
  ]
}
```

### **After (Success):**
```json
{
  "data": {
    "products": {
      "edges": [
        {
          "node": {
            "id": "gid://shopify/Product/8234567890",
            "title": "BMW X5 2020",
            "variants": {
              "edges": [
                {
                  "node": {
                    "id": "gid://shopify/ProductVariant/45678901234",
                    "sku": "VIN123456",
                    "price": "25000.00",           ✅ String
                    "compareAtPrice": "28000.00",  ✅ String
                    "inventoryQuantity": 1
                  }
                }
              ]
            }
          }
        }
      ]
    }
  }
}
```

---

## 📊 **Expected Console Output After Fix**

```
=== OPTIMIZED UNIFIED FILTER ===
Shopify: 150 variants → 150 unique SKUs
Incoming: 200 raw → 195 unique (5 duplicates removed)

=== RESULTS ===
CREATE: 50
UPDATE: 145
DEACTIVATE: 5
TOTAL: 200
```

---

## 📁 **Documentation**

For detailed explanation and troubleshooting, see:
- **`SHOPIFY_GRAPHQL_FIX.md`** - Complete fix guide with examples

---

## 🎯 **Priority: CRITICAL**

- **Severity:** 🔴 **CRITICAL** (workflow cannot run)
- **Fix Time:** ~2 minutes
- **Complexity:** Simple (just update query string)
- **Risk:** Low (only affects data fetching, not logic)
- **Impact:** Blocks entire workflow execution

---

## ✅ **Checklist**

- [ ] Open n8n Cloud workflow
- [ ] Locate "Get Shopify Products" node
- [ ] Replace `jsonBody` with fixed query
- [ ] Save node
- [ ] Save workflow
- [ ] Test execution
- [ ] Verify no GraphQL errors
- [ ] Confirm Unified Filter processes data correctly

---

**Last Updated:** 2025-12-02  
**Workflow:** `ATW_WKT_Live_OPTIMIZED` (ID: `IzUV02FRu4NJvDuv`)  
**Node:** "Get Shopify Products" (ID: `3c7338c0-7750-4f43-a3bc-6b999f2e41e7`)  
**API Version:** Shopify 2024-07  
**Status:** ⚠️ **FIX REQUIRED IMMEDIATELY**

