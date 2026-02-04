/**
 * Main Routes Index
 * Aggregates all API routes
 */

const express = require('express');
const router = express.Router();

// Import route modules (to be created in Phase 4)
// const productRoutes = require('./product.routes');
// const searchRoutes = require('./search.routes');

// API Information
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'IndexSearch API',
      version: '1.0.0',
      description: 'E-commerce product search engine with intelligent ranking',
      endpoints: {
        health: 'GET /health',
        products: {
          create: 'POST /api/v1/product',
          getOne: 'GET /api/v1/product/:id',
          getAll: 'GET /api/v1/products',
          updateMeta: 'PUT /api/v1/product/meta-data',
          delete: 'DELETE /api/v1/product/:id'
        },
        search: {
          products: 'GET /api/v1/search/product?query=...'
        }
      }
    }
  });
});

// Mount route modules (will be uncommented in Phase 4)
// router.use('/product', productRoutes);
// router.use('/products', productRoutes);
// router.use('/search', searchRoutes);

module.exports = router;
