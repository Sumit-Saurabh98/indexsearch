const Product = require('../models/product.model');
const { AppError } = require('../middleware/error.middleware');

class ProductService {
  
  async createProduct(productData) {
    const product = new Product(productData);
    await product.save();
    return product.toAPIResponse();
  }

  async getProductById(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError(`Product with ID ${productId} not found`, 404, 'PRODUCT_NOT_FOUND');
    }
    return product.toAPIResponse();
  }

  async getAllProducts(options = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (minPrice !== undefined) filter.price = { ...filter.price, $gte: minPrice };
    if (maxPrice !== undefined) filter.price = { ...filter.price, $lte: maxPrice };
    if (minRating !== undefined) filter.rating = { $gte: minRating };
    if (inStock === 'true' || inStock === true) filter.stock = { $gt: 0 };

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    return {
      products: products.map(p => p.toAPIResponse()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateProduct(productId, updateData) {
    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError(`Product with ID ${productId} not found`, 404, 'PRODUCT_NOT_FOUND');
    }

    return product.toAPIResponse();
  }

  async updateMetadata(productId, metadata) {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError(`Product with ID ${productId} not found`, 404, 'PRODUCT_NOT_FOUND');
    }

    // Merge new metadata with existing
    for (const [key, value] of Object.entries(metadata)) {
      product.metadata.set(key, value);
    }

    await product.save();
    return product.toAPIResponse();
  }

  async deleteProduct(productId) {
    const product = await Product.findByIdAndDelete(productId);
    
    if (!product) {
      throw new AppError(`Product with ID ${productId} not found`, 404, 'PRODUCT_NOT_FOUND');
    }

    return { deleted: true, productId };
  }

  async getProductStats() {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$rating' },
          totalStock: { $sum: '$stock' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const total = await Product.countDocuments();

    return { total, byCategory: stats };
  }
}

module.exports = new ProductService();
