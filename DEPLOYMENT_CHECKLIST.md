# Deployment Checklist
## Safe Migration to Fixed Optimized Workflow

**Version:** 1.0  
**Date:** December 2, 2024  
**Estimated Time:** 3-4 hours  
**Risk Level:** Medium (with rollback plan)

---

## 📋 Table of Contents

1. [Pre-Deployment](#pre-deployment)
2. [Deployment Steps](#deployment-steps)
3. [Post-Deployment](#post-deployment)
4. [Rollback Procedure](#rollback-procedure)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment

### Phase 1: Preparation (30 minutes)

#### 1.1 Backup Current State

```bash
# Checklist
- [ ] Export current workflow
      File → Export → Save as: ATW_WKT_Live_BACKUP_20241202.json
      
- [ ] Document current credentials
      - Apify API: [ID: EAyKk7B1ZQwADDAC]
      - Shopify Access Token: [ID: KU2N3c1rQr2C0rDE]
      
- [ ] Screenshot current execution logs
      - Last 5 successful executions
      - Any error patterns
      
- [ ] Export Shopify product list
      Products → Export → CSV
      Save as: shopify_products_before_20241202.csv
      
- [ ] Note current schedule
      Current: Every 1 minute
      Target: Every 15 minutes
```

#### 1.2 Environment Check

```bash
# Verify prerequisites
- [ ] n8n version: 1.122.3 or higher
      Command: n8n --version
      
- [ ] Node.js version: 18.x or higher
      Command: node --version
      
- [ ] Available disk space: > 5GB
      Command: df -h
      
- [ ] Memory available: > 2GB
      Command: free -h
      
- [ ] Network connectivity to:
      - Apify API (apify.com)
      - Shopify API (myshopify.com)
```

#### 1.3 Test Environment Setup

```bash
# Create test workflow
- [ ] Import ATW_WKT_Live-OPTIMIZED.json
      
- [ ] Rename to: ATW_WKT_Live_TEST
      
- [ ] Replace "Normalize Data" code with NORMALIZE_DATA_FIXED.js
      
- [ ] Update credentials (use same as production)
      
- [ ] Set schedule to: Manual only (disable trigger)
      
- [ ] Save workflow
```

#### 1.4 Stakeholder Communication

```bash
# Notify team
- [ ] Email to: [Team distribution list]
      Subject: "n8n Workflow Deployment - [Date] [Time]"
      
- [ ] Slack notification in: #operations channel
      
- [ ] Calendar hold: 3-hour deployment window
      
- [ ] Backup person identified: [Name]
      
- [ ] Rollback decision maker: [Name]
```

---

## Deployment Steps

### Phase 2: Testing (1 hour)

#### 2.1 Unit Tests

```bash
# Run basic validation
- [ ] Test slugify function
      Input: "BMW X5 2020"
      Expected: "bmw-x5-2020"
      Result: _______
      
- [ ] Test HTML escaping
      Input: "<script>alert('test')</script>"
      Expected: "&lt;script&gt;alert('test')&lt;/script&gt;"
      Result: _______
      
- [ ] Test image extraction
      Input: ["img1.jpg", "img2.jpg"]
      Expected: "img1.jpg"
      Result: _______
      
- [ ] Test price calculation
      Input: 12100
      Expected: "10000.00"
      Result: _______
```

#### 2.2 Integration Test (Small Dataset)

```bash
# Test with 10 items
- [ ] Prepare test dataset
      Create: test_data_10items.json
      
- [ ] Inject into "Get Apify Dataset" node
      Use: Manual execution with test data
      
- [ ] Execute workflow
      Click: "Execute Workflow"
      
- [ ] Monitor execution
      Watch: All nodes complete successfully
      
- [ ] Validate output
      Check: 10 products created in Shopify test store
      
- [ ] Verify metafields
      Open: Random product → Metafields section
      Check: All custom fields populated
      
- [ ] Check images
      Verify: Images loaded correctly
      
- [ ] Execution time
      Target: < 30 seconds
      Actual: _______ seconds
      
- [ ] Error count
      Target: 0 errors
      Actual: _______ errors
```

**STOP POINT:** If any test fails, do NOT proceed. Fix issues first.

#### 2.3 Integration Test (Medium Dataset)

```bash
# Test with 50 items
- [ ] Prepare test dataset
      Create: test_data_50items.json
      
- [ ] Execute workflow
      
- [ ] Execution time
      Target: < 70 seconds
      Actual: _______ seconds
      
- [ ] Error count
      Target: 0 errors
      Actual: _______ errors
      
- [ ] Verify random samples (5 products)
      Product 1: _______ ✅/❌
      Product 2: _______ ✅/❌
      Product 3: _______ ✅/❌
      Product 4: _______ ✅/❌
      Product 5: _______ ✅/❌
```

**STOP POINT:** If error rate > 2%, do NOT proceed.

### Phase 3: Deployment (30 minutes)

#### 3.1 Deactivate Current Workflow

```bash
# Stop production workflow
- [ ] Open: ATW_WKT_Live (current)
      
- [ ] Toggle: Active → Inactive
      
- [ ] Wait: 2 minutes (ensure no running executions)
      
- [ ] Verify: No active executions
      Check: Executions tab → No "Running" status
      
- [ ] Note time: _______ (for rollback reference)
```

#### 3.2 Deploy Fixed Workflow

```bash
# Activate new workflow
- [ ] Open: ATW_WKT_Live_TEST
      
- [ ] Rename to: ATW_WKT_Live_FIXED
      
- [ ] Update schedule
      From: Manual only
      To: Every 15 minutes
      
- [ ] Verify credentials
      Apify: ✅ Configured
      Shopify: ✅ Configured
      
- [ ] Final code review
      Check: NORMALIZE_DATA_FIXED.js is in place
      Check: No placeholder credentials
      Check: All nodes connected
      
- [ ] Save workflow
      
- [ ] Toggle: Inactive → Active
      
- [ ] Note time: _______ (deployment time)
```

#### 3.3 Initial Monitoring (15 minutes)

```bash
# Watch first execution
- [ ] Wait for first scheduled run
      Expected: Within 15 minutes
      
- [ ] Monitor execution in real-time
      Watch: Each node completes
      
- [ ] Check execution logs
      Look for: Success messages
      Look for: No errors
      
- [ ] Verify Shopify updates
      Check: Products created/updated
      Check: Prices accurate
      Check: Metafields populated
      
- [ ] First execution results
      Duration: _______ seconds
      Items processed: _______
      Errors: _______
      Status: ✅ Success / ❌ Failed
```

**DECISION POINT:** 
- ✅ If successful → Continue to Phase 4
- ❌ If failed → Execute Rollback Procedure

---

## Post-Deployment

### Phase 4: Validation (1 hour)

#### 4.1 Monitor Multiple Executions

```bash
# Watch 4 consecutive runs (1 hour)
- [ ] Execution 1 (0:00)
      Status: _______
      Duration: _______
      Errors: _______
      
- [ ] Execution 2 (0:15)
      Status: _______
      Duration: _______
      Errors: _______
      
- [ ] Execution 3 (0:30)
      Status: _______
      Duration: _______
      Errors: _______
      
- [ ] Execution 4 (0:45)
      Status: _______
      Duration: _______
      Errors: _______
```

#### 4.2 Data Quality Checks

```bash
# Verify data integrity
- [ ] Check for duplicate products
      Query: SELECT sku, COUNT(*) FROM products GROUP BY sku HAVING COUNT(*) > 1
      Expected: 0 duplicates
      Actual: _______ duplicates
      
- [ ] Verify SKU matching
      Sample: 10 random products
      Check: SKU matches source data
      Accuracy: _______ %
      
- [ ] Validate prices
      Sample: 10 random products
      Check: Price matches source
      Check: VAT calculation correct
      Accuracy: _______ %
      
- [ ] Check metafields
      Sample: 5 random products
      Check: All custom fields populated
      Check: Values correct
      Success rate: _______ %
      
- [ ] Verify images
      Sample: 5 random products
      Check: Images loaded
      Check: First image correct
      Success rate: _______ %
```

#### 4.3 Performance Validation

```bash
# Measure actual performance
- [ ] Average execution time
      Target: < 120 seconds
      Actual: _______ seconds
      
- [ ] API call count (per execution)
      Target: < 400 calls
      Actual: _______ calls
      
- [ ] Error rate
      Target: < 2%
      Actual: _______ %
      
- [ ] Memory usage
      Target: < 200MB
      Peak: _______ MB
      
- [ ] CPU usage
      Target: < 80%
      Peak: _______ %
```

#### 4.4 Comparison with Original

```bash
# Compare metrics
- [ ] Execution time
      Original: ~180 seconds
      Fixed: _______ seconds
      Improvement: _______ %
      
- [ ] API calls
      Original: ~500 per execution
      Fixed: _______ per execution
      Reduction: _______ %
      
- [ ] Error rate
      Original: ~5%
      Fixed: _______ %
      Improvement: _______ %
      
- [ ] Duplicate products
      Original: Yes (5-10x per SKU)
      Fixed: _______ duplicates
      Status: ✅ Fixed / ❌ Still present
```

### Phase 5: Documentation (30 minutes)

#### 5.1 Update Documentation

```bash
# Document deployment
- [ ] Update README.md
      - Current version: 1.0 (Fixed)
      - Deployment date: _______
      - Status: Production
      
- [ ] Create deployment log
      File: DEPLOYMENT_LOG_20241202.md
      Include:
      - Deployment time
      - Test results
      - Performance metrics
      - Issues encountered
      - Resolution steps
      
- [ ] Update CHANGELOG.md
      Add entry for version 1.0
      
- [ ] Archive old workflow
      Move: ATW_WKT_Live_BACKUP_20241202.json → /archive/
```

#### 5.2 Team Communication

```bash
# Notify stakeholders
- [ ] Email to team
      Subject: "n8n Workflow Deployment - SUCCESS"
      Include:
      - Deployment summary
      - Performance improvements
      - Known issues (if any)
      - Monitoring plan
      
- [ ] Slack update
      Channel: #operations
      Message: "✅ Workflow deployed successfully"
      
- [ ] Update status page (if applicable)
      Status: Operational
```

---

## Rollback Procedure

### Emergency Rollback (5 minutes)

**When to Rollback:**
- ❌ Error rate > 10%
- ❌ Execution time > 300 seconds
- ❌ Critical data corruption
- ❌ Shopify API errors
- ❌ Multiple duplicate products created

**Rollback Steps:**

```bash
# IMMEDIATE ACTION
1. [ ] Deactivate new workflow
       ATW_WKT_Live_FIXED → Toggle to Inactive
       
2. [ ] Activate backup workflow
       ATW_WKT_Live_BACKUP → Toggle to Active
       
3. [ ] Verify rollback
       Check: Old workflow running
       Check: No errors
       
4. [ ] Note rollback time: _______

# POST-ROLLBACK
5. [ ] Document issue
       Create: ROLLBACK_REPORT_20241202.md
       Include:
       - Reason for rollback
       - Error logs
       - Data affected
       - Next steps
       
6. [ ] Notify team
       Slack: "⚠️ Workflow rolled back - investigating"
       
7. [ ] Schedule post-mortem
       Meeting: Within 24 hours
       Attendees: Dev team, QA, Operations
```

### Partial Rollback

**If only specific node is problematic:**

```bash
# Replace problematic node
1. [ ] Identify failing node
       Node: _______
       
2. [ ] Export node from backup
       
3. [ ] Import into current workflow
       
4. [ ] Test execution
       
5. [ ] If successful, continue monitoring
```

---

## Monitoring

### Day 1: Intensive Monitoring

```bash
# First 24 hours - check every 2 hours
- [ ] 08:00 - Check
      Status: _______
      Issues: _______
      
- [ ] 10:00 - Check
      Status: _______
      Issues: _______
      
- [ ] 12:00 - Check
      Status: _______
      Issues: _______
      
- [ ] 14:00 - Check
      Status: _______
      Issues: _______
      
- [ ] 16:00 - Check
      Status: _______
      Issues: _______
      
- [ ] 18:00 - Check
      Status: _______
      Issues: _______
```

### Week 1: Daily Monitoring

```bash
# Days 2-7 - check daily
- [ ] Day 2
      Executions: _______
      Errors: _______
      Avg Duration: _______
      
- [ ] Day 3
      Executions: _______
      Errors: _______
      Avg Duration: _______
      
- [ ] Day 4
      Executions: _______
      Errors: _______
      Avg Duration: _______
      
- [ ] Day 5
      Executions: _______
      Errors: _______
      Avg Duration: _______
      
- [ ] Day 6
      Executions: _______
      Errors: _______
      Avg Duration: _______
      
- [ ] Day 7
      Executions: _______
      Errors: _______
      Avg Duration: _______
```

### Ongoing: Weekly Review

```bash
# Weekly metrics
- [ ] Week 1 Summary
      Total executions: _______
      Success rate: _______ %
      Avg duration: _______ seconds
      Issues: _______
      
- [ ] Week 2 Summary
      Total executions: _______
      Success rate: _______ %
      Avg duration: _______ seconds
      Issues: _______
```

### Key Metrics to Track

```bash
# Dashboard metrics
- [ ] Execution success rate
      Target: > 98%
      
- [ ] Average execution time
      Target: < 120 seconds
      
- [ ] Error count per day
      Target: < 5
      
- [ ] Duplicate products created
      Target: 0
      
- [ ] API call count
      Target: < 400 per execution
      
- [ ] Memory usage
      Target: < 200MB
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Execution Timeout

**Symptoms:**
- Workflow stops mid-execution
- Timeout error in logs

**Solution:**
```bash
1. [ ] Check execution time
       If > 180s, investigate slow nodes
       
2. [ ] Increase timeout
       Settings → Execution Timeout → 300s
       
3. [ ] Optimize slow nodes
       - Check API response times
       - Reduce batch size
       - Add caching
```

#### Issue 2: Duplicate Products

**Symptoms:**
- Same SKU appears multiple times in Shopify

**Solution:**
```bash
1. [ ] Check Unified Filter logs
       Look for: "duplicates removed"
       
2. [ ] Verify SKU normalization
       Test: normalizeSKU("TEST 001") === normalizeSKU("TEST-001")
       
3. [ ] Manual cleanup
       Query: Find duplicates
       Action: Delete duplicates, keep first
```

#### Issue 3: Missing Metafields

**Symptoms:**
- Products created but metafields empty

**Solution:**
```bash
1. [ ] Check "Build Metafields" logs
       Look for: "Generated X metafield updates"
       
2. [ ] Verify source data
       Check: All required fields present
       
3. [ ] Check GraphQL errors
       Look for: userErrors in response
       
4. [ ] Re-run metafield update
       Manual: Update Variant → Set Metafields
```

#### Issue 4: Image Not Loading

**Symptoms:**
- Products created but no images

**Solution:**
```bash
1. [ ] Check "Split Images" logs
       Look for: "Extracted X images"
       
2. [ ] Verify image URLs
       Test: URL accessible (https://)
       Check: Not blocked pattern
       
3. [ ] Check image format
       Verify: .jpg, .png, .webp, etc.
       
4. [ ] Manual fix
       Edit product → Add images manually
```

#### Issue 5: Price Not Updating

**Symptoms:**
- Price changes in source not reflected in Shopify

**Solution:**
```bash
1. [ ] Check "Check Price Updates" logs
       Look for: "Price Update Stats"
       
2. [ ] Verify price difference
       Check: Difference > 0.01 (1 cent)
       
3. [ ] Check for GraphQL errors
       Look for: userErrors in response
       
4. [ ] Manual update
       Edit product → Update price
```

---

## Sign-Off

### Deployment Approval

```bash
# Required approvals
- [ ] Technical Lead: _______________________  Date: _______
      
- [ ] QA Manager: _________________________  Date: _______
      
- [ ] Operations Manager: __________________  Date: _______
      
- [ ] Product Owner: _______________________  Date: _______
```

### Deployment Completion

```bash
# Final sign-off
- [ ] All tests passed: ✅ Yes / ❌ No
      
- [ ] Performance targets met: ✅ Yes / ❌ No
      
- [ ] No critical issues: ✅ Yes / ❌ No
      
- [ ] Documentation updated: ✅ Yes / ❌ No
      
- [ ] Team notified: ✅ Yes / ❌ No
      
- [ ] Monitoring in place: ✅ Yes / ❌ No
```

**Deployment Status:** 
- [ ] ✅ SUCCESS - Production ready
- [ ] ⚠️ PARTIAL - Monitoring required
- [ ] ❌ FAILED - Rolled back

**Deployed By:** _______________________  
**Date:** _______________________  
**Time:** _______________________

---

## Appendix

### Quick Reference

**Backup Location:** `/backups/ATW_WKT_Live_BACKUP_20241202.json`  
**Fixed Code:** `/fixes/NORMALIZE_DATA_FIXED.js`  
**Test Plan:** `TEST_PLAN.md`  
**Documentation:** `README.md`, `OPTIMIZATION_REPORT.md`

### Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| **Technical Lead** | _______ | _______ |
| **On-Call Engineer** | _______ | _______ |
| **DevOps** | _______ | _______ |
| **Product Owner** | _______ | _______ |

### Useful Commands

```bash
# Check n8n status
systemctl status n8n

# View logs
tail -f /var/log/n8n/n8n.log

# Restart n8n
systemctl restart n8n

# Check disk space
df -h

# Check memory
free -h

# Check CPU
top
```

---

**Checklist Version:** 1.0  
**Last Updated:** December 2, 2024  
**Next Review:** After deployment completion

---

## Notes

Use this space for deployment-specific notes:

```
_______________________________________________________________

_______________________________________________________________

_______________________________________________________________

_______________________________________________________________

_______________________________________________________________
```

