# 🚀 Quick Start Guide - Optimized Workflow

**Time to deploy:** 10 minutes  
**Difficulty:** Easy  
**Prerequisites:** n8n instance, Shopify store, Apify account

---

## ⚡ 5-Minute Setup

### Step 1: Import Workflow (2 minutes)

1. Open your n8n instance
2. Click **Workflows** → **Import from File**
3. Select `ATW_WKT_Live-OPTIMIZED.json`
4. Click **Import**

✅ **Done!** Workflow imported.

### Step 2: Configure Credentials (2 minutes)

**Apify API:**
- Node: "Get Apify Dataset"
- Credential: Select existing or create new
- ID: `EAyKk7B1ZQwADDAC` (if using existing)

**Shopify Access Token:**
- Nodes: "Create Product", "Get Shopify Products", etc.
- Credential: Select existing or create new
- ID: `KU2N3c1rQr2C0rDE` (if using existing)

✅ **Done!** Credentials configured.

### Step 3: Verify Settings (1 minute)

Check these in the workflow:
- ✅ Apify Dataset ID: `voxWznLb06HVvnOSi`
- ✅ Shopify Store: `cb6c17-2.myshopify.com`
- ✅ Schedule: Every 15 minutes
- ✅ Vendor: `Autoworld`

✅ **Done!** Settings verified.

### Step 4: Test (3 minutes)

1. Click **Execute Workflow** (manual test)
2. Wait for completion (~2 minutes)
3. Check execution log for errors
4. Verify in Shopify:
   - Go to Products
   - Filter by vendor: Autoworld
   - Check recent products

✅ **Done!** Test successful.

### Step 5: Activate (1 minute)

1. Toggle **Active** switch to ON
2. Workflow will run every 15 minutes automatically

✅ **Done!** Workflow active and running!

---

## 🎯 What Happens Next?

### First Execution (within 15 minutes)

The workflow will:
1. ✅ Fetch car inventory from Apify
2. ✅ Transform data to Shopify format
3. ✅ Compare with existing products
4. ✅ Create new products
5. ✅ Update prices on existing products
6. ✅ Deactivate products no longer in stock

**Expected time:** ~2 minutes for 200 items

### Ongoing Operations

Every 15 minutes:
- ✅ Sync new inventory
- ✅ Update prices
- ✅ Manage product lifecycle
- ✅ Log all operations

---

## 📊 Monitoring Your Workflow

### Check Execution Logs

1. Go to **Executions** in n8n
2. Click on latest execution
3. Review each node's output

**Look for:**
```
=== OPTIMIZED UNIFIED FILTER ===
Shopify: 150 variants → 150 unique SKUs
Incoming: 160 raw → 160 unique (0 duplicates removed)

=== RESULTS ===
CREATE: 10
UPDATE: 150
DEACTIVATE: 0
TOTAL: 160
```

### Success Indicators

✅ **Green checkmarks** on all nodes  
✅ **Execution time** < 120 seconds  
✅ **No errors** in logs  
✅ **Products created** in Shopify  
✅ **Prices updated** correctly  

### Warning Signs

⚠️ **Red X** on any node → Check error message  
⚠️ **Execution time** > 180 seconds → May need optimization  
⚠️ **Duplicates** in logs → Check deduplication  
⚠️ **GraphQL errors** → Check metafield values  

---

## 🔧 Common Adjustments

### Change Schedule Frequency

**Default:** Every 15 minutes

**To change:**
1. Open "Schedule Trigger" node
2. Modify interval:
   - **30 minutes:** Lower load
   - **60 minutes:** Minimal load
   - **5 minutes:** More frequent (not recommended)

### Adjust Rate Limiting

**Default:** 5 seconds wait after product creation

**To change:**
1. Open "Wait" node
2. Modify amount:
   - **Shopify Plus:** 2-3 seconds
   - **Shopify Basic:** 8-10 seconds

### Enable/Disable Deactivations

**Default:** Enabled

**To disable:**
1. Open "Unified Filter" node
2. Find line: `const INCLUDE_DEACTIVATIONS = true;`
3. Change to: `const INCLUDE_DEACTIVATIONS = false;`

---

## 🐛 Quick Troubleshooting

### Issue: "Workflow not running"

**Check:**
1. Is workflow **Active**? (toggle should be ON)
2. Is schedule configured? (every 15 minutes)
3. Check n8n service status

**Fix:** Toggle Active OFF then ON

### Issue: "No products created"

**Check:**
1. Apify dataset has data?
2. Credentials configured correctly?
3. Shopify store accessible?

**Fix:** Run manual execution, check logs

### Issue: "Duplicate products"

**Check:**
1. Using optimized workflow? (not original)
2. Unified Filter running?
3. Check logs for "duplicates removed"

**Fix:** Should not happen with optimized workflow

### Issue: "Prices not updating"

**Check:**
1. Price difference > 1 cent?
2. Check "Check Price Updates" logs
3. Verify Shopify API access

**Fix:** Check existing_price vs incoming_price in logs

### Issue: "Shopify throttling"

**Check:**
1. Too many API calls?
2. Schedule too frequent?
3. Rate limiting configured?

**Fix:**
1. Increase Wait duration (5s → 8s)
2. Reduce schedule frequency (15min → 30min)

---

## 📚 Documentation

### Quick Reference

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **QUICK_START.md** | Setup guide | First time setup |
| **README.md** | Overview | General reference |
| **COMPARISON.md** | Original vs Optimized | Understanding improvements |
| **OPTIMIZATION_REPORT.md** | Full details | Deep dive |

### Need Help?

1. **Check logs** in n8n Executions
2. **Review README.md** for common issues
3. **Consult OPTIMIZATION_REPORT.md** for details
4. **Check Shopify API status**
5. **Verify Apify dataset**

---

## ✅ Success Checklist

After setup, verify:

- [ ] Workflow imported successfully
- [ ] Credentials configured (Apify + Shopify)
- [ ] Settings verified (dataset ID, store URL)
- [ ] Manual test completed successfully
- [ ] Products visible in Shopify
- [ ] Metafields populated correctly
- [ ] Workflow activated (toggle ON)
- [ ] First scheduled execution completed
- [ ] Logs reviewed for errors
- [ ] Monitoring set up

**All checked?** 🎉 **You're done!**

---

## 🎯 Expected Results

### First 24 Hours

- **Executions:** 96 (every 15 minutes)
- **Products Synced:** All from Apify dataset
- **API Calls:** ~33,600 total
- **Errors:** < 1%
- **Success Rate:** > 99%

### Ongoing Performance

- **Execution Time:** ~120s per run
- **New Products:** Created automatically
- **Price Updates:** Within 15 minutes
- **Deactivations:** Automatic for sold items
- **Data Quality:** 100% accurate

---

## 💡 Pro Tips

### Optimization

1. ✅ **Monitor first week** closely
2. ✅ **Adjust schedule** based on inventory update frequency
3. ✅ **Fine-tune rate limiting** based on Shopify plan
4. ✅ **Review logs weekly** for patterns
5. ✅ **Keep execution history** for 30 days

### Best Practices

1. ✅ **Test changes** in development first
2. ✅ **Backup workflow** before modifications
3. ✅ **Document custom changes**
4. ✅ **Monitor API usage**
5. ✅ **Update documentation**

### Maintenance

1. ✅ **Check logs daily** (first week)
2. ✅ **Review performance weekly**
3. ✅ **Optimize monthly** based on data
4. ✅ **Update quarterly** (dependencies, APIs)

---

## 📈 Performance Targets

| Metric | Target | Alert If |
|--------|--------|----------|
| **Execution Time** | < 120s | > 180s |
| **Error Rate** | < 1% | > 2% |
| **API Calls** | < 400/exec | > 500/exec |
| **Duplicates** | 0 | > 0 |
| **Success Rate** | > 99% | < 98% |

**Meeting targets?** ✅ Workflow performing optimally!

---

## 🚀 Next Steps

### After Successful Setup

1. **Week 1:** Monitor closely, adjust if needed
2. **Week 2:** Review performance metrics
3. **Week 3:** Optimize based on patterns
4. **Week 4:** Document any customizations

### Future Enhancements

Consider adding:
- 📊 **Analytics dashboard** for metrics
- 🔔 **Alerts** for errors or anomalies
- 📧 **Email reports** for daily summaries
- 🔄 **Webhook triggers** for real-time updates
- 📦 **Batch operations** for better performance

---

## 🎉 Congratulations!

Your optimized workflow is now:
- ✅ **Running automatically** every 15 minutes
- ✅ **Syncing products** from Apify to Shopify
- ✅ **Handling errors** gracefully
- ✅ **Logging everything** for monitoring
- ✅ **Optimized** for performance and cost

**Questions?** Check the documentation or review execution logs.

**Issues?** See troubleshooting section or OPTIMIZATION_REPORT.md.

**Feedback?** Document your experience for future reference.

---

**Happy Automating! 🚀**

---

**Version:** 1.0  
**Last Updated:** December 2, 2024  
**Status:** ✅ Production Ready

