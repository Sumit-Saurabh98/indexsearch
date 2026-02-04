const Product = require('../models/product.model');

class SearchService {
  
  async searchProducts(query, options = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock
    } = options;

    const startTime = Date.now();

    // Build search filter
    const filter = {};

    // Text search if query provided
    if (query && query.trim()) {
      filter.$text = { $search: query.trim() };
    }

    // Apply filters
    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (minPrice !== undefined) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (maxPrice !== undefined) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    if (minRating !== undefined) filter.rating = { $gte: parseFloat(minRating) };
    if (inStock === 'true' || inStock === true) filter.stock = { $gt: 0 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query with text score for relevance sorting
    let searchQuery;
    
    if (filter.$text) {
      // With text search - include text score
      searchQuery = Product.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } });
    } else {
      // Without text search - sort by rating/popularity
      searchQuery = Product.find(filter)
        .sort({ rating: -1, salesCount: -1 });
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      searchQuery.skip(skip).limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    const duration = Date.now() - startTime;

    // Log if slow query
    if (duration > 1000) {
      console.warn(`[SLOW SEARCH] Query "${query}" took ${duration}ms`);
    }

    return {
      products: products.map(p => p.toAPIResponse()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      meta: {
        query,
        responseTime: duration,
        filters: { category, brand, minPrice, maxPrice, minRating, inStock }
      }
    };
  }
}

module.exports = new SearchService();
