# 🔧 Shopify GraphQL Query Fix

## ❌ **Problem Identified**

The **"Get Shopify Products"** node is using an **outdated GraphQL query** that's incompatible with Shopify API 2024-07.

### **Error Message:**
```
Selections can't be made on scalars (field 'price' returns Money but has selections ["amount", "currencyCode"])
```

### **Root Cause:**
In Shopify API 2024-07+, the variant `price` field is now a **String** (not a Money object), so you cannot query `price { amount currencyCode }`.

---

## ✅ **Solution**

### **Current (BROKEN) Query:**
```graphql
{
  products(first: 250, query: "vendor:Autoworld status:active", sortKey: UPDATED_AT, reverse: true) {
    pageInfo { hasNextPage endCursor }
    edges {
      node {
        id
        title
        handle
        publishedAt
        updatedAt
        variants(first: 250) {
          edges {
            node {
              id
              sku
              title
              price { amount currencyCode }           ❌ BROKEN
              compareAtPrice { amount currencyCode }  ❌ BROKEN
              inventoryQuantity
            }
          }
        }
      }
    }
  }
}
```

### **Fixed Query:**
```graphql
{
  products(first: 250, query: "vendor:Autoworld status:active", sortKey: UPDATED_AT, reverse: true) {
    pageInfo { 
      hasNextPage 
      endCursor 
    }
    edges {
      node {
        id
        title
        handle
        publishedAt
        updatedAt
        variants(first: 250) {
          edges {
            node {
              id
              sku
              title
              price                    ✅ FIXED (String)
              compareAtPrice           ✅ FIXED (String)
              inventoryQuantity
            }
          }
        }
      }
    }
  }
}
```

---

## 🔧 **How to Fix in n8n**

### **Option 1: Manual Fix via n8n UI** (Recommended - 2 minutes)

1. **Open n8n Cloud**: https://autoworld.app.n8n.cloud
2. **Open Workflow**: `ATW_WKT_Live_OPTIMIZED`
3. **Click on**: "Get Shopify Products" node
4. **Find**: `JSON Body` field
5. **Replace** the entire query with:

```json
{
  "query": "{ products(first: 250, query: \"vendor:Autoworld status:active\", sortKey: UPDATED_AT, reverse: true) { pageInfo { hasNextPage endCursor } edges { node { id title handle publishedAt updatedAt variants(first: 250) { edges { node { id sku title price compareAtPrice inventoryQuantity } } } } } } }"
}
```

6. **Save** the node
7. **Save** the workflow
8. **Test** execution

---

### **Option 2: Via MCP API** (Automated)

Use the n8n MCP tool to update the node programmatically (if MCP API is working).

---

## 📊 **What Changed**

| Field | Old API (2023) | New API (2024-07) |
|-------|---------------|-------------------|
| `price` | `Money { amount, currencyCode }` | `String` (e.g., "25000.00") |
| `compareAtPrice` | `Money { amount, currencyCode }` | `String` (e.g., "28000.00") |

### **Why This Happened:**
Shopify simplified the API in 2024-07 to return prices as strings instead of Money objects for better performance.

---

## 🧪 **Testing the Fix**

After applying the fix, you should see:

### **Before (Error):**
```json
{
  "errors": [
    {
      "message": "Selections can't be made on scalars (field 'price' returns Money...)",
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

## ✅ **Impact on Unified Filter**

The **Unified Filter** node already handles both formats correctly:

```javascript
price: variant.price?.amount || variant.price || ''
```

This code:
- ✅ Works with old format: `variant.price.amount`
- ✅ Works with new format: `variant.price` (string)

**So the Unified Filter doesn't need any changes!** 🎉

---

## 🚀 **Quick Fix Summary**

**Change this:**
```graphql
price { amount currencyCode }
compareAtPrice { amount currencyCode }
```

**To this:**
```graphql
price
compareAtPrice
```

**That's it!** ✅

---

## 📝 **Complete Fixed JSON Body**

Copy-paste this entire JSON into the "Get Shopify Products" node:

```json
{
  "query": "{ products(first: 250, query: \"vendor:Autoworld status:active\", sortKey: UPDATED_AT, reverse: true) { pageInfo { hasNextPage endCursor } edges { node { id title handle publishedAt updatedAt variants(first: 250) { edges { node { id sku title price compareAtPrice inventoryQuantity } } } } } } }"
}
```

---

## 🔍 **Verification Steps**

After fixing:

1. ✅ Click "Execute Node" on "Get Shopify Products"
2. ✅ Check output - should see products data (no errors)
3. ✅ Verify `price` is a string (e.g., "25000.00")
4. ✅ Run full workflow - should complete successfully

---

## 📊 **Expected Results**

### **Console Output:**
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

## 🎯 **Status**

- **Issue**: GraphQL query incompatible with Shopify API 2024-07
- **Severity**: 🔴 **CRITICAL** (workflow cannot run)
- **Fix Time**: ~2 minutes
- **Complexity**: Simple (just update query string)
- **Risk**: Low (only affects data fetching, not logic)

---

**Last Updated**: 2025-12-02  
**Workflow**: `ATW_WKT_Live_OPTIMIZED`  
**Node**: "Get Shopify Products"  
**API Version**: Shopify 2024-07  
**Status**: ⚠️ **FIX REQUIRED**

