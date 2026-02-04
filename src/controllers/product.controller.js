const productService = require('../services/product.service');

// POST /api/v1/product - Create a new product
const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    
    res.status(201).json({
      success: true,
      data: {
        productId: product.productId
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/product/:id - Get product by ID
const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/products - Get all products with pagination
const getAllProducts = async (req, res, next) => {
  try {
    const result = await productService.getAllProducts(req.query);
    
    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/product/:id - Update product
const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/product/meta-data - Update product metadata
const updateMetadata = async (req, res, next) => {
  try {
    const { productId, Metadata } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'productId is required'
        }
      });
    }

    const product = await productService.updateMetadata(productId, Metadata || {});
    
    res.status(200).json({
      success: true,
      data: {
        productId: product.productId,
        Metadata: product.metadata
      }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/product/:id - Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/products/stats - Get product statistics
const getProductStats = async (req, res, next) => {
  try {
    const stats = await productService.getProductStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  updateMetadata,
  deleteProduct,
  getProductStats
};
