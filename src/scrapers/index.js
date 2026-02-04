require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/database');
const Product = require('../models/product.model');
const FlipkartScraper = require('./flipkart.scraper');
const AmazonScraper = require('./amazon.scraper');
const { generateProducts } = require('./synthetic.generator');

const CATEGORIES = ['mobile-phones', 'laptops', 'headphones', 'phone-accessories', 'tablets'];

async function scrapeFlipkart() {
  console.log('\n📦 Starting Flipkart Scraper...');
  const scraper = new FlipkartScraper();
  return await scraper.scrapeAll(CATEGORIES);
}

async function scrapeAmazon() {
  console.log('\n📦 Starting Amazon Scraper...');
  const scraper = new AmazonScraper();
  return await scraper.scrapeAll(CATEGORIES);
}

async function generateSyntheticData(count = 1000) {
  console.log(`\n🔧 Generating ${count} synthetic products...`);
  return await generateProducts(count);
}

async function ingestProducts(products) {
  console.log(`\n💾 Ingesting ${products.length} products into database...`);
  
  let inserted = 0;
  let duplicates = 0;
  let errors = 0;
  const batchSize = 100;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    try {
      // Use insertMany with ordered: false to continue on duplicates
      const result = await Product.insertMany(batch, { ordered: false });
      inserted += result.length;
    } catch (error) {
      if (error.code === 11000) {
        // Handle duplicate key errors
        duplicates += error.writeErrors?.length || 1;
        inserted += (batch.length - (error.writeErrors?.length || 1));
      } else {
        console.error(`Batch error: ${error.message}`);
        errors += batch.length;
      }
    }
    
    // Progress indicator
    const progress = Math.min(100, Math.round(((i + batch.length) / products.length) * 100));
    process.stdout.write(`\r   Progress: ${progress}% (${inserted} inserted, ${duplicates} duplicates, ${errors} errors)`);
  }
  
  console.log('\n');
  return { inserted, duplicates, errors };
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing products...');
  const result = await Product.deleteMany({});
  console.log(`   Deleted ${result.deletedCount} products`);
}

async function run(options = {}) {
  const { 
    useSynthetic = true, 
    useFlipkart = false, 
    useAmazon = false,
    productCount = 1200,
    clearFirst = true 
  } = options;

  console.log('\n═══════════════════════════════════════════');
  console.log('        IndexSearch Data Ingestion');
  console.log('═══════════════════════════════════════════\n');

  try {
    // Connect to database
    await connectDB();

    // Clear existing data if requested
    if (clearFirst) {
      await clearDatabase();
    }

    let allProducts = [];

    // Try web scraping first
    if (useFlipkart) {
      try {
        const flipkartProducts = await scrapeFlipkart();
        allProducts.push(...flipkartProducts);
      } catch (error) {
        console.error('Flipkart scraping failed:', error.message);
      }
    }

    if (useAmazon) {
      try {
        const amazonProducts = await scrapeAmazon();
        allProducts.push(...amazonProducts);
      } catch (error) {
        console.error('Amazon scraping failed:', error.message);
      }
    }

    // Fall back to synthetic data if needed
    if (useSynthetic || allProducts.length < 100) {
      const needed = Math.max(productCount - allProducts.length, 0);
      if (needed > 0) {
        console.log(`\n📊 Web scraping yielded ${allProducts.length} products.`);
        console.log(`   Generating ${needed} synthetic products as supplement...`);
        const syntheticProducts = await generateSyntheticData(needed);
        allProducts.push(...syntheticProducts);
      }
    }

    // Ingest products
    const result = await ingestProducts(allProducts);

    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('               Summary');
    console.log('═══════════════════════════════════════════');
    console.log(`   ✅ Products inserted: ${result.inserted}`);
    console.log(`   ⚠️  Duplicates skipped: ${result.duplicates}`);
    console.log(`   ❌ Errors: ${result.errors}`);
    
    // Get final count
    const totalCount = await Product.countDocuments();
    console.log(`   📊 Total products in database: ${totalCount}`);
    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Ingestion failed:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const options = {
    useSynthetic: !args.includes('--no-synthetic'),
    useFlipkart: args.includes('--flipkart'),
    useAmazon: args.includes('--amazon'),
    productCount: parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1]) || 1200,
    clearFirst: !args.includes('--no-clear')
  };

  run(options);
}

module.exports = { run, scrapeFlipkart, scrapeAmazon, generateSyntheticData, ingestProducts };
