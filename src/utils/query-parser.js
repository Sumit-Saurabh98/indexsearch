// Query Parser - Extracts intent, filters, and corrections from search queries

// Comprehensive Hinglish to English mappings (100+ terms)
const hinglishMappings = {
  // =============================================
  // PRICE-RELATED (15 terms)
  // =============================================
  'sasta': 'cheap budget affordable',
  'sastha': 'cheap budget affordable',
  'saste': 'cheap budget affordable',
  'sasti': 'cheap budget affordable',
  'mehenga': 'expensive premium',
  'mehnga': 'expensive premium',
  'mahenga': 'expensive premium',
  'kimat': 'price cost',
  'daam': 'price cost',
  'paisa': 'money value',
  'paise': 'money value',
  'rupiya': 'rupees price',
  'rupaye': 'rupees price',
  'muft': 'free',
  'offer': 'discount deal',

  // =============================================
  // QUALITY-RELATED (20 terms)
  // =============================================
  'accha': 'good best quality',
  'acha': 'good best quality',
  'achha': 'good best quality',
  'behtreen': 'best excellent',
  'behtareen': 'best excellent',
  'shandar': 'excellent amazing',
  'shaandaar': 'excellent amazing',
  'zabardast': 'awesome great',
  'jabardast': 'awesome great',
  'kamaal': 'amazing wonderful',
  'lajawaab': 'outstanding',
  'lajawab': 'outstanding',
  'bekar': 'bad poor',
  'bekaar': 'bad poor',
  'ghatiya': 'poor quality bad',
  'maja': 'fun good enjoyable',
  'mast': 'cool good awesome',
  'mazaa': 'fun enjoyable',
  'badhiya': 'excellent good',
  'sahi': 'correct good right',

  // =============================================
  // SIZE-RELATED (12 terms)
  // =============================================
  'bada': 'big large',
  'badi': 'big large',
  'bare': 'big large',
  'chota': 'small compact',
  'chhota': 'small compact',
  'choti': 'small compact',
  'chhoti': 'small compact',
  'lambi': 'long tall',
  'lamba': 'long tall',
  'patla': 'slim thin',
  'patli': 'slim thin',
  'halka': 'light lightweight',

  // =============================================
  // RECENCY & TIME (10 terms)
  // =============================================
  'naya': 'new latest',
  'nayi': 'new latest',
  'naye': 'new latest',
  'purana': 'old previous',
  'purani': 'old previous',
  'aaj': 'today new',
  'abhi': 'now current',
  'taaza': 'fresh new latest',
  'latest': 'new latest newest',
  'navin': 'new modern',

  // =============================================
  // SPEED & PERFORMANCE (10 terms)
  // =============================================
  'tez': 'fast quick',
  'tej': 'fast quick',
  'jaldi': 'quick fast',
  'speed': 'fast performance',
  'dhime': 'slow',
  'dheere': 'slow',
  'powerful': 'fast strong',
  'tagda': 'powerful strong',
  'tagdi': 'powerful strong',
  'dum': 'power performance',

  // =============================================
  // COLORS (Hindi) (12 terms)
  // =============================================
  'kala': 'black',
  'kaala': 'black',
  'safed': 'white',
  'laal': 'red',
  'neela': 'blue',
  'nila': 'blue',
  'hara': 'green',
  'peela': 'yellow',
  'gulabi': 'pink',
  'sona': 'gold golden',
  'chandi': 'silver',
  'narangi': 'orange',

  // =============================================
  // SHOPPING TERMS (15 terms)
  // =============================================
  'kharido': 'buy purchase',
  'kharidna': 'buy purchase',
  'lena': 'buy get',
  'lelo': 'buy get take',
  'mangao': 'order',
  'order': 'order buy',
  'delivery': 'shipping delivery',
  'bhejo': 'send deliver',
  'wapsi': 'return exchange',
  'badlo': 'exchange replace',
  'milega': 'available get',
  'chahiye': 'want need',
  'dikhao': 'show display',
  'dekho': 'see show',
  'batao': 'tell recommend',

  // =============================================
  // COMMON FILLER WORDS (10 terms)
  // =============================================
  'wala': '',
  'waala': '',
  'wali': '',
  'waali': '',
  'ka': '',
  'ki': '',
  'ke': '',
  'mein': '',
  'hai': '',
  'hain': '',

  // =============================================
  // COMPARISON (8 terms)
  // =============================================
  'behtar': 'better',
  'zyada': 'more',
  'jyada': 'more',
  'kam': 'less fewer',
  'sabse': 'most best',
  'kuch': 'some',
  'kaafi': 'enough sufficient',
  'bahut': 'very much'
};

// Common brand/product misspellings (expanded)
const spellingCorrections = {
  // =============================================
  // APPLE PRODUCTS
  // =============================================
  'ifone': 'iphone',
  'iphone': 'iphone',
  'iphon': 'iphone',
  'ipone': 'iphone',
  'aiphone': 'iphone',
  'aifon': 'iphone',
  'i phone': 'iphone',
  'appel': 'apple',
  'aple': 'apple',
  'apel': 'apple',
  'macbok': 'macbook',
  'makbook': 'macbook',
  'macbuk': 'macbook',
  'mac book': 'macbook',
  'airpod': 'airpods',
  'airpods': 'airpods',
  'air pod': 'airpods',
  'ipads': 'ipad',
  'i pad': 'ipad',

  // =============================================
  // SAMSUNG
  // =============================================
  'sumsung': 'samsung',
  'samung': 'samsung',
  'samsang': 'samsung',
  'samsong': 'samsung',
  'galxy': 'galaxy',
  'galaxi': 'galaxy',
  'galaksi': 'galaxy',
  'galaxy': 'galaxy',

  // =============================================
  // ONEPLUS
  // =============================================
  'onplus': 'oneplus',
  'oneplus': 'oneplus',
  'one+': 'oneplus',
  '1+': 'oneplus',
  'one plus': 'oneplus',
  'vanplus': 'oneplus',

  // =============================================
  // XIAOMI / REDMI
  // =============================================
  'redme': 'redmi',
  'redmi': 'redmi',
  'readmi': 'redmi',
  'radmi': 'redmi',
  'xiomi': 'xiaomi',
  'xaomi': 'xiaomi',
  'xiaomi': 'xiaomi',
  'shaomi': 'xiaomi',
  'mi': 'xiaomi',
  'poco': 'poco',
  'pocco': 'poco',

  // =============================================
  // REALME
  // =============================================
  'realmi': 'realme',
  'realme': 'realme',
  'relme': 'realme',
  'rialme': 'realme',
  'reelme': 'realme',

  // =============================================
  // OTHER BRANDS
  // =============================================
  'lenova': 'lenovo',
  'lenovo': 'lenovo',
  'lanova': 'lenovo',
  'asoos': 'asus',
  'asus': 'asus',
  'azus': 'asus',
  'acer': 'acer',
  'asar': 'acer',
  'dell': 'dell',
  'del': 'dell',
  'hp': 'hp',
  'hewlett': 'hp',
  'nokia': 'nokia',
  'nokya': 'nokia',
  'moto': 'motorola',
  'motorolla': 'motorola',
  'motorola': 'motorola',
  'vivo': 'vivo',
  'vivoo': 'vivo',
  'oppo': 'oppo',
  'opo': 'oppo',
  'huawei': 'huawei',
  'huwai': 'huawei',
  'google': 'google',
  'googel': 'google',
  'pixle': 'pixel',
  'pixel': 'pixel',
  'nothing': 'nothing',
  'nuthing': 'nothing',

  // =============================================
  // AUDIO BRANDS
  // =============================================
  'jbl': 'jbl',
  'jabeel': 'jbl',
  'bose': 'bose',
  'bos': 'bose',
  'sony': 'sony',
  'soni': 'sony',
  'boat': 'boat',
  'boAt': 'boat',
  'bote': 'boat',
  'skullcandy': 'skullcandy',
  'skulcandy': 'skullcandy',
  'sennheiser': 'sennheiser',
  'senheiser': 'sennheiser',
  'marshall': 'marshall',
  'marshal': 'marshall',

  // =============================================
  // PRODUCT CATEGORIES
  // =============================================
  'fone': 'phone',
  'phon': 'phone',
  'mobile': 'phone',
  'mobail': 'phone',
  'labtop': 'laptop',
  'leptop': 'laptop',
  'laptap': 'laptop',
  'notebook': 'laptop',
  'hedphone': 'headphone',
  'headfone': 'headphone',
  'headphones': 'headphone',
  'eirbuds': 'earbuds',
  'earbudd': 'earbuds',
  'earphone': 'earbuds',
  'airbuds': 'earbuds',
  'TWS': 'earbuds wireless',
  'chaarger': 'charger',
  'chargar': 'charger',
  'cabal': 'cable',
  'kabel': 'cable',
  'cover': 'case cover',
  'kawar': 'case cover',
  'screen gard': 'screen guard',
  'screengaurd': 'screen guard',
  'tampered': 'tempered',
  'temperd': 'tempered',
  'smartwach': 'smartwatch',
  'smart wach': 'smartwatch',
  'watch': 'watch smartwatch',
  'tabelt': 'tablet',
  'teblet': 'tablet'
};

// Intent keywords that affect sorting/filtering
const intentKeywords = {
  // Price intent
  cheap: { sortBy: 'price', sortOrder: 'asc' },
  budget: { sortBy: 'price', sortOrder: 'asc' },
  affordable: { sortBy: 'price', sortOrder: 'asc' },
  value: { sortBy: 'price', sortOrder: 'asc' },
  expensive: { sortBy: 'price', sortOrder: 'desc' },
  premium: { sortBy: 'price', sortOrder: 'desc' },
  luxury: { sortBy: 'price', sortOrder: 'desc' },
  
  // Rating intent
  best: { sortBy: 'rating', sortOrder: 'desc' },
  top: { sortBy: 'rating', sortOrder: 'desc' },
  rated: { sortBy: 'rating', sortOrder: 'desc' },
  excellent: { sortBy: 'rating', sortOrder: 'desc' },
  outstanding: { sortBy: 'rating', sortOrder: 'desc' },
  popular: { sortBy: 'salesCount', sortOrder: 'desc' },
  trending: { sortBy: 'salesCount', sortOrder: 'desc' },
  bestseller: { sortBy: 'salesCount', sortOrder: 'desc' },
  
  // Recency intent
  latest: { sortBy: 'createdAt', sortOrder: 'desc' },
  new: { sortBy: 'createdAt', sortOrder: 'desc' },
  newest: { sortBy: 'createdAt', sortOrder: 'desc' },
  recent: { sortBy: 'createdAt', sortOrder: 'desc' },
  fresh: { sortBy: 'createdAt', sortOrder: 'desc' },
  
  // Availability
  available: { inStock: true },
  stock: { inStock: true }
};

// Color keywords (English + transliterated Hindi)
const colorKeywords = [
  'black', 'white', 'silver', 'gold', 'blue', 'green', 'purple', 'red', 
  'pink', 'grey', 'gray', 'titanium', 'graphite', 'orange', 'yellow',
  'midnight', 'starlight', 'bronze', 'copper', 'rose'
];

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
