const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  // Basic product information
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [500, 'Title cannot exceed 500 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  mrp: {
    type: Number,
    min: [0, 'MRP cannot be negative']
  },
  
  currency: {
    type: String,
    default: 'Rupee',
    enum: ['Rupee', 'INR', 'USD']
  },
  
  // Inventory
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  
  // Ratings & Reviews
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Category & Brand
  category: {
    type: String,
    trim: true,
    lowercase: true,
    enum: [
      'mobile-phones',
      'laptops',
      'headphones',
      'phone-accessories',
      'tablets',
      'smartwatches',
      'cameras',
      'gaming',
      'audio',
      'other'
    ],
    default: 'other'
  },
  
  brand: {
    type: String,
    trim: true
  },
  
  // Flexible metadata for product specifications
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Ranking factors
  salesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  returnRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  complaintsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Data source
  source: {
    type: String,
    enum: ['flipkart', 'amazon', 'manual', 'synthetic'],
    default: 'manual'
  },
  
  sourceUrl: {
    type: String,
    trim: true
  },
  
  // Images
  images: [{
    type: String,
    trim: true
  }]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// Indexes for Search & Performance
// ============================================

// Text index for full-text search
ProductSchema.index(
  { 
    title: 'text', 
    description: 'text', 
    brand: 'text' 
  },
  { 
    weights: { 
      title: 10, 
      brand: 5, 
      description: 1 
    },
    name: 'product_text_search'
  }
);

// Compound indexes for common queries
ProductSchema.index({ category: 1, rating: -1 });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ brand: 1, price: 1 });
ProductSchema.index({ brand: 1, rating: -1 });
ProductSchema.index({ rating: -1, salesCount: -1 });
ProductSchema.index({ price: 1, rating: -1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ source: 1 });
ProductSchema.index({ category: 1, brand: 1, price: 1 }); // Composite for filtered searches

// ============================================
// Virtual Fields
// ============================================

// Discount percentage
ProductSchema.virtual('discountPercent').get(function() {
  if (this.mrp && this.mrp > this.price) {
    return Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  return 0;
});

// In stock boolean
ProductSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// ============================================
// Instance Methods
// ============================================

// Convert metadata Map to plain object for API response
ProductSchema.methods.toAPIResponse = function() {
  const obj = this.toObject();
  
  // Convert Map to Object
  if (obj.metadata instanceof Map) {
    obj.metadata = Object.fromEntries(obj.metadata);
  }
  
  // Rename _id to productId for API consistency
  obj.productId = obj._id;
  delete obj._id;
  delete obj.__v;
  
  // Add Sellingprice alias for assignment compatibility (keeps price too)
  obj.Sellingprice = obj.price;
  
  return obj;
};

// ============================================
// Static Methods
// ============================================

// Search products by text query
ProductSchema.statics.searchByText = async function(query, options = {}) {
  const {
    limit = 20,
    skip = 0,
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    inStock
  } = options;

  const filter = {
    $text: { $search: query }
  };

  // Apply filters
  if (category) filter.category = category;
  if (brand) filter.brand = new RegExp(brand, 'i');
  if (minPrice !== undefined) filter.price = { ...filter.price, $gte: minPrice };
  if (maxPrice !== undefined) filter.price = { ...filter.price, $lte: maxPrice };
  if (minRating !== undefined) filter.rating = { $gte: minRating };
  if (inStock) filter.stock = { $gt: 0 };

  return this.find(filter, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit);
};

// Get products by category
ProductSchema.statics.getByCategory = async function(category, options = {}) {
  const { limit = 20, skip = 0, sortBy = 'rating', sortOrder = -1 } = options;
  
  return this.find({ category })
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
};

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
