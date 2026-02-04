const express = require('express');
const router = express.Router();
const { searchProducts } = require('../controllers/search.controller');

// GET /api/v1/search/product - Search products
router.get('/product', searchProducts);

module.exports = router;
