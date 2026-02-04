const Product = require('../models/product.model');
const { parseQuery } = require('../utils/query-parser');
const rankingService = require('./ranking.service');
const cache = require('../utils/cache');

// Projection for optimized queries - only fetch needed fields
const SEARCH_PROJECTION = {
  title: 1,
  description: 1,
  price: 1,
  mrp: 1,
  currency: 1,
  stock: 1,
  rating: 1,
  reviewCount: 1,
  category: 1,
  brand: 1,
  metadata: 1,
  salesCount: 1,
  returnRate: 1,
  complaintsCount: 1,
  source: 1,
  images: 1,
  createdAt: 1,
  updatedAt: 1
};

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
      sortBy,
      sortOrder = 'desc',
      useRanking = true,
      includeFacets = true
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
    if (sortOptions.inStock) {
      filter.stock = { $gt: 0 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Determine sort configuration
    const finalSortBy = sortBy || sortOptions.sortBy;
    const finalSortOrder = sortOrder || sortOptions.sortOrder || 'desc';
    const shouldRank = useRanking && !finalSortBy;

    // Execute main query
    let products;
    let total;
    const textScores = {};

    if (filter.$text) {
      const results = await Product.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .lean();
      
      results.forEach(p => {
        textScores[p._id.toString()] = p.score || 0;
      });

      total = results.length;

      if (shouldRank) {
        const rankedProducts = await rankingService.rankProducts(results, textScores);
        products = rankedProducts.slice(skip, skip + limitNum);
      } else if (finalSortBy) {
        results.sort((a, b) => {
          const aVal = a[finalSortBy] || 0;
          const bVal = b[finalSortBy] || 0;
          return finalSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });
        products = results.slice(skip, skip + limitNum);
      } else {
        products = results.slice(skip, skip + limitNum);
      }
    } else {
      const results = await Product.find(filter).lean();
      total = results.length;

      if (shouldRank) {
        const rankedProducts = await rankingService.rankProducts(results, textScores);
        products = rankedProducts.slice(skip, skip + limitNum);
      } else {
        const sortField = finalSortBy || 'rating';
        results.sort((a, b) => {
          const aVal = a[sortField] || 0;
          const bVal = b[sortField] || 0;
          return finalSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });
        products = results.slice(skip, skip + limitNum);
      }
    }

    // Get facets/aggregations if requested
    let facets = null;
    const shouldIncludeFacets = includeFacets === true || includeFacets === 'true' || includeFacets === undefined;
    if (shouldIncludeFacets) {
      facets = await this.getFacets(filter);
    }

    const duration = Date.now() - startTime;

    if (duration > 1000) {
      console.warn(`[SLOW SEARCH] Query "${rawQuery}" took ${duration}ms`);
    }

    // Format products for API response
    const formattedProducts = products.map(p => {
      const product = p.toAPIResponse ? p.toAPIResponse() : {
        ...p,
        productId: p._id,
        discountPercent: p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0,
        inStock: p.stock > 0,
        Sellingprice: p.price  // Assignment compatibility alias
      };
      
      // Ensure Sellingprice is always present
      if (!product.Sellingprice) {
        product.Sellingprice = product.price;
      }
      
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
      facets,
      meta: {
        originalQuery: parsed.originalQuery,
        processedQuery: parsed.processedQuery,
        corrections: corrections.length > 0 ? corrections : undefined,
        extractedFilters: Object.keys(extractedFilters).length > 0 ? extractedFilters : undefined,
        sortApplied: finalSortBy ? { sortBy: finalSortBy, sortOrder: finalSortOrder } : undefined,
        rankingApplied: shouldRank,
        responseTime: duration
      }
    };
  }

  // Get aggregations for faceted search
  async getFacets(baseFilter = {}) {
    try {
      // Remove text search from facet queries
      const facetFilter = { ...baseFilter };
      delete facetFilter.$text;

      const [categories, brands] = await Promise.all([
        // Category facets
        Product.aggregate([
          { $match: facetFilter },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        
        // Brand facets
        Product.aggregate([
          { $match: facetFilter },
          { $group: { _id: '$brand', count: { $sum: 1 } } },
          { $match: { _id: { $ne: null } } },
          { $sort: { count: -1 } },
          { $limit: 15 }
        ])
      ]);

      // Get price stats
      const priceStats = await Product.aggregate([
        { $match: facetFilter },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            avgPrice: { $avg: '$price' }
          }
        }
      ]);

      // Get rating distribution
      const ratingDist = await Product.aggregate([
        { $match: facetFilter },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $gte: ['$rating', 4.5] }, then: '4.5+' },
                  { case: { $gte: ['$rating', 4.0] }, then: '4.0+' },
                  { case: { $gte: ['$rating', 3.5] }, then: '3.5+' },
                  { case: { $gte: ['$rating', 3.0] }, then: '3.0+' }
                ],
                default: 'Below 3.0'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ]);

      return {
        categories: categories.map(c => ({ name: c._id, count: c.count })),
        brands: brands.map(b => ({ name: b._id, count: b.count })),
        priceStats: priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
        ratings: ratingDist.map(r => ({ rating: r._id, count: r.count }))
      };
    } catch (error) {
      console.error('Facets aggregation error:', error.message);
      return null;
    }
  }

  formatPriceRange(boundary) {
    const ranges = {
      0: 'Under ₹5,000',
      5000: '₹5,000 - ₹10,000',
      10000: '₹10,000 - ₹25,000',
      25000: '₹25,000 - ₹50,000',
      50000: '₹50,000 - ₹1,00,000',
      100000: '₹1,00,000 - ₹2,00,000',
      200000: 'Above ₹2,00,000'
    };
    return ranges[boundary] || 'Other';
  }
}

module.exports = new SearchService();
