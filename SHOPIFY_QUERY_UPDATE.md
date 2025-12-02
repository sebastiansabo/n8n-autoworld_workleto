# ✅ Shopify GraphQL Query - CONFIRMED WORKING

## 🎯 **Working Query (Tested & Verified)**

This query has been **tested and confirmed working** with Shopify API 2024-07:

```json
{
  "query": "{ products(first: 250, query: \"vendor:Autoworld status:active\") { edges { node { id title handle publishedAt variants(first: 250) { edges { node { id sku title price compareAtPrice } } } } } } }"
}
```

---

## 🔧 **How to Update in n8n Cloud**

### **Step 1: Open the Workflow**
1. Go to https://autoworld.app.n8n.cloud
2. Open workflow: `ATW_WKT_Live_OPTIMIZED`

### **Step 2: Update "Get Shopify Products" Node**
1. Click on the **"Get Shopify Products"** node
2. Find the **"JSON Body"** field
3. **Delete** the existing content
4. **Paste** this exact JSON:

```json
{
  "query": "{ products(first: 250, query: \"vendor:Autoworld status:active\") { edges { node { id title handle publishedAt variants(first: 250) { edges { node { id sku title price compareAtPrice } } } } } } }"
}
```

5. Click **"Save"** (bottom right of node panel)
6. Click **"Save"** (top right of workflow editor)

### **Step 3: Test**
1. Click **"Execute Workflow"** button
2. Check the **"Get Shopify Products"** node output
3. Verify you see product data (no errors)

---

## 📊 **What This Query Returns**

```json
{
  "data": {
    "products": {
      "edges": [
        {
          "node": {
            "id": "gid://shopify/Product/8234567890",
            "title": "BMW X5 2020",
            "handle": "bmw-x5-2020-stock123",
            "publishedAt": "2024-11-15T10:30:00Z",
            "variants": {
              "edges": [
                {
                  "node": {
                    "id": "gid://shopify/ProductVariant/45678901234",
                    "sku": "VIN1234567890",
                    "title": "Default Title",
                    "price": "25000.00",
                    "compareAtPrice": "28000.00"
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

## ✅ **Key Differences from Old Query**

| Field | Old (Broken) | New (Working) |
|-------|-------------|---------------|
| `price` | `price { amount currencyCode }` ❌ | `price` ✅ |
| `compareAtPrice` | `compareAtPrice { amount currencyCode }` ❌ | `compareAtPrice` ✅ |
| `updatedAt` | Included | Removed (not needed) |
| `inventoryQuantity` | Included | Removed (not needed) |
| `sortKey` | `UPDATED_AT` | Removed (not needed) |
| `reverse` | `true` | Removed (not needed) |
| `pageInfo` | Included | Removed (not needed for now) |

---

## 🎯 **Why This Works**

### **Shopify API 2024-07 Changes:**
- `price` is now a **String** (e.g., `"25000.00"`)
- `compareAtPrice` is now a **String** (e.g., `"28000.00"`)
- You **cannot** use `{ amount currencyCode }` on these fields anymore

### **Unified Filter Compatibility:**
The **Unified Filter** node already handles both formats:

```javascript
price: variant.price?.amount || variant.price || ''
```

This means:
- ✅ Works with old format: `variant.price.amount`
- ✅ Works with new format: `variant.price` (string)

**No changes needed to Unified Filter!** 🎉

---

## 🧪 **Verification Steps**

After updating the query:

1. ✅ **Execute the workflow**
2. ✅ **Check "Get Shopify Products" output** - should see products array
3. ✅ **Check "Unified Filter" output** - should see CREATE/UPDATE/DEACTIVATE actions
4. ✅ **Check console logs** - should see:
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

## 📝 **Complete Node Configuration**

### **Node Name:** Get Shopify Products
### **Node Type:** HTTP Request
### **Method:** POST
### **URL:** `https://cb6c17-2.myshopify.com/admin/api/2024-07/graphql.json`

### **Headers:**
```json
{
  "X-Shopify-Access-Token": "YOUR_SHOPIFY_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
```

### **JSON Body:**
```json
{
  "query": "{ products(first: 250, query: \"vendor:Autoworld status:active\") { edges { node { id title handle publishedAt variants(first: 250) { edges { node { id sku title price compareAtPrice } } } } } } }"
}
```

---

## 🚀 **Status**

- ✅ **Query:** Tested and confirmed working
- ✅ **API Version:** Shopify 2024-07 compatible
- ✅ **Unified Filter:** Already compatible (no changes needed)
- ⚠️ **Action Required:** Update the query in n8n Cloud UI

---

## 📋 **Quick Checklist**

- [ ] Open n8n Cloud
- [ ] Open `ATW_WKT_Live_OPTIMIZED` workflow
- [ ] Click "Get Shopify Products" node
- [ ] Replace JSON Body with working query
- [ ] Save node
- [ ] Save workflow
- [ ] Test execution
- [ ] Verify products are fetched successfully
- [ ] Verify Unified Filter processes data correctly

---

**Last Updated:** 2025-12-02  
**Status:** ✅ **READY TO DEPLOY**  
**Tested By:** User  
**API Version:** Shopify 2024-07  
**Workflow:** `ATW_WKT_Live_OPTIMIZED`

