const cheerio = require('cheerio');
const BaseScraper = require('./base.scraper');
const { parsePrice, parseRating, parseReviewCount, mapCategory, cleanString, extractBrand } = require('./utils');

class FlipkartScraper extends BaseScraper {
  constructor() {
    super('Flipkart', 'https://www.flipkart.com');
    
    this.categoryUrls = {
      'mobile-phones': '/search?q=smartphones&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off',
      'laptops': '/search?q=laptops&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off',
      'headphones': '/search?q=headphones&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off',
      'phone-accessories': '/search?q=mobile+accessories&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off',
      'tablets': '/search?q=tablets&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off'
    };
  }

  async scrapeCategory(category, maxPages = 3) {
    const products = [];
    const categoryUrl = this.categoryUrls[category];
    
    if (!categoryUrl) {
      console.log(`[Flipkart] Unknown category: ${category}`);
      return products;
    }

    for (let page = 1; page <= maxPages; page++) {
      try {
        const url = `${this.baseUrl}${categoryUrl}&page=${page}`;
        console.log(`[Flipkart] Fetching page ${page} for ${category}...`);
        
        const html = await this.fetchWithRetry(url);
        const pageProducts = this.parseProductList(html, category);
        
        if (pageProducts.length === 0) {
          console.log(`[Flipkart] No more products found on page ${page}`);
          break;
        }
        
        products.push(...pageProducts);
        console.log(`[Flipkart] Page ${page}: Found ${pageProducts.length} products`);
        
      } catch (error) {
        console.error(`[Flipkart] Error on page ${page}: ${error.message}`);
        break;
      }
    }

    return products;
  }

  parseProductList(html, category) {
    const $ = cheerio.load(html);
    const products = [];

    // Flipkart uses various selectors for product cards
    const productCards = $('div[data-id], div._1AtVbE, div._2kHMtA, div._4ddWXP');

    productCards.each((index, element) => {
      try {
        const $card = $(element);
        
        // Extract title
        const title = $card.find('div._4rR01T, a.s1Q9rs, div._2WkVRV').first().text().trim() ||
                     $card.find('a[title]').attr('title') ||
                     $card.find('div[class*="title"]').first().text().trim();

        if (!title) return;

        // Extract price
        const priceText = $card.find('div._30jeq3, div._1_WHN1').first().text();
        const price = parsePrice(priceText);

        // Extract MRP (crossed out price)
        const mrpText = $card.find('div._3I9_wc, div._27UcVY').first().text();
        const mrp = parsePrice(mrpText) || price;

        // Extract rating
        const ratingText = $card.find('div._3LWZlK, span._1lRcqv').first().text();
        const rating = parseRating(ratingText);

        // Extract review count
        const reviewText = $card.find('span._2_R_DZ, span._13vcmD').first().text();
        const reviewCount = parseReviewCount(reviewText);

        // Extract product URL
        let productUrl = $card.find('a[href*="/p/"]').first().attr('href') ||
                        $card.find('a').first().attr('href');
        if (productUrl && !productUrl.startsWith('http')) {
          productUrl = this.baseUrl + productUrl;
        }

        // Extract image
        const image = $card.find('img._396cs4, img._2r_T1I').first().attr('src') ||
                     $card.find('img').first().attr('src');

        // Only add if we have minimum required data
        if (title && price) {
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
      description: `${rawData.title} - Available on Flipkart`,
      price: rawData.price,
      mrp: rawData.mrp || rawData.price,
      currency: 'Rupee',
      stock: Math.floor(Math.random() * 500) + 10, // Simulated stock
      rating: rawData.rating || 0,
      reviewCount: rawData.reviewCount || 0,
      category: mapCategory(rawData.category),
      brand: extractBrand(rawData.title),
      metadata: {},
      salesCount: Math.floor(Math.random() * 10000), // Simulated sales
      returnRate: Math.random() * 10, // Simulated return rate
      complaintsCount: Math.floor(Math.random() * 50), // Simulated complaints
      source: 'flipkart',
      sourceUrl: rawData.productUrl || '',
      images: rawData.image ? [rawData.image] : []
    };
  }
}

module.exports = FlipkartScraper;
