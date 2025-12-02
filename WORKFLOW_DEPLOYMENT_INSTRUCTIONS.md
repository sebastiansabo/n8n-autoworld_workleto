# ATW_WKT_Live_OPTIMIZED Workflow Deployment Instructions

## ✅ Workflow Created in n8n

**Workflow ID:** `M3VtEypui8sn2io7`  
**Name:** `ATW_WKT_Live_OPTIMIZED`  
**Status:** Partially created (2 of 20 nodes)  
**Created:** December 2, 2025

---

## 📋 Current Status

### ✅ What's Been Done

1. **Workflow Shell Created** in your n8n instance
   - Workflow ID: `M3VtEypui8sn2io7`
   - Initial 2 nodes added:
     - Schedule Trigger (runs every 15 minutes)
     - Get Apify Dataset

2. **Complete Workflow JSON Prepared**
   - File: `ATW_WKT_Live-OPTIMIZED.json`
   - Total nodes: 20
   - All connections defined
   - Settings configured

### 🔄 What Needs to Be Done

The complete workflow needs to be imported into n8n. You have **two options**:

---

## Option 1: Import via n8n UI (Recommended - Fastest)

This is the quickest and most reliable method:

### Steps:

1. **Open n8n**
   - Go to: https://autoworld.app.n8n.cloud
   - Log in with your credentials

2. **Delete the Partial Workflow** (if desired)
   - Find workflow: `ATW_WKT_Live_OPTIMIZED` (ID: M3VtEypui8sn2io7)
   - Delete it (we'll import the complete one)

3. **Import the Complete Workflow**
   - Click on "Workflows" in the sidebar
   - Click the "+" button or "Import from File"
   - Select file: `ATW_WKT_Live-OPTIMIZED.json`
   - Click "Import"

4. **Configure Credentials**
   - The workflow will import with placeholder tokens
   - Update the following:
     - **Shopify Access Token**: Replace `YOUR_SHOPIFY_ACCESS_TOKEN` with your actual token
     - **Apify API**: Verify credential "Apify account 2" is connected
   
5. **Review and Activate**
   - Review the workflow structure
   - Test with manual execution
   - Activate when ready

---

## Option 2: Complete via MCP API (Advanced)

If you prefer to complete the workflow programmatically:

### Using n8n MCP Tools

The workflow shell (ID: `M3VtEypui8sn2io7`) exists with 2 nodes. To add the remaining 18 nodes:

```bash
# Use the n8n_update_partial_workflow tool with operations to add each node
# This requires 18 separate addNode operations plus connection updates
```

**Note:** This approach is more complex and time-consuming than the UI import method.

---

## 📊 Complete Workflow Structure

### Workflow Overview

**Name:** ATW_WKT_Live_OPTIMIZED  
**Purpose:** Automated Shopify product sync from Autoworld inventory  
**Schedule:** Every 15 minutes  
**Total Nodes:** 20

### Node Breakdown

| # | Node Name | Type | Purpose |
|---|-----------|------|---------|
| 1 | Schedule Trigger | Trigger | Runs every 15 min |
| 2 | Get Apify Dataset | Apify | Fetch car inventory |
| 3 | Normalize Data | Code (Python) | Transform data format |
| 4 | Split Images | Code (JS) | Process image URLs |
| 5 | Get Shopify Products | HTTP | Fetch existing products |
| 6 | Unified Filter | Code (JS) | Determine CREATE/UPDATE/DEACTIVATE |
| 7 | Route: Create? | If | Route new products |
| 8 | Route: Update? | If | Route existing products |
| 9 | Route: Deactivate? | If | Route products to deactivate |
| 10 | Create Product | Shopify | Create new products |
| 11 | Build Metafields | Code (JS) | Prepare metafields |
| 12 | Wait | Wait | Rate limiting (5s) |
| 13 | Update Variant SKU/Price | HTTP | Update variant data |
| 14 | Set Metafields | HTTP (GraphQL) | Apply metafields |
| 15 | Check Price Updates | Code (JS) | Compare prices |
| 16 | Update Prices | HTTP (GraphQL) | Update prices |
| 17 | Deactivate Products | HTTP | Set to draft status |
| 18 | Trigger Note | Sticky Note | Documentation |
| 19 | Routing Note | Sticky Note | Documentation |
| 20 | Create Flow Note | Sticky Note | Documentation |

### Workflow Flow

```
Schedule Trigger (15 min)
  ↓
Get Apify Dataset
  ↓
Normalize Data (Python)
  ↓
Split Images (JS)
  ↓
Get Shopify Products (GraphQL)
  ↓
Unified Filter (determines action)
  ├─→ CREATE → Create Product → Build Metafields → Wait → Update Variant → Set Metafields
  ├─→ UPDATE → Check Price Updates → Update Prices
  └─→ DEACTIVATE → Deactivate Products
```

### Key Features

1. **Smart Routing**: Automatically determines if products should be created, updated, or deactivated
2. **Deduplication**: Removes duplicate SKUs before processing
3. **Price Comparison**: Only updates prices when they actually change
4. **Rate Limiting**: 5-second wait between operations to respect API limits
5. **Error Handling**: Continue on fail for resilient execution
6. **Retry Logic**: 3 retries with 2-second delays on HTTP failures

---

## 🔧 Configuration Requirements

### Before Activating

1. **Shopify Access Token**
   - Replace `YOUR_SHOPIFY_ACCESS_TOKEN` in these nodes:
     - Get Shopify Products (line 87)
     - Update Variant SKU/Price (line 298)
     - Set Metafields (line 336)
     - Update Prices (line 388)
     - Deactivate Products (line 426)

2. **Apify Credentials**
   - Verify "Apify account 2" credential is configured
   - Dataset ID: `voxWznLb06HVvnOSi`

3. **Shopify Store**
   - Store URL: `cb6c17-2.myshopify.com`
   - API Version: `2024-07`

### Settings Configured

- **Execution Order:** v1
- **Timezone:** Europe/Bucharest
- **Execution Timeout:** 3600 seconds (1 hour)
- **Save Execution Data:** All (success and error)
- **Save Manual Executions:** Yes

---

## 🧪 Testing the Workflow

### Manual Test

1. Open the workflow in n8n
2. Click "Execute Workflow" button
3. Monitor execution in real-time
4. Check execution data for each node
5. Verify products in Shopify admin

### What to Check

- ✅ Apify data fetched successfully
- ✅ Data normalized correctly
- ✅ Images split into individual fields
- ✅ Shopify products retrieved
- ✅ CREATE/UPDATE/DEACTIVATE routing works
- ✅ Products created/updated in Shopify
- ✅ Metafields applied correctly
- ✅ Prices updated when changed

---

## 📈 Monitoring & Maintenance

### Execution History

- View in n8n: Workflows → ATW_WKT_Live_OPTIMIZED → Executions
- Check success/failure rates
- Review execution times
- Monitor API rate limits

### Common Issues

1. **API Rate Limits**
   - Shopify: 2 requests/second
   - Solution: Adjust wait times if needed

2. **Credential Expiration**
   - Shopify tokens can expire
   - Solution: Regenerate and update

3. **Data Format Changes**
   - Apify dataset structure might change
   - Solution: Update normalization code

---

## 🔗 Related Files

- **Workflow JSON:** `ATW_WKT_Live-OPTIMIZED.json`
- **Original Workflow:** `ATW_WKT_Live-4.json`
- **Optimization Report:** `OPTIMIZATION_REPORT.md`
- **Comparison:** `COMPARISON.md`
- **n8n MCP Setup:** `N8N_MCP_SETUP.md`

---

## 📞 Support

For issues or questions:
- Check n8n documentation: https://docs.n8n.io
- Review execution logs in n8n UI
- Validate workflow structure using n8n_validate_workflow MCP tool

---

## ✅ Quick Start Checklist

- [ ] Import `ATW_WKT_Live-OPTIMIZED.json` into n8n
- [ ] Replace all `YOUR_SHOPIFY_ACCESS_TOKEN` placeholders
- [ ] Verify Apify credentials are connected
- [ ] Test workflow with manual execution
- [ ] Review execution results
- [ ] Activate workflow for scheduled runs
- [ ] Monitor first few executions
- [ ] Set up alerts for failures (optional)

---

*Last Updated: December 2, 2025*  
*Workflow Version: Optimized v1*  
*n8n Instance: https://autoworld.app.n8n.cloud*

