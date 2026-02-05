/**
 * Application Constants
 */

module.exports = {
  // API Configuration
  API_VERSION: 'v1',
  API_PREFIX: '/api/v1',
  
  // Pagination Defaults
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  
  // Search Configuration
  MAX_SEARCH_RESULTS: 50,
  SEARCH_LATENCY_THRESHOLD_MS: 1000,
  
  // Ranking Weights (must sum to ~1.0)
  RANKING_WEIGHTS: {
    textRelevance: 0.50,         // Increased - most important
    rating: 0.20,                // User ratings
    salesPopularity: 0.10,       // Sales count
    stockAvailability: 0.05,     // In-stock priority
    priceCompetitiveness: 0.05,  // Lower price = higher
    recency: 0.05,               // Newer products
    returnRate: -0.025,          // penalty
    complaintsRate: -0.025       // penalty
  },
  
  // Product Categories
  CATEGORIES: [
    'mobile-phones',
    'laptops',
    'headphones',
    'phone-accessories',
    'tablets',
    'smartwatches',
    'cameras',
    'gaming',
    'audio',
    'other'
  ],
  
  // Supported Currencies
  CURRENCIES: ['Rupee', 'INR', 'USD'],
  
  // Data Sources
  SOURCES: ['flipkart', 'amazon', 'manual', 'synthetic']
};
