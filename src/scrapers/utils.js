// Price parsing utilities
const parsePrice = (priceStr) => {
  if (!priceStr) return null;
  
  // Remove currency symbols and commas
  const cleaned = priceStr
    .replace(/[₹$,]/g, '')
    .replace(/\s/g, '')
    .trim();
  
  const price = parseFloat(cleaned);
  return isNaN(price) ? null : price;
};

// Rating parsing
const parseRating = (ratingStr) => {
  if (!ratingStr) return 0;
  
  const match = ratingStr.match(/(\d+\.?\d*)/);
  if (match) {
    const rating = parseFloat(match[1]);
    return Math.min(Math.max(rating, 0), 5);
  }
  return 0;
};

// Review count parsing
const parseReviewCount = (reviewStr) => {
  if (!reviewStr) return 0;
  
  const cleaned = reviewStr.replace(/,/g, '').toLowerCase();
  const match = cleaned.match(/(\d+)/);
  
  if (match) {
    let count = parseInt(match[1]);
    
    if (cleaned.includes('k')) count *= 1000;
    if (cleaned.includes('m')) count *= 1000000;
    
    return count;
  }
  return 0;
};

// Category mapping
const mapCategory = (sourceCategory) => {
  const categoryMap = {
    // Common Flipkart/Amazon categories
    'mobiles': 'mobile-phones',
    'mobile phones': 'mobile-phones',
    'smartphones': 'mobile-phones',
    'phones': 'mobile-phones',
    'laptops': 'laptops',
    'laptop': 'laptops',
    'notebooks': 'laptops',
    'headphones': 'headphones',
    'earphones': 'headphones',
    'earbuds': 'headphones',
    'headsets': 'headphones',
    'mobile accessories': 'phone-accessories',
    'phone cases': 'phone-accessories',
    'covers': 'phone-accessories',
    'chargers': 'phone-accessories',
    'tablets': 'tablets',
    'smartwatches': 'smartwatches',
    'smart watches': 'smartwatches',
    'cameras': 'cameras',
    'gaming': 'gaming',
    'speakers': 'audio',
    'audio': 'audio'
  };

  const normalized = (sourceCategory || '').toLowerCase().trim();
  return categoryMap[normalized] || 'other';
};

// Clean and limit string
const cleanString = (str, maxLength = 500) => {
  if (!str) return '';
  return str.trim().substring(0, maxLength);
};

// Extract brand from title
const extractBrand = (title) => {
  const brands = [
    'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Redmi', 'Realme', 'Vivo', 'Oppo',
    'Google', 'Pixel', 'Nothing', 'Motorola', 'Nokia', 'Sony', 'LG', 'Asus',
    'HP', 'Dell', 'Lenovo', 'Acer', 'MSI', 'Razer', 'JBL', 'Bose', 'Boat',
    'Noise', 'Amazfit', 'Fitbit', 'Garmin', 'Canon', 'Nikon', 'GoPro'
  ];

  const titleLower = (title || '').toLowerCase();
  
  for (const brand of brands) {
    if (titleLower.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  return null;
};

// Extract metadata from specifications
const parseSpecifications = (specs) => {
  const metadata = {};
  
  if (!specs || typeof specs !== 'object') return metadata;
  
  const keyMappings = {
    'ram': ['ram', 'memory', 'ram size'],
    'storage': ['storage', 'rom', 'internal storage', 'memory'],
    'screensize': ['screen size', 'display size', 'screen'],
    'display': ['display type', 'display'],
    'processor': ['processor', 'cpu', 'chipset'],
    'battery': ['battery', 'battery capacity'],
    'camera': ['camera', 'rear camera', 'primary camera'],
    'os': ['operating system', 'os'],
    'color': ['color', 'colour']
  };

  for (const [key, aliases] of Object.entries(keyMappings)) {
    for (const alias of aliases) {
      const specKey = Object.keys(specs).find(k => 
        k.toLowerCase().includes(alias.toLowerCase())
      );
      if (specKey && specs[specKey]) {
        metadata[key] = specs[specKey];
        break;
      }
    }
  }

  return metadata;
};

module.exports = {
  parsePrice,
  parseRating,
  parseReviewCount,
  mapCategory,
  cleanString,
  extractBrand,
  parseSpecifications
};
