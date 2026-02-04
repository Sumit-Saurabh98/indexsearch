// Simple In-Memory Cache for Search Results
// In production, use Redis for distributed caching

class CacheService {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 60000; // 60 seconds default
    this.maxSize = options.maxSize || 100;
    this.hits = 0;
    this.misses = 0;
  }

  // Generate cache key from query and options
  generateKey(query, options = {}) {
    const keyParts = [
      query || '',
      options.page || 1,
      options.limit || 20,
      options.category || '',
      options.brand || '',
      options.minPrice || '',
      options.maxPrice || '',
      options.minRating || '',
      options.inStock || '',
      options.sortBy || '',
      options.sortOrder || ''
    ];
    return keyParts.join('|');
  }

  // Get from cache
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return item.data;
  }

  // Set in cache
  set(key, data) {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.ttl
    });
  }

  // Clear entire cache
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  // Invalidate entries matching a pattern
  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 
        ? ((this.hits / (this.hits + this.misses)) * 100).toFixed(2) + '%' 
        : '0%'
    };
  }
}

// Export singleton instance
module.exports = new CacheService({
  ttl: 30000, // 30 second cache for search results
  maxSize: 200
});
