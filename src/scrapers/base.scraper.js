const axios = require('axios');

class BaseScraper {
  constructor(name, baseUrl) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.retryCount = 3;
    this.retryDelay = 1000;
    this.rateLimit = 500; // ms between requests
    this.lastRequestTime = 0;
  }

  // Rate limiting
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimit) {
      await this.delay(this.rateLimit - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
  }

  // Delay utility
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry with exponential backoff
  async fetchWithRetry(url, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        await this.waitForRateLimit();
        
        const response = await axios({
          url,
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            ...options.headers
          },
          ...options
        });
        
        return response.data;
      } catch (error) {
        lastError = error;
        console.log(`[${this.name}] Attempt ${attempt}/${this.retryCount} failed for ${url}: ${error.message}`);
        
        if (attempt < this.retryCount) {
          const backoffDelay = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`[${this.name}] Retrying in ${backoffDelay}ms...`);
          await this.delay(backoffDelay);
        }
      }
    }
    
    throw lastError;
  }

  // Abstract methods - to be implemented by subclasses
  async scrapeCategory(category) {
    throw new Error('scrapeCategory must be implemented');
  }

  async scrapeProduct(url) {
    throw new Error('scrapeProduct must be implemented');
  }

  // Transform scraped data to Product schema
  transformToProduct(rawData) {
    throw new Error('transformToProduct must be implemented');
  }

  // Scrape all categories
  async scrapeAll(categories) {
    const results = [];
    
    for (const category of categories) {
      console.log(`[${this.name}] Scraping category: ${category}`);
      
      try {
        const products = await this.scrapeCategory(category);
        results.push(...products);
        console.log(`[${this.name}] Found ${products.length} products in ${category}`);
      } catch (error) {
        console.error(`[${this.name}] Error scraping ${category}: ${error.message}`);
      }
    }
    
    return results;
  }
}

module.exports = BaseScraper;
