const searchService = require('../services/search.service');

// GET /api/v1/search/product - Search products
const searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    const result = await searchService.searchProducts(query, req.query);
    
    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchProducts
};
