const Product = require('../models/product.model');
const { parseQuery } = require('../utils/query-parser');
const rankingService = require('./ranking.service');

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
      inStock,
      useRanking = true  // Enable ranking by default
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
      filter['metadata.color'] = new RegExp(extractedFilters.color, 'i');
    }
    if (sortOptions.inStock) {
      filter.stock = { $gt: 0 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query - fetch more results for ranking
    let products;
    let total;
    const textScores = {};

    if (filter.$text) {
      // With text search - include text score
      const results = await Product.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .lean();
      
      // Collect text scores
      results.forEach(p => {
        textScores[p._id.toString()] = p.score || 0;
      });

      total = results.length;

      if (useRanking && !sortOptions.sortBy) {
        // Apply custom ranking
        const rankedProducts = await rankingService.rankProducts(results, textScores);
        products = rankedProducts.slice(skip, skip + limitNum);
      } else if (sortOptions.sortBy) {
        // Apply intent-based sorting
        results.sort((a, b) => {
          const aVal = a[sortOptions.sortBy] || 0;
          const bVal = b[sortOptions.sortBy] || 0;
          return sortOptions.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });
        products = results.slice(skip, skip + limitNum);
      } else {
        products = results.slice(skip, skip + limitNum);
      }
    } else {
      // Without text search
      const results = await Product.find(filter).lean();
      total = results.length;

      if (useRanking) {
        const rankedProducts = await rankingService.rankProducts(results, textScores);
        products = rankedProducts.slice(skip, skip + limitNum);
      } else {
        const sortBy = sortOptions.sortBy || 'rating';
        const sortOrder = sortOptions.sortOrder === 'asc' ? 1 : -1;
        results.sort((a, b) => {
          const aVal = a[sortBy] || 0;
          const bVal = b[sortBy] || 0;
          return sortOrder * (bVal - aVal);
        });
        products = results.slice(skip, skip + limitNum);
      }
    }

    const duration = Date.now() - startTime;

    // Log if slow query
    if (duration > 1000) {
      console.warn(`[SLOW SEARCH] Query "${rawQuery}" took ${duration}ms`);
    }

    // Format products for API response
    const formattedProducts = products.map(p => {
      const product = p.toAPIResponse ? p.toAPIResponse() : {
        ...p,
        productId: p._id,
        discountPercent: p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0,
        inStock: p.stock > 0
      };
      
      // Add ranking score if available
      if (p.rankingScore !== undefined) {
        product.rankingScore = p.rankingScore;
      }
      
      return product;
    });

    return {
      products: formattedProducts,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      meta: {
        originalQuery: parsed.originalQuery,
        processedQuery: parsed.processedQuery,
        corrections: corrections.length > 0 ? corrections : undefined,
        extractedFilters: Object.keys(extractedFilters).length > 0 ? extractedFilters : undefined,
        sortApplied: Object.keys(sortOptions).length > 0 ? sortOptions : undefined,
        rankingApplied: useRanking && !sortOptions.sortBy,
        responseTime: duration
      }
    };
  }
}

module.exports = new SearchService();
