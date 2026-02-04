const Product = require('../models/product.model');
const { parseQuery } = require('../utils/query-parser');

class SearchService {
  
  async searchProducts(rawQuery, options = {}) {
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

    // Preprocess query
    const parsed = parseQuery(rawQuery);
    const { processedQuery, filters: extractedFilters, sortOptions, corrections } = parsed;

    // Build search filter
    const filter = {};

    // Text search if query provided
    if (processedQuery && processedQuery.trim()) {
      filter.$text = { $search: processedQuery.trim() };
    }

    // Apply explicit filters from query params
    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (minPrice !== undefined) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (maxPrice !== undefined) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    if (minRating !== undefined) filter.rating = { $gte: parseFloat(minRating) };
    if (inStock === 'true' || inStock === true) filter.stock = { $gt: 0 };

    // Apply extracted filters from query preprocessing
    if (extractedFilters.maxPrice && !maxPrice) {
      filter.price = { ...filter.price, $lte: extractedFilters.maxPrice };
    }
    if (extractedFilters.minPrice && !minPrice) {
      filter.price = { ...filter.price, $gte: extractedFilters.minPrice };
    }
    if (extractedFilters.color) {
      // Search in metadata for color
      filter['metadata.color'] = new RegExp(extractedFilters.color, 'i');
    }

    // Apply intent-based sorting
    if (sortOptions.inStock) {
      filter.stock = { $gt: 0 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query with appropriate sorting
    let searchQuery;
    
    if (filter.$text) {
      // With text search - include text score
      if (sortOptions.sortBy) {
        // Combine text score with intent-based sorting
        searchQuery = Product.find(filter, { score: { $meta: 'textScore' } })
          .sort({ 
            [sortOptions.sortBy]: sortOptions.sortOrder === 'asc' ? 1 : -1,
            score: { $meta: 'textScore' }
          });
      } else {
        // Pure text relevance sorting
        searchQuery = Product.find(filter, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } });
      }
    } else {
      // Without text search
      const sortBy = sortOptions.sortBy || 'rating';
      const sortOrder = sortOptions.sortOrder === 'asc' ? 1 : -1;
      searchQuery = Product.find(filter)
        .sort({ [sortBy]: sortOrder, salesCount: -1 });
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      searchQuery.skip(skip).limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    const duration = Date.now() - startTime;

    // Log if slow query
    if (duration > 1000) {
      console.warn(`[SLOW SEARCH] Query "${rawQuery}" took ${duration}ms`);
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
        originalQuery: parsed.originalQuery,
        processedQuery: parsed.processedQuery,
        corrections: corrections.length > 0 ? corrections : undefined,
        extractedFilters: Object.keys(extractedFilters).length > 0 ? extractedFilters : undefined,
        sortApplied: Object.keys(sortOptions).length > 0 ? sortOptions : undefined,
        responseTime: duration
      }
    };
  }
}

module.exports = new SearchService();
