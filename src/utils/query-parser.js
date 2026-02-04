// Query Parser - Extracts intent, filters, and corrections from search queries

// Hinglish to English mappings
const hinglishMappings = {
  // Price-related
  'sasta': 'cheap budget affordable',
  'sastha': 'cheap budget affordable',
  'saste': 'cheap budget affordable',
  'mehenga': 'expensive premium',
  'mehnga': 'expensive premium',
  
  // Quality-related  
  'accha': 'good best quality',
  'acha': 'good best quality',
  'bekar': 'bad poor',
  'bekaar': 'bad poor',
  'maja': 'fun good',
  'mast': 'cool good awesome',
  
  // Size-related
  'bada': 'big large',
  'chota': 'small compact',
  'chhota': 'small compact',
  
  // Misc
  'naya': 'new latest',
  'purana': 'old',
  'wala': '',
  'waala': '',
  'ka': '',
  'ki': '',
  'ke': ''
};

// Common brand misspellings
const spellingCorrections = {
  // Apple
  'ifone': 'iphone',
  'iphone': 'iphone',
  'iphon': 'iphone',
  'ipone': 'iphone',
  'aiphone': 'iphone',
  'aifon': 'iphone',
  'appel': 'apple',
  'aple': 'apple',
  'macbok': 'macbook',
  'makbook': 'macbook',
  'airpod': 'airpods',
  
  // Samsung
  'sumsung': 'samsung',
  'samung': 'samsung',
  'samsang': 'samsung',
  'galxy': 'galaxy',
  'galaxi': 'galaxy',
  
  // Others
  'onplus': 'oneplus',
  'one+': 'oneplus',
  'redme': 'redmi',
  'realmi': 'realme',
  'xiomi': 'xiaomi',
  'xaomi': 'xiaomi',
  'lenova': 'lenovo',
  'asoos': 'asus',
  'acer': 'acer',
  'dell': 'dell',
  'hp': 'hp',
  'nokia': 'nokia',
  'jbl': 'jbl',
  'bose': 'bose',
  'sony': 'sony',
  'boat': 'boat',
  'boAt': 'boat',
  
  // Categories
  'fone': 'phone',
  'phon': 'phone',
  'labtop': 'laptop',
  'leptop': 'laptop',
  'hedphone': 'headphone',
  'headfone': 'headphone',
  'eirbuds': 'earbuds',
  'earbudd': 'earbuds'
};

// Intent keywords that affect sorting/filtering
const intentKeywords = {
  // Price intent
  cheap: { sortBy: 'price', sortOrder: 'asc' },
  budget: { sortBy: 'price', sortOrder: 'asc' },
  affordable: { sortBy: 'price', sortOrder: 'asc' },
  expensive: { sortBy: 'price', sortOrder: 'desc' },
  premium: { sortBy: 'price', sortOrder: 'desc' },
  
  // Rating intent
  best: { sortBy: 'rating', sortOrder: 'desc' },
  top: { sortBy: 'rating', sortOrder: 'desc' },
  rated: { sortBy: 'rating', sortOrder: 'desc' },
  popular: { sortBy: 'salesCount', sortOrder: 'desc' },
  trending: { sortBy: 'salesCount', sortOrder: 'desc' },
  
  // Recency intent
  latest: { sortBy: 'createdAt', sortOrder: 'desc' },
  new: { sortBy: 'createdAt', sortOrder: 'desc' },
  newest: { sortBy: 'createdAt', sortOrder: 'desc' },
  
  // Availability
  available: { inStock: true },
  stock: { inStock: true }
};

// Color keywords
const colorKeywords = ['black', 'white', 'silver', 'gold', 'blue', 'green', 'purple', 'red', 'pink', 'grey', 'gray', 'titanium', 'graphite'];

// Storage keywords
const storagePatterns = /(\d+)\s*(gb|tb)/gi;

// Price patterns
const pricePatterns = [
  /under\s*(\d+)k?\s*(rupees?|rs\.?|₹)?/gi,
  /below\s*(\d+)k?\s*(rupees?|rs\.?|₹)?/gi,
  /(\d+)k?\s*(rupees?|rs\.?|₹)/gi,
  /₹\s*(\d+)k?/gi
];

function parseQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return { 
      processedQuery: '', 
      originalQuery: rawQuery || '',
      filters: {},
      sortOptions: {},
      corrections: []
    };
  }

  const originalQuery = rawQuery.trim();
  let query = originalQuery.toLowerCase();
  const corrections = [];
  const filters = {};
  let sortOptions = {};

  // Step 1: Hinglish to English translation
  for (const [hindi, english] of Object.entries(hinglishMappings)) {
    const regex = new RegExp(`\\b${hindi}\\b`, 'gi');
    if (regex.test(query)) {
      query = query.replace(regex, english);
      corrections.push({ from: hindi, to: english, type: 'hinglish' });
    }
  }

  // Step 2: Spelling corrections
  const words = query.split(/\s+/);
  const correctedWords = words.map(word => {
    const cleaned = word.replace(/[^a-z0-9+]/gi, '');
    if (spellingCorrections[cleaned]) {
      corrections.push({ from: cleaned, to: spellingCorrections[cleaned], type: 'spelling' });
      return spellingCorrections[cleaned];
    }
    return word;
  });
  query = correctedWords.join(' ');

  // Step 3: Extract intent keywords
  for (const [keyword, options] of Object.entries(intentKeywords)) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(query)) {
      sortOptions = { ...sortOptions, ...options };
      // Remove intent keywords from search query
      query = query.replace(regex, '').trim();
    }
  }

  // Step 4: Extract color filters
  for (const color of colorKeywords) {
    const regex = new RegExp(`\\b${color}\\b`, 'gi');
    if (regex.test(query)) {
      filters.color = color;
      // Keep color in query for relevance
    }
  }

  // Step 5: Extract storage/RAM values
  let storageMatch;
  while ((storageMatch = storagePatterns.exec(query)) !== null) {
    const value = storageMatch[1];
    const unit = storageMatch[2].toLowerCase();
    filters.storage = `${value}${unit.toUpperCase()}`;
  }

  // Step 6: Extract price filters
  for (const pattern of pricePatterns) {
    const match = pattern.exec(query);
    if (match) {
      let price = parseInt(match[1]);
      // Handle "k" notation (50k = 50000)
      if (query.includes(`${match[1]}k`)) {
        price *= 1000;
      }
      
      if (/under|below/i.test(query)) {
        filters.maxPrice = price;
      } else {
        // Assume target price with +/- 20% range
        filters.minPrice = Math.floor(price * 0.8);
        filters.maxPrice = Math.ceil(price * 1.2);
      }
      break;
    }
  }

  // Clean up processed query
  let processedQuery = query
    .replace(/\s+/g, ' ')  // Multiple spaces to single
    .trim();

  return {
    originalQuery,
    processedQuery,
    filters,
    sortOptions,
    corrections
  };
}

module.exports = {
  parseQuery,
  hinglishMappings,
  spellingCorrections,
  intentKeywords
};
