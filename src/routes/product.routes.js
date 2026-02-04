const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  updateMetadata,
  deleteProduct,
  getProductStats
} = require('../controllers/product.controller');

// POST /api/v1/product - Create a new product
router.post('/', createProduct);

// PUT /api/v1/product/meta-data - Update product metadata
router.put('/meta-data', updateMetadata);

// GET /api/v1/products/stats - Get product statistics
router.get('/stats', getProductStats);

// GET /api/v1/product/:id - Get product by ID
router.get('/:id', getProduct);

// PATCH /api/v1/product/:id - Update product
router.patch('/:id', updateProduct);

// DELETE /api/v1/product/:id - Delete product
router.delete('/:id', deleteProduct);

module.exports = router;
