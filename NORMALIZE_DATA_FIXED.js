// ============================================================================
// FIXED NORMALIZE DATA NODE - Pure JavaScript (n8n Cloud Compatible)
// ============================================================================
// Transforms Apify car data to Shopify format
// Fixes: Mixed syntax, image handling, HTML escaping, validation
// ============================================================================

// ============ CONFIGURATION ============
const CONFIG = {
    VAT_RATE: 1.21,
    VENDOR: 'Autoworld',
    TEMPLATE_SUFFIX: 'produs_servicii_stoc',
    HP_TO_KW: 0.7354988,  // Precise conversion factor
    MAX_HANDLE_LENGTH: 255
};

// ============ UTILITY FUNCTIONS ============

/**
 * Convert text to URL-friendly slug with Romanian character support
 */
function slugify(text) {
    if (!text) return 'product';
    
    // Romanian character mapping
    const charMap = {
        'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
        'Ă': 'a', 'Â': 'a', 'Î': 'i', 'Ș': 's', 'Ț': 't'
    };
    
    let slug = String(text);
    
    // Replace Romanian characters
    Object.keys(charMap).forEach(char => {
        slug = slug.replace(new RegExp(char, 'g'), charMap[char]);
    });
    
    // Convert to lowercase and replace non-alphanumeric with dash
    slug = slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')  // Deduplicate dashes
        .replace(/^-+|-+$/g, '');  // Remove leading/trailing dashes
    
    // Truncate to max length
    if (slug.length > CONFIG.MAX_HANDLE_LENGTH) {
        slug = slug.substring(0, CONFIG.MAX_HANDLE_LENGTH).replace(/-[^-]*$/, '');
    }
    
    return slug || 'product';
}

/**
 * Safely escape HTML to prevent XSS injection
 */
function escapeHtml(text) {
    if (!text) return '';
    
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    
    return String(text).replace(/[&<>"']/g, char => htmlEscapes[char]);
}

/**
 * Safely get value from object with fallback
 */
function safeGet(obj, key, defaultValue = '') {
    const value = obj[key];
    return (value !== null && value !== undefined && value !== '') ? value : defaultValue;
}

/**
 * Extract first image URL from various formats
 */
function extractFirstImage(images) {
    if (!images) return '';
    
    // If it's already a string URL
    if (typeof images === 'string') {
        // Try to parse as JSON array
        if (images.startsWith('[')) {
            try {
                const parsed = JSON.parse(images);
                return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : images;
            } catch (e) {
                return images;
            }
        }
        return images;
    }
    
    // If it's an array
    if (Array.isArray(images)) {
        return images.length > 0 ? String(images[0]) : '';
    }
    
    // If it's an object with src/url
    if (typeof images === 'object') {
        return images.src || images.url || images.href || '';
    }
    
    return String(images);
}

/**
 * Calculate price without VAT
 */
function calculateNetPrice(grossPrice) {
    if (!grossPrice || grossPrice === '') return '';
    
    try {
        const gross = parseFloat(grossPrice);
        if (isNaN(gross)) return '';
        if (gross <= 0) return gross === 0 ? '0.00' : '';
        
        const net = gross / CONFIG.VAT_RATE;
        return net.toFixed(2);
    } catch (e) {
        console.log(`Error calculating net price: ${e.message}`);
        return '';
    }
}

/**
 * Format mileage with proper thousands separator
 */
function formatMileage(km) {
    if (!km && km !== 0) return '';
    
    try {
        const kmValue = parseFloat(km);
        if (isNaN(kmValue) || kmValue < 0) return '';
        
        // Use space as thousands separator (international standard)
        return Math.floor(kmValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    } catch (e) {
        return String(km);
    }
}

/**
 * Normalize drivetrain information
 */
function normalizeDrivetrain(drivetrain) {
    if (!drivetrain) return '';
    
    const dt = String(drivetrain).toLowerCase();
    
    if (/4x4|awd|quattro|4motion|xdrive|4matic|integral/.test(dt)) {
        return '4x4 (AWD)';
    }
    if (/fata|fwd|front/.test(dt)) {
        return '2x4 (FWD)';
    }
    if (/spate|rwd|rear|propulsie/.test(dt)) {
        return '4x2 (RWD)';
    }
    
    return drivetrain;
}

/**
 * Convert horsepower to kilowatts
 */
function convertPower(hp) {
    if (!hp) return null;
    
    try {
        const hpValue = parseFloat(hp);
        if (isNaN(hpValue) || hpValue <= 0) return null;
        
        return {
            kw: Math.round(hpValue * CONFIG.HP_TO_KW),
            cp: Math.round(hpValue)
        };
    } catch (e) {
        return null;
    }
}

// ============ MAIN TRANSFORMATION FUNCTION ============

/**
 * Transform a single car item from Autoworld format to Shopify format
 */
function transformItem(item) {
    const row = {};
    
    // ========== BASIC IDENTIFIERS ==========
    const title = safeGet(item, 'title') || 
                  `${safeGet(item, 'brand')} ${safeGet(item, 'model')}`.trim();
    const stockId = safeGet(item, 'stockId');
    const vin = safeGet(item, 'vin') || safeGet(item, 'VIN');
    const brand = safeGet(item, 'brand');
    const model = safeGet(item, 'model');
    const year = safeGet(item, 'year');
    
    // Title and handle
    row['Title'] = title || 'Untitled Product';
    const baseSlug = slugify(title);
    row['Handle'] = stockId ? `${baseSlug}-${stockId}` : baseSlug;
    
    // Variant SKU - prefer VIN, fallback to stockId
    row['Variant SKU'] = vin || stockId;
    row['Variant ID'] = '';
    
    // Vendor and dossier number
    row['Vendor'] = CONFIG.VENDOR;
    row['Metafield: custom.nr_dos_ [single_line_text_field]'] = stockId;
    
    // ========== PRICING ==========
    const grossPrice = safeGet(item, 'priceEur') || safeGet(item, 'price');
    row['Variant Price'] = grossPrice;
    row['Metafield: custom.pret_fara_tva [single_line_text_field]'] = calculateNetPrice(grossPrice);
    
    // ========== PRODUCT TYPE AND TAGS ==========
    const bodyType = safeGet(item, 'body');
    row['Type'] = bodyType;
    
    const tagValues = [
        brand, model, year,
        safeGet(item, 'fuel'),
        safeGet(item, 'transmission'),
        bodyType,
        safeGet(item, 'color')
    ].filter(v => v);
    
    row['Tags'] = tagValues.join(', ');
    
    // ========== PRIMARY IMAGE ==========
    row['Image Src'] = extractFirstImage(item.images);
    row['Image Alt Text'] = title;
    
    // ========== METAFIELDS ==========
    
    // Transmission
    row['Metafield: custom.cutie_viteze [single_line_text_field]'] = safeGet(item, 'transmission');
    
    // Model (first 2 words)
    const modelTokens = model.split(/\s+/).filter(Boolean);
    row['Metafield: custom.model [single_line_text_field]'] = 
        modelTokens.slice(0, 2).join(' ') || model;
    
    // Brand
    row['Metafield: custom.marca [single_line_text_field]'] = brand;
    
    // Power (HP and KW)
    const power = convertPower(safeGet(item, 'horsepower'));
    if (power) {
        row['Metafield: custom.putere_kw [single_line_text_field]'] = String(power.kw);
        row['Metafield: custom.putere_cp [single_line_text_field]'] = String(power.cp);
    } else {
        row['Metafield: custom.putere_kw [single_line_text_field]'] = '';
        row['Metafield: custom.putere_cp [single_line_text_field]'] = '';
    }
    
    // Drivetrain (normalized)
    const drivetrain = normalizeDrivetrain(safeGet(item, 'drivetrain'));
    row['Metafield: custom.transmisie [list.single_line_text_field]'] = drivetrain;
    
    // Other metafields
    row['Metafield: custom.tva [single_line_text_field]'] = safeGet(item, 'vatType');
    row['Metafield: custom.cilindree [single_line_text_field]'] = safeGet(item, 'displacementCc');
    row['Metafield: custom.culoare [single_line_text_field]'] = safeGet(item, 'color');
    row['Metafield: custom.km [single_line_text_field]'] = safeGet(item, 'mileageKm');
    row['Metafield: custom.data_livrarii [single_line_text_field]'] = year;
    row['Metafield: custom.body_type [single_line_text_field]'] = bodyType;
    row['Metafield: custom.fuel [single_line_text_field]'] = safeGet(item, 'fuel');
    
    // Features (dotări)
    const features = safeGet(item, 'features');
    row['Metafield: custom.dotari [multi_line_text_field]'] = features;
    row['Features'] = features;
    
    // ========== BUILD COMPREHENSIVE BODY HTML ==========
    const bodyHtmlParts = [];
    
    // Car overview (with HTML escaping)
    if (brand || model || year) {
        let overview = `<h3>${escapeHtml(brand)} ${escapeHtml(model)}`.trim();
        if (year) {
            overview += ` (${escapeHtml(year)})`;
        }
        overview += '</h3>';
        bodyHtmlParts.push(overview);
    }
    
    // Technical specifications
    const techSpecs = [];
    
    const fuel = safeGet(item, 'fuel');
    const transmission = safeGet(item, 'transmission');
    const color = safeGet(item, 'color');
    const displacement = safeGet(item, 'displacementCc');
    const horsepower = safeGet(item, 'horsepower');
    const mileage = safeGet(item, 'mileageKm');
    
    if (fuel) {
        techSpecs.push(`<li><strong>Combustibil:</strong> ${escapeHtml(fuel)}</li>`);
    }
    if (transmission) {
        techSpecs.push(`<li><strong>Transmisie:</strong> ${escapeHtml(transmission)}</li>`);
    }
    if (bodyType) {
        techSpecs.push(`<li><strong>Caroserie:</strong> ${escapeHtml(bodyType)}</li>`);
    }
    if (color) {
        techSpecs.push(`<li><strong>Culoare:</strong> ${escapeHtml(color)}</li>`);
    }
    if (displacement) {
        techSpecs.push(`<li><strong>Cilindree:</strong> ${escapeHtml(displacement)} cm³</li>`);
    }
    if (horsepower) {
        techSpecs.push(`<li><strong>Putere:</strong> ${escapeHtml(horsepower)} CP</li>`);
    }
    
    // Mileage with proper formatting
    if (mileage) {
        const kmFormatted = formatMileage(mileage);
        if (kmFormatted) {
            techSpecs.push(`<li><strong>Kilometraj:</strong> ${kmFormatted} km</li>`);
        }
    }
    
    // Drivetrain
    if (drivetrain) {
        techSpecs.push(`<li><strong>Tracțiune:</strong> ${escapeHtml(drivetrain)}</li>`);
    }
    
    if (techSpecs.length > 0) {
        bodyHtmlParts.push('<h4>Specificații Tehnice:</h4>');
        bodyHtmlParts.push(`<ul>${techSpecs.join('')}</ul>`);
    }
    
    // Features and equipment
    if (features) {
        bodyHtmlParts.push('<h4>Dotări și Opțiuni:</h4>');
        bodyHtmlParts.push(`<p>${escapeHtml(features)}</p>`);
    }
    
    // Additional information
    const additionalInfo = [];
    
    const vatType = safeGet(item, 'vatType');
    if (vatType) {
        additionalInfo.push(`<li><strong>TVA:</strong> ${escapeHtml(vatType)}</li>`);
    }
    if (vin) {
        additionalInfo.push(`<li><strong>VIN:</strong> ${escapeHtml(vin)}</li>`);
    }
    if (stockId) {
        additionalInfo.push(`<li><strong>Cod stoc:</strong> ${escapeHtml(stockId)}</li>`);
    }
    
    if (additionalInfo.length > 0) {
        bodyHtmlParts.push('<h4>Informații Adiționale:</h4>');
        bodyHtmlParts.push(`<ul>${additionalInfo.join('')}</ul>`);
    }
    
    // Contact information (static HTML - safe)
    bodyHtmlParts.push(`
    <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
        <p><strong>Pentru mai multe informații contactați Autoworld!</strong></p>
        <p>Toate vehiculele sunt verificate și pregătite pentru livrare.</p>
    </div>
    `);
    
    row['Body HTML'] = bodyHtmlParts.join('');
    
    return row;
}

// ============ N8N ENTRYPOINT ============

try {
    const output = [];
    let successCount = 0;
    let errorCount = 0;
    
    console.log(`=== NORMALIZE DATA (FIXED) ===`);
    console.log(`Processing ${items.length} items...`);
    
    for (let i = 0; i < items.length; i++) {
        try {
            const record = items[i].json || {};
            const transformed = transformItem(record);
            output.push({ json: transformed });
            successCount++;
        } catch (error) {
            console.log(`Error transforming item ${i + 1}: ${error.message}`);
            errorCount++;
            // Include error item for debugging
            output.push({ 
                json: { 
                    error: error.message,
                    error_index: i,
                    original_title: items[i].json?.title || 'Unknown'
                } 
            });
        }
    }
    
    console.log(`✅ Success: ${successCount} items`);
    if (errorCount > 0) {
        console.log(`⚠️  Errors: ${errorCount} items`);
    }
    console.log(`Total output: ${output.length} items`);
    
    return output;
    
} catch (fatalError) {
    console.log(`❌ FATAL ERROR: ${fatalError.message}`);
    return [{
        json: {
            fatal_error: fatalError.message,
            stack: fatalError.stack
        }
    }];
}

