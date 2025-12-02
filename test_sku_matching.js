// SKU MATCHING TEST SCRIPT
// Run this in n8n Code node to diagnose SKU matching issues

// Sample Apify data (from your dataset)
const apifyData = [
  {
    "stockId": "535",
    "vin": "WAUZZZ8V0LA035702",
    "title": "Audi A3 Sportback E-tron 204 CP"
  },
  {
    "stockId": "5714",
    "vin": "LSJW74090RZ131352",
    "title": "MG ZS EV 5 usi Excite Electric 72 kWh AT"
  }
];

// Sample Shopify data (from your screenshot)
const shopifyData = {
  "edges": [
    {
      "node": {
        "id": "gid://shopify/Product/10213713051975",
        "title": "MG ZS EV 5 usi Excite Electric 72 kWh AT",
        "handle": "mg-zs-ev-electric-156-cp-rosu-5714-id721-lsjw74090rz131352",
        "variants": {
          "edges": [
            {
              "node": {
                "id": "gid://shopify/ProductVariant/51770875216199",
                "sku": "LSJW74090RZ131352",
                "title": "Default Title",
                "price": "36410.00"
              }
            }
          ]
        }
      }
    }
  ]
};

// SKU normalization function (from Unified Filter)
const normalizeSKU = (raw) => {
  if (raw == null) return '';
  return String(raw)
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, '')
    .trim()
    .toUpperCase();
};

console.log("=== SKU MATCHING TEST ===\n");

// Test 1: Check Apify SKU extraction
console.log("TEST 1: Apify SKU Extraction");
console.log("----------------------------");
apifyData.forEach((item, i) => {
  const vin = item.vin || item.VIN;
  const stockId = item.stockId;
  const variantSKU = vin || stockId;
  const normalized = normalizeSKU(variantSKU);
  
  console.log(`Item ${i + 1}:`);
  console.log(`  VIN: "${vin}"`);
  console.log(`  StockID: "${stockId}"`);
  console.log(`  Variant SKU: "${variantSKU}"`);
  console.log(`  Normalized: "${normalized}"`);
  console.log();
});

// Test 2: Check Shopify SKU extraction
console.log("\nTEST 2: Shopify SKU Extraction");
console.log("-------------------------------");
shopifyData.edges.forEach((edge, i) => {
  const product = edge.node;
  const variant = product.variants.edges[0]?.node;
  const skuRaw = variant?.sku || '';
  const normalized = normalizeSKU(skuRaw);
  
  console.log(`Product ${i + 1}:`);
  console.log(`  Title: "${product.title}"`);
  console.log(`  SKU Raw: "${skuRaw}"`);
  console.log(`  Normalized: "${normalized}"`);
  console.log();
});

// Test 3: Matching test
console.log("\nTEST 3: SKU Matching");
console.log("--------------------");

// Build Shopify map
const shopifyMap = new Map();
shopifyData.edges.forEach(edge => {
  const variant = edge.node.variants.edges[0]?.node;
  if (variant?.sku) {
    const normalized = normalizeSKU(variant.sku);
    shopifyMap.set(normalized, {
      sku_raw: variant.sku,
      title: edge.node.title
    });
  }
});

console.log(`Shopify Map Size: ${shopifyMap.size}`);
console.log(`Shopify SKUs: ${Array.from(shopifyMap.keys()).join(', ')}`);
console.log();

// Try to match Apify items
apifyData.forEach((item, i) => {
  const vin = item.vin || item.VIN;
  const stockId = item.stockId;
  const variantSKU = vin || stockId;
  const normalized = normalizeSKU(variantSKU);
  
  const match = shopifyMap.get(normalized);
  
  console.log(`Apify Item ${i + 1}: "${item.title}"`);
  console.log(`  Looking for SKU: "${normalized}"`);
  console.log(`  Match found: ${match ? 'YES ✅' : 'NO ❌'}`);
  if (match) {
    console.log(`  Matched to: "${match.title}"`);
  }
  console.log();
});

// Test 4: Character-by-character comparison
console.log("\nTEST 4: Character Comparison");
console.log("-----------------------------");
const apifySKU = normalizeSKU(apifyData[1].vin);
const shopifySKU = Array.from(shopifyMap.keys())[0];

console.log(`Apify SKU:   "${apifySKU}"`);
console.log(`Shopify SKU: "${shopifySKU}"`);
console.log(`Are equal: ${apifySKU === shopifySKU ? 'YES ✅' : 'NO ❌'}`);
console.log(`Length: Apify=${apifySKU.length}, Shopify=${shopifySKU.length}`);

if (apifySKU !== shopifySKU) {
  console.log("\nCharacter-by-character:");
  const maxLen = Math.max(apifySKU.length, shopifySKU.length);
  for (let i = 0; i < maxLen; i++) {
    const a = apifySKU[i] || '∅';
    const s = shopifySKU[i] || '∅';
    const match = a === s ? '✅' : '❌';
    console.log(`  [${i}] Apify: '${a}' (${a.charCodeAt(0)}) | Shopify: '${s}' (${s.charCodeAt(0)}) ${match}`);
  }
}

return [{ json: { test: "complete" } }];

