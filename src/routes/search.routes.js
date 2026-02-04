const express = require('express');
const router = express.Router();
const { searchProducts } = require('../controllers/search.controller');

/**
 * @swagger
 * /api/v1/search/product:
 *   get:
 *     summary: Search products
 *     description: Search products with intelligent ranking, Hinglish support, and spelling correction
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query (supports Hinglish like "sasta iPhone")
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [mobile-phones, laptops, headphones, phone-accessories, tablets]
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, rating, salesCount, createdAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results with ranking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     originalQuery:
 *                       type: string
 *                     processedQuery:
 *                       type: string
 *                     corrections:
 *                       type: array
 *                     rankingApplied:
 *                       type: boolean
 *                     responseTime:
 *                       type: number
 */
router.get('/product', searchProducts);

module.exports = router;
