const express = require('express');
const router = express.Router();
const { getAllProducts } = require('../controllers/product.controller');

// GET /api/v1/products - Get all products with pagination
router.get('/', getAllProducts);

module.exports = router;
