// Synthetic Data Generator
// Generates realistic product data for development/testing

const productTemplates = {
  'mobile-phones': [
    { brand: 'Apple', models: ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14', 'iPhone 13'], priceRange: [49999, 179999] },
    { brand: 'Samsung', models: ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 FE', 'Galaxy A55', 'Galaxy A35', 'Galaxy M55'], priceRange: [19999, 149999] },
    { brand: 'OnePlus', models: ['OnePlus 12', 'OnePlus 12R', 'OnePlus Nord 4', 'OnePlus Nord CE 4', 'OnePlus Open'], priceRange: [24999, 164999] },
    { brand: 'Xiaomi', models: ['Xiaomi 14', 'Xiaomi 14 Ultra', 'Xiaomi 13T Pro', 'Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi 13C'], priceRange: [9999, 69999] },
    { brand: 'Realme', models: ['Realme GT 6', 'Realme 12 Pro+', 'Realme 12 Pro', 'Realme Narzo 70 Pro', 'Realme C67'], priceRange: [8999, 45999] },
    { brand: 'Vivo', models: ['Vivo X100 Pro', 'Vivo X100', 'Vivo V30 Pro', 'Vivo V30', 'Vivo T3x'], priceRange: [12999, 89999] },
    { brand: 'Google', models: ['Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 9', 'Pixel 8a', 'Pixel 8'], priceRange: [52999, 119999] },
    { brand: 'Nothing', models: ['Nothing Phone 2a Plus', 'Nothing Phone 2a', 'Nothing Phone 2'], priceRange: [23999, 49999] }
  ],
  'laptops': [
    { brand: 'Apple', models: ['MacBook Pro 16 M3 Max', 'MacBook Pro 14 M3 Pro', 'MacBook Air 15 M3', 'MacBook Air 13 M3'], priceRange: [99999, 399999] },
    { brand: 'Dell', models: ['XPS 15', 'XPS 13 Plus', 'Inspiron 16', 'Inspiron 15', 'Latitude 7440'], priceRange: [54999, 189999] },
    { brand: 'HP', models: ['Spectre x360', 'Envy 16', 'Pavilion 15', 'Victus Gaming', 'Omen 17'], priceRange: [49999, 179999] },
    { brand: 'Lenovo', models: ['ThinkPad X1 Carbon', 'IdeaPad Slim 5', 'Legion Pro 7i', 'Yoga 9i', 'LOQ Gaming'], priceRange: [44999, 249999] },
    { brand: 'Asus', models: ['ROG Strix G16', 'ZenBook 14 OLED', 'TUF Gaming A15', 'VivoBook 15'], priceRange: [39999, 199999] },
    { brand: 'Acer', models: ['Predator Helios 18', 'Swift Go 14', 'Nitro V', 'Aspire 5'], priceRange: [34999, 169999] }
  ],
  'headphones': [
    { brand: 'Sony', models: ['WH-1000XM5', 'WF-1000XM5', 'WH-CH720N', 'LinkBuds S'], priceRange: [4999, 34999] },
    { brand: 'Apple', models: ['AirPods Pro 2', 'AirPods Max', 'AirPods 3rd Gen', 'Beats Studio Pro'], priceRange: [14999, 59999] },
    { brand: 'Samsung', models: ['Galaxy Buds3 Pro', 'Galaxy Buds3', 'Galaxy Buds FE', 'Galaxy Buds2 Pro'], priceRange: [7999, 19999] },
    { brand: 'JBL', models: ['Tour One M2', 'Tune 770NC', 'Live Pro 2', 'Wave Beam', 'Tune 520BT'], priceRange: [2499, 24999] },
    { brand: 'Boat', models: ['Airdopes 500 ANC', 'Rockerz 550', 'Airdopes 441 Pro', 'Stone 1400'], priceRange: [999, 4999] },
    { brand: 'Bose', models: ['QuietComfort Ultra', 'QuietComfort Earbuds II', 'SoundLink Flex'], priceRange: [12999, 39999] }
  ],
  'phone-accessories': [
    { brand: 'Apple', models: ['MagSafe Charger', 'MagSafe Battery Pack', 'USB-C Adapter', 'Lightning Cable'], priceRange: [999, 9999] },
    { brand: 'Samsung', models: ['25W Fast Charger', 'Wireless Charger Duo', 'Galaxy Watch Charger'], priceRange: [799, 5999] },
    { brand: 'Anker', models: ['PowerCore 20000', 'Nano Pro', '735 Charger', 'USB-C Hub'], priceRange: [999, 7999] },
    { brand: 'Spigen', models: ['Ultra Hybrid Case', 'Tough Armor Case', 'Tempered Glass'], priceRange: [499, 2999] },
    { brand: 'Boat', models: ['Energyshroom PB300', 'Rockerz 450 Pro'], priceRange: [699, 2499] }
  ],
  'tablets': [
    { brand: 'Apple', models: ['iPad Pro 13 M4', 'iPad Pro 11 M4', 'iPad Air 13 M2', 'iPad 10th Gen', 'iPad mini 6'], priceRange: [39999, 179999] },
    { brand: 'Samsung', models: ['Galaxy Tab S9 Ultra', 'Galaxy Tab S9+', 'Galaxy Tab S9', 'Galaxy Tab A9+'], priceRange: [19999, 129999] },
    { brand: 'Xiaomi', models: ['Pad 6', 'Redmi Pad SE', 'Redmi Pad'], priceRange: [12999, 29999] },
    { brand: 'OnePlus', models: ['Pad 2', 'Pad'], priceRange: [29999, 49999] }
  ]
};

const colors = ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Green', 'Purple', 'Red', 'Graphite', 'Titanium'];
const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const ramOptions = ['4GB', '6GB', '8GB', '12GB', '16GB', '32GB'];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateProduct(category) {
  const templates = productTemplates[category];
  if (!templates) return null;

  const template = randomChoice(templates);
  const model = randomChoice(template.models);
  const color = randomChoice(colors);
  const storage = randomChoice(storageOptions);
  const ram = randomChoice(ramOptions);

  const basePrice = randomInt(template.priceRange[0], template.priceRange[1]);
  const discount = randomInt(0, 25);
  const mrp = Math.round(basePrice * (1 + discount / 100));

  const title = category === 'phone-accessories' 
    ? `${template.brand} ${model}`
    : `${template.brand} ${model} (${color}, ${storage})`;

  return {
    title,
    description: generateDescription(template.brand, model, category),
    price: basePrice,
    mrp: mrp,
    currency: 'Rupee',
    stock: randomInt(0, 500),
    rating: randomFloat(3.0, 5.0, 1),
    reviewCount: randomInt(10, 50000),
    category,
    brand: template.brand,
    metadata: generateMetadata(category, storage, ram, color),
    salesCount: randomInt(100, 100000),
    returnRate: randomFloat(0, 15, 1),
    complaintsCount: randomInt(0, 200),
    source: 'synthetic',
    sourceUrl: '',
    images: []
  };
}

function generateDescription(brand, model, category) {
  const descriptions = {
    'mobile-phones': `${brand} ${model} - Experience the latest in mobile technology with stunning display, powerful processor, and advanced camera system. Perfect for photography, gaming, and everyday use.`,
    'laptops': `${brand} ${model} - High-performance laptop designed for professionals and creators. Features stunning display, fast processor, and long battery life.`,
    'headphones': `${brand} ${model} - Premium audio experience with crystal-clear sound, active noise cancellation, and comfortable design for all-day wear.`,
    'phone-accessories': `${brand} ${model} - Essential accessory for your device. Quality build and reliable performance.`,
    'tablets': `${brand} ${model} - Versatile tablet for work and entertainment. Stunning display and powerful performance in a portable form factor.`
  };
  return descriptions[category] || `${brand} ${model} - Quality electronics product.`;
}

function generateMetadata(category, storage, ram, color) {
  const metadata = { color };
  
  if (category === 'mobile-phones' || category === 'tablets') {
    metadata.storage = storage;
    metadata.ram = ram;
    metadata.screensize = category === 'tablets' ? randomChoice(['10.9"', '11"', '12.9"', '13"']) : randomChoice(['6.1"', '6.5"', '6.7"', '6.8"']);
    metadata.battery = randomChoice(['4000mAh', '4500mAh', '5000mAh', '5500mAh']);
    metadata.display = randomChoice(['OLED', 'AMOLED', 'Super AMOLED', 'LCD', 'ProMotion']);
  }
  
  if (category === 'laptops') {
    metadata.storage = randomChoice(['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD']);
    metadata.ram = randomChoice(['8GB', '16GB', '32GB', '64GB']);
    metadata.screensize = randomChoice(['13.3"', '14"', '15.6"', '16"', '17.3"']);
    metadata.processor = randomChoice(['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'Apple M3', 'Apple M3 Pro', 'AMD Ryzen 7', 'AMD Ryzen 9']);
  }
  
  if (category === 'headphones') {
    metadata.type = randomChoice(['Over-ear', 'On-ear', 'In-ear', 'TWS']);
    metadata.wireless = randomChoice(['true', 'false']);
    metadata.anc = randomChoice(['true', 'false']);
    metadata.battery = randomChoice(['20 hours', '30 hours', '40 hours', '60 hours']);
  }

  return metadata;
}

async function generateProducts(count = 1000) {
  const products = [];
  const categories = Object.keys(productTemplates);
  
  // Distribute products across categories
  const distribution = {
    'mobile-phones': 0.35,
    'laptops': 0.20,
    'headphones': 0.20,
    'phone-accessories': 0.15,
    'tablets': 0.10
  };

  for (const [category, ratio] of Object.entries(distribution)) {
    const categoryCount = Math.floor(count * ratio);
    
    for (let i = 0; i < categoryCount; i++) {
      const product = generateProduct(category);
      if (product) {
        products.push(product);
      }
    }
  }

  // Fill remaining with random categories
  while (products.length < count) {
    const category = randomChoice(categories);
    const product = generateProduct(category);
    if (product) {
      products.push(product);
    }
  }

  console.log(`[SyntheticGenerator] Generated ${products.length} products`);
  return products;
}

module.exports = {
  generateProducts,
  generateProduct
};
