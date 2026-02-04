// Ranking Service - Multi-factor product ranking algorithm

const { RANKING_WEIGHTS } = require('../config/constants');

class RankingService {
  constructor() {
    // Default weights (can be overridden)
    this.weights = RANKING_WEIGHTS || {
      textRelevance: 0.30,
      rating: 0.20,
      salesPopularity: 0.15,
      stockAvailability: 0.10,
      priceCompetitiveness: 0.10,
      recency: 0.05,
      returnRate: -0.05,      // penalty
      complaintsRate: -0.05   // penalty
    };

    // Stats for normalization (will be calculated dynamically)
    this.stats = null;
  }

  // Calculate stats for normalization
  async calculateStats(products) {
    if (products.length === 0) return null;

    const stats = {
      maxPrice: 0,
      minPrice: Infinity,
      maxSales: 0,
      maxReviews: 0,
      maxComplaints: 0,
      oldestDate: new Date(),
      newestDate: new Date(0)
    };

    for (const product of products) {
      stats.maxPrice = Math.max(stats.maxPrice, product.price || 0);
      stats.minPrice = Math.min(stats.minPrice, product.price || 0);
      stats.maxSales = Math.max(stats.maxSales, product.salesCount || 0);
      stats.maxReviews = Math.max(stats.maxReviews, product.reviewCount || 0);
      stats.maxComplaints = Math.max(stats.maxComplaints, product.complaintsCount || 0);
      
      const createdAt = new Date(product.createdAt);
      if (createdAt < stats.oldestDate) stats.oldestDate = createdAt;
      if (createdAt > stats.newestDate) stats.newestDate = createdAt;
    }

    // Prevent division by zero
    stats.priceRange = stats.maxPrice - stats.minPrice || 1;
    stats.dateRange = stats.newestDate - stats.oldestDate || 1;

    return stats;
  }

  // Normalize value to 0-1 range
  normalize(value, min, max) {
    if (max === min) return 0.5;
    return (value - min) / (max - min);
  }

  // Calculate individual factor scores
  calculateFactorScores(product, stats, textScore = 0) {
    const scores = {};

    // 1. Text Relevance Score (from MongoDB text search)
    // Text score typically ranges from 0-10+, normalize to 0-1
    scores.textRelevance = Math.min(textScore / 10, 1);

    // 2. Rating Score (already 0-5, normalize to 0-1)
    scores.rating = (product.rating || 0) / 5;

    // 3. Sales Popularity Score
    scores.salesPopularity = stats.maxSales > 0 
      ? (product.salesCount || 0) / stats.maxSales 
      : 0;

    // 4. Stock Availability Score
    // Higher score for in-stock items, penalize out of stock
    if (product.stock <= 0) {
      scores.stockAvailability = 0;
    } else if (product.stock < 10) {
      scores.stockAvailability = 0.5; // Low stock
    } else if (product.stock < 50) {
      scores.stockAvailability = 0.75; // Medium stock
    } else {
      scores.stockAvailability = 1; // Good stock
    }

    // 5. Price Competitiveness (lower price = higher score)
    // Inverse normalization - cheaper is better
    scores.priceCompetitiveness = stats.priceRange > 0
      ? 1 - this.normalize(product.price || 0, stats.minPrice, stats.maxPrice)
      : 0.5;

    // 6. Recency Score (newer = higher score)
    const productDate = new Date(product.createdAt);
    scores.recency = stats.dateRange > 0
      ? this.normalize(productDate.getTime(), stats.oldestDate.getTime(), stats.newestDate.getTime())
      : 0.5;

    // 7. Return Rate (penalty - higher return = lower score)
    // Return rate is 0-100%, invert and normalize
    scores.returnRate = 1 - Math.min((product.returnRate || 0) / 100, 1);

    // 8. Complaints Rate (penalty - more complaints = lower score)
    scores.complaintsRate = stats.maxComplaints > 0
      ? 1 - (product.complaintsCount || 0) / stats.maxComplaints
      : 1;

    return scores;
  }

  // Calculate final composite score
  calculateCompositeScore(factorScores) {
    let score = 0;

    for (const [factor, weight] of Object.entries(this.weights)) {
      const factorScore = factorScores[factor] || 0;
      
      if (weight < 0) {
        // Penalty factors: use (1 - score) to penalize bad values
        score += weight * (1 - factorScore);
      } else {
        score += weight * factorScore;
      }
    }

    // Normalize to 0-100 scale
    return Math.max(0, Math.min(100, score * 100));
  }

  // Rank products
  async rankProducts(products, textScores = {}) {
    if (!products || products.length === 0) {
      return [];
    }

    // Calculate stats for normalization
    const stats = await this.calculateStats(products);

    // Calculate scores for each product
    const rankedProducts = products.map(product => {
      const productId = product._id?.toString() || product.id;
      const textScore = textScores[productId] || product.score || 0;
      
      const factorScores = this.calculateFactorScores(product, stats, textScore);
      const compositeScore = this.calculateCompositeScore(factorScores);

      return {
        ...product,
        rankingScore: Math.round(compositeScore * 100) / 100,
        rankingFactors: factorScores
      };
    });

    // Sort by composite score (descending)
    rankedProducts.sort((a, b) => b.rankingScore - a.rankingScore);

    return rankedProducts;
  }

  // Rank products with simplified output (for API)
  async rankProductsForAPI(products, textScores = {}) {
    const ranked = await this.rankProducts(products, textScores);
    
    return ranked.map(p => ({
      ...p,
      // Remove internal ranking factors from response (optional)
      // rankingFactors: undefined
    }));
  }
}

module.exports = new RankingService();
