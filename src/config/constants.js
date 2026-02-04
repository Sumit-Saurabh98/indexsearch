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
  
  // Ranking Weights
  RANKING_WEIGHTS: {
    textRelevance: 0.30,
    rating: 0.20,
    salesPopularity: 0.15,
    stockAvailability: 0.10,
    priceCompetitiveness: 0.10,
    recency: 0.05,
    returnRate: -0.05,      // penalty
    complaintsRate: -0.05   // penalty
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
