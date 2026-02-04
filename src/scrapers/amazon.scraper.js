const cheerio = require('cheerio');
const BaseScraper = require('./base.scraper');
const { parsePrice, parseRating, parseReviewCount, mapCategory, cleanString, extractBrand } = require('./utils');

class AmazonScraper extends BaseScraper {
  constructor() {
    super('Amazon', 'https://www.amazon.in');
    
    this.categoryUrls = {
      'mobile-phones': '/s?k=smartphones&ref=nb_sb_noss',
      'laptops': '/s?k=laptops&ref=nb_sb_noss',
      'headphones': '/s?k=headphones&ref=nb_sb_noss',
      'phone-accessories': '/s?k=mobile+accessories&ref=nb_sb_noss',
      'tablets': '/s?k=tablets&ref=nb_sb_noss'
    };
  }

  async scrapeCategory(category, maxPages = 2) {
    const products = [];
    const categoryUrl = this.categoryUrls[category];
    
    if (!categoryUrl) {
      console.log(`[Amazon] Unknown category: ${category}`);
      return products;
    }

    for (let page = 1; page <= maxPages; page++) {
      try {
        const url = `${this.baseUrl}${categoryUrl}&page=${page}`;
        console.log(`[Amazon] Fetching page ${page} for ${category}...`);
        
        const html = await this.fetchWithRetry(url);
        const pageProducts = this.parseProductList(html, category);
        
        if (pageProducts.length === 0) {
          console.log(`[Amazon] No products found - possible anti-bot protection`);
          break;
        }
        
        products.push(...pageProducts);
        console.log(`[Amazon] Page ${page}: Found ${pageProducts.length} products`);
        
      } catch (error) {
        console.error(`[Amazon] Error on page ${page}: ${error.message}`);
        console.log(`[Amazon] Note: Amazon has anti-bot measures. Consider using synthetic data.`);
        break;
      }
    }

    return products;
  }

  parseProductList(html, category) {
    const $ = cheerio.load(html);
    const products = [];

    // Amazon product cards
    const productCards = $('div[data-component-type="s-search-result"]');

    productCards.each((index, element) => {
      try {
        const $card = $(element);
        
        // Extract title
        const title = $card.find('h2 a span, h2 span.a-text-normal').first().text().trim();
        if (!title) return;

        // Extract price
        const priceWhole = $card.find('span.a-price-whole').first().text().replace(/,/g, '');
        const priceFraction = $card.find('span.a-price-fraction').first().text();
        const price = parseFloat(priceWhole + '.' + (priceFraction || '00'));

        // Extract MRP
        const mrpText = $card.find('span.a-price.a-text-price span.a-offscreen').first().text();
        const mrp = parsePrice(mrpText) || price;

        // Extract rating
        const ratingText = $card.find('span.a-icon-alt').first().text();
        const rating = parseRating(ratingText);

        // Extract review count
        const reviewText = $card.find('span.a-size-base.s-underline-text').first().text();
        const reviewCount = parseReviewCount(reviewText);

        // Extract product URL
        let productUrl = $card.find('h2 a').first().attr('href');
        if (productUrl && !productUrl.startsWith('http')) {
          productUrl = this.baseUrl + productUrl;
        }

        // Extract image
        const image = $card.find('img.s-image').first().attr('src');

        if (title && price && !isNaN(price)) {
          products.push(this.transformToProduct({
            title,
            price,
            mrp,
            rating,
            reviewCount,
            productUrl,
            image,
            category
          }));
        }
      } catch (error) {
        // Skip malformed product cards
      }
    });

    return products;
  }

  transformToProduct(rawData) {
    return {
      title: cleanString(rawData.title, 500),
      description: `${rawData.title} - Available on Amazon`,
      price: rawData.price,
      mrp: rawData.mrp || rawData.price,
      currency: 'Rupee',
      stock: Math.floor(Math.random() * 500) + 10,
      rating: rawData.rating || 0,
      reviewCount: rawData.reviewCount || 0,
      category: mapCategory(rawData.category),
      brand: extractBrand(rawData.title),
      metadata: {},
      salesCount: Math.floor(Math.random() * 10000),
      returnRate: Math.random() * 10,
      complaintsCount: Math.floor(Math.random() * 50),
      source: 'amazon',
      sourceUrl: rawData.productUrl || '',
      images: rawData.image ? [rawData.image] : []
    };
  }
}

module.exports = AmazonScraper;
