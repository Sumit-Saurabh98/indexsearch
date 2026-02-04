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

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - price
 *       properties:
 *         title:
 *           type: string
 *           description: Product title
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           description: Selling price
 *         mrp:
 *           type: number
 *           description: Maximum retail price
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         stock:
 *           type: number
 *         category:
 *           type: string
 *           enum: [mobile-phones, laptops, headphones, phone-accessories, tablets, smartwatches, cameras, gaming, audio, other]
 *         brand:
 *           type: string
 *     ProductResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             productId:
 *               type: string
 */

/**
 * @swagger
 * /api/v1/product:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 */
router.post('/', createProduct);

/**
 * @swagger
 * /api/v1/product/meta-data:
 *   put:
 *     summary: Update product metadata
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - Metadata
 *             properties:
 *               productId:
 *                 type: string
 *               Metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Metadata updated successfully
 */
router.put('/meta-data', updateMetadata);

/**
 * @swagger
 * /api/v1/product/stats:
 *   get:
 *     summary: Get product statistics
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Product statistics
 */
router.get('/stats', getProductStats);

/**
 * @swagger
 * /api/v1/product/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProduct);

/**
 * @swagger
 * /api/v1/product/{id}:
 *   patch:
 *     summary: Update product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 */
router.patch('/:id', updateProduct);

/**
 * @swagger
 * /api/v1/product/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete('/:id', deleteProduct);

module.exports = router;
