const express = require('express');
const router = express.Router();

// Import route modules
const productRoutes = require('./product.routes');
const productsRoutes = require('./products.routes');

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
          update: 'PATCH /api/v1/product/:id',
          delete: 'DELETE /api/v1/product/:id',
          stats: 'GET /api/v1/product/stats'
        },
        search: {
          products: 'GET /api/v1/search/product?query=...'
        }
      }
    }
  });
});

// Mount route modules
router.use('/product', productRoutes);
router.use('/products', productsRoutes);

module.exports = router;
