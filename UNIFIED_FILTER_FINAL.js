// OPTIMIZED UNIFIED FILTER - FINAL VERSION
// Based on working code with proper data source handling

const gidNum = (gid) => String(gid || '').split('/').pop();

// Normalize SKU consistently on BOTH sides
const normalizeSKU = (raw) => {
  if (raw == null) return '';
  return String(raw)
    .normalize('NFKC')                // unify Unicode forms
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // strip zero-widths
    .replace(/\s+/g, '')              // remove all whitespace
    .trim()
    .toUpperCase();                   // case-insensitive match
};

console.log("=== OPTIMIZED UNIFIED FILTER ===");

// 1) Build Shopify SKU index from "Get Shopify Products" node
const shopifyResults = $('Get Shopify Products').all().map(i => i.json);
console.log(`Shopify results received: ${shopifyResults.length}`);

const shopifySkuMap = new Map();
const duplicateIndex = new Map();
let totalShopifyVariants = 0;

for (const result of shopifyResults) {
  const productsData = result?.data?.products;
  if (!productsData) {
    console.log(`⚠️ No products data found in Shopify response`);
    continue;
  }

  const productEdges = productsData.edges ?? [];
  console.log(`Processing ${productEdges.length} products from Shopify`);

  for (const productEdge of productEdges) {
    const product = productEdge.node;
    if (!product) continue;

    const productId = gidNum(product.id);
    const productTitle = product.title || 'Unknown';
    const handle = product.handle || '';

    const variantEdges = product.variants?.edges ?? [];

    for (const variantEdge of variantEdges) {
      const variant = variantEdge.node;
      if (!variant) continue;

      const variantId = gidNum(variant.id);
      const skuRaw = variant.sku ? String(variant.sku).trim() : '';
      const skuKey = normalizeSKU(skuRaw);

      if (!skuKey || !variantId) {
        console.log(`⚠️ Skipped variant: missing ${!skuKey ? 'SKU' : 'variant ID'}`);
        continue;
      }

      const entry = {
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
      };

      // Track duplicates
      const arr = duplicateIndex.get(skuKey) || [];
      arr.push(entry);
      duplicateIndex.set(skuKey, arr);

      // First one wins as primary
      if (!shopifySkuMap.has(skuKey)) {
        shopifySkuMap.set(skuKey, entry);
      } else {
        console.log(`⚠️ Duplicate SKU detected: "${skuKey}" (keeping first as primary)`);
      }

      totalShopifyVariants++;
    }
  }
}

console.log(`Shopify: ${totalShopifyVariants} variants → ${shopifySkuMap.size} unique SKUs`);

// 2) Get incoming products from "Split Images" node
let incomingProductsRaw = [];
try {
  const splitImagesItems = $('Split Images').all();
  incomingProductsRaw = splitImagesItems.map(item => item.json);
  console.log(`✅ Found ${incomingProductsRaw.length} products from Split Images`);
} catch (error) {
  console.log(`⚠️ Could not access Split Images: ${error.message}`);
  return [{
    json: {
      error: "Cannot access Split Images data",
      shopify_skus_found: totalShopifyVariants
    }
  }];
}

// 3) Deduplicate incoming products by SKU
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
    // Handle products without SKU
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
    console.log(`⚠️ Duplicate incoming SKU removed: "${skuKey}"`);
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

// 4) Process CREATE and UPDATE actions
const results = [];
let createCount = 0;
let updateCount = 0;
let noSkuCount = 0;
let conflictCount = 0;

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
  const duplicates = duplicateIndex.get(skuKey) || [];
  const hasConflict = duplicates.length > 1;
  
  if (match) {
    // UPDATE
    const conflictVariantIds = hasConflict ? duplicates.map(d => d.variant_id) : [];
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
        existing_compare_at_price: match.compare_at_price,
        sku_conflict_warning: hasConflict || undefined,
        sku_conflict_variants: hasConflict ? conflictVariantIds : undefined
      }
    });
    updateCount++;
    if (hasConflict) conflictCount++;
    console.log(`✅ UPDATE: SKU "${skuKey}" → variant ${match.variant_id}${hasConflict ? ' (CONFLICT)' : ''}`);
  } else {
    // CREATE
    results.push({
      json: {
        ...product,
        action: 'create'
      }
    });
    createCount++;
    console.log(`✅ CREATE: SKU "${skuKey}" not found in Shopify`);
  }
}

// 5) Process DEACTIVATE actions
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
    console.log(`✅ DEACTIVATE: SKU "${skuKey}" not in incoming data`);
  }
}

// 6) Summary
console.log(`\n=== RESULTS ===`);
console.log(`CREATE: ${createCount} (${noSkuCount} without SKU)`);
console.log(`UPDATE: ${updateCount}${conflictCount > 0 ? ` (${conflictCount} with conflicts)` : ''}`);
console.log(`DEACTIVATE: ${deactivateCount}`);
console.log(`TOTAL: ${results.length}`);

return results;

