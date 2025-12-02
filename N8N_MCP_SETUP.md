# n8n MCP Connection Setup

## ✅ Connection Status: **ACTIVE**

Your n8n instance is successfully connected via MCP (Model Context Protocol).

---

## 📋 Configuration Details

### Instance Information
- **n8n Cloud URL:** `https://autoworld.app.n8n.cloud`
- **API Status:** ✅ Connected
- **Version:** 2.28.2 (up to date)
- **Environment:** Production
- **Platform:** Darwin (macOS)
- **Node Version:** v22.18.0

### MCP Configuration
- **Mode:** Standard I/O (Claude Desktop)
- **Config Location:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Package:** `n8n-mcp` (via npx)
- **Version:** 2.28.2

---

## 🔧 Available Tools (20 total)

### Documentation Tools (7)
Always available for exploring and understanding n8n:
- `search_nodes` - Search 500+ available nodes
- `get_node` - Get detailed node information
- `validate_node` - Validate node configurations
- `search_templates` - Browse pre-built workflows
- `get_template` - Get template details
- `validate_workflow` - Validate workflow structure
- `tools_documentation` - Get MCP tool documentation

### Management Tools (13)
Full workflow lifecycle management:
- `n8n_create_workflow` - Create new workflows
- `n8n_get_workflow` - Get workflow details
- `n8n_update_full_workflow` - Complete workflow updates
- `n8n_update_partial_workflow` - Incremental workflow updates
- `n8n_delete_workflow` - Delete workflows
- `n8n_list_workflows` - List all workflows
- `n8n_validate_workflow` - Validate workflows by ID
- `n8n_autofix_workflow` - Auto-fix common issues
- `n8n_test_workflow` - Test/trigger workflow execution
- `n8n_executions` - Manage workflow executions
- `n8n_health_check` - Check instance health
- `n8n_workflow_versions` - Version history management
- `n8n_deploy_template` - Deploy templates from n8n.io

---

## 📊 Current Workflow Inventory

Your n8n instance contains **10+ workflows** (showing first 10):

| Workflow Name | ID | Status | Nodes | Last Updated |
|--------------|-----|--------|-------|--------------|
| ATW_WKT_Live copy | 0ZTK4fuYEYntn57w | Inactive (Archived) | 15 | 2025-10-29 |
| My workflow 4 | 0emyIEZvlPq9bkTf | Inactive (Archived) | 4 | 2025-08-27 |
| My workflow 9 | 1ORHoEXmoJvKUYxZ | Inactive (Archived) | 21 | 2025-10-29 |
| AW-WRK Vers.7 | 77RftxOGu9CGfPZn | Inactive (Archived) | 14 | 2025-09-02 |
| AW-Workleto | 9TUq9emzti9sid8U | Inactive (Archived) | 14 | 2025-09-02 |
| AW-WRKL | DQrVuMBolqScVwIj | Inactive (Archived) | 13 | 2025-09-02 |
| My workflow 8 | HzxgKmkKKP3LN09F | Inactive (Archived) | 21 | 2025-09-02 |
| My workflow 11 | N7uUaPlXS9S7cTS4 | Inactive | 16 | 2025-10-03 |
| My workflow 3 | Nbh1JtJN0FiJEbrt | Inactive (Archived) | 9 | 2025-08-24 |
| My workflow | NxI5Y7oiLr0X6Y2h | Inactive (Archived) | 1 | 2025-08-27 |

---

## 🚀 Quick Start Examples

### List All Workflows
```javascript
// Use the MCP tool
mcp_n8n-mcp_n8n_list_workflows({ limit: 20 })
```

### Get Workflow Details
```javascript
// Get full workflow structure
mcp_n8n-mcp_n8n_get_workflow({
  id: "0ZTK4fuYEYntn57w",
  mode: "full"
})
```

### Validate a Workflow
```javascript
// Check for errors before deployment
mcp_n8n-mcp_n8n_validate_workflow({
  id: "0ZTK4fuYEYntn57w"
})
```

### Search for Nodes
```javascript
// Find nodes for your workflow
mcp_n8n-mcp_search_nodes({
  query: "shopify",
  limit: 10
})
```

### Deploy a Template
```javascript
// Deploy from n8n.io templates
mcp_n8n-mcp_n8n_deploy_template({
  templateId: 1234,
  autoFix: true,
  autoUpgradeVersions: true
})
```

---

## 🔍 Workflow Analysis: ATW_WKT_Live copy

### Overview
- **Purpose:** Autoworld-Workleto integration workflow
- **Status:** Archived (Inactive)
- **Complexity:** 15 nodes
- **Last Modified:** October 29, 2025

### Key Components
1. **Manual Trigger** - Workflow initiation
2. **Apify Integration** - Dataset retrieval
3. **Data Normalization** - Python & JavaScript processing
4. **Image Processing** - Multi-image handling
5. **Shopify Integration** - Product creation/updates
6. **GraphQL Operations** - Metafield management

### Node Types Used
- Manual Trigger
- Apify API
- Code (JavaScript & Python)
- Shopify API
- HTTP Request
- If/Conditional Logic
- Wait/Webhook

---

## 🛠️ Common Operations

### Create a New Workflow
```javascript
mcp_n8n-mcp_n8n_create_workflow({
  name: "My New Workflow",
  nodes: [
    {
      id: "node-1",
      name: "Start",
      type: "n8n-nodes-base.manualTrigger",
      typeVersion: 1,
      position: [0, 0],
      parameters: {}
    }
  ],
  connections: {}
})
```

### Update Workflow Partially
```javascript
mcp_n8n-mcp_n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [
    {
      type: "addNode",
      node: { /* node config */ }
    },
    {
      type: "updateSettings",
      settings: { executionOrder: "v1" }
    }
  ]
})
```

### Test Workflow Execution
```javascript
mcp_n8n-mcp_n8n_test_workflow({
  workflowId: "workflow-id",
  triggerType: "webhook",
  data: { /* test data */ },
  waitForResponse: true
})
```

---

## 📈 Performance Metrics

- **Diagnostic Response Time:** 878ms
- **Cache Status:** Available (0 cached instances currently)
- **API Timeout:** 30 seconds
- **Max Retries:** 3

---

## 🔐 Security Notes

1. **API Key:** Configured and secured in environment
2. **Connection:** HTTPS to n8n Cloud
3. **Credentials:** Managed through n8n credential system
4. **Secrets:** Never commit API keys or tokens to Git

### Environment Variables
```bash
N8N_API_URL=https://autoworld.app.n8n.cloud
N8N_API_KEY=***configured***
NODE_ENV=production
```

---

## 🐛 Troubleshooting

### If Connection Fails

1. **Verify Claude Desktop Config**
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Check MCP Server Entry**
   ```json
   {
     "mcpServers": {
       "n8n": {
         "command": "npx",
         "args": ["-y", "n8n-mcp"]
       }
     }
   }
   ```

3. **Restart Claude Desktop** after config changes

4. **Test npx execution**
   ```bash
   npx -y n8n-mcp --version
   ```

5. **Check Claude Desktop logs** for startup errors

### Common Issues
- Invalid JSON in `claude_desktop_config.json`
- Incorrect command or args in MCP server config
- Claude Desktop not restarted after config changes
- npx unable to download or run package
- Missing execute permissions on local binary

---

## 📚 Additional Resources

- **n8n Documentation:** https://docs.n8n.io
- **n8n MCP Package:** https://www.npmjs.com/package/n8n-mcp
- **n8n Templates:** https://n8n.io/workflows
- **API Reference:** https://docs.n8n.io/api/

---

## 🎯 Next Steps

Based on your current setup, recommended actions:

1. ✅ **Review Archived Workflows** - Decide which to keep/delete
2. 🔄 **Activate Key Workflows** - Enable production workflows
3. 🧹 **Clean Up Test Workflows** - Remove unused "My workflow X" entries
4. 📦 **Deploy from GitHub** - Sync your optimized workflows
5. 🔍 **Validate All Workflows** - Run validation checks
6. 🚀 **Set Up Monitoring** - Track execution success rates

---

## 📝 Usage Statistics

**Most Common Operations:**
- 82% of users start creating workflows after diagnostics
- Most common first action: `n8n_update_partial_workflow`
- Typical workflow creation time: 6-14 minutes
- Average validation time: Fast (< 6 seconds)

---

*Last Updated: December 2, 2025*
*Connection Status: ✅ Active and Healthy*

