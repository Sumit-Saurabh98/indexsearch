# IndexSearch - E-commerce Product Search Engine

A high-performance e-commerce product search engine with intelligent ranking, built for Tier-2 and Tier-3 cities in India.

## 🚀 Features

- **Smart Search** - Full-text search with MongoDB text indexes
- **Hinglish Support** - Search in Hindi-English mix (e.g., "sasta iPhone")
- **Spelling Correction** - Handles typos (e.g., "ifone" → "iphone")
- **Intelligent Ranking** - Multi-factor scoring algorithm
- **Fast Performance** - < 1000ms response times
- **Product CRUD** - Complete product management APIs

## 📦 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Search**: MongoDB Text Search + Custom Ranking

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/indexsearch.git
cd indexsearch

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI
MONGODB_URI=mongodb://localhost:27017/indexsearch
PORT=3000
NODE_ENV=development

# Seed the database with 1200+ products
npm run seed

# Start development server
npm run dev
```

## 📚 API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/product` | Create a new product |
| GET | `/api/v1/product/:id` | Get product by ID |
| GET | `/api/v1/products` | List all products (paginated) |
| PATCH | `/api/v1/product/:id` | Update product |
| PUT | `/api/v1/product/meta-data` | Update product metadata |
| DELETE | `/api/v1/product/:id` | Delete product |
| GET | `/api/v1/product/stats` | Get product statistics |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search/product` | Search products |

**Query Parameters:**

- `query` - Search text (supports Hinglish)
- `category` - Filter by category
- `brand` - Filter by brand
- `minPrice` / `maxPrice` - Price range
- `minRating` - Minimum rating
- `inStock` - Only in-stock items
- `sortBy` - Sort field (price, rating, salesCount)
- `sortOrder` - asc/desc
- `page` / `limit` - Pagination

## 🔍 Search Examples

```bash
# Basic search
curl "http://localhost:3000/api/v1/search/product?query=iPhone"

# Hinglish search (cheap iPhone)
curl "http://localhost:3000/api/v1/search/product?query=sasta%20iPhone"

# With filters
curl "http://localhost:3000/api/v1/search/product?query=laptop&minPrice=50000&maxPrice=100000&minRating=4"

# Sorted by price
curl "http://localhost:3000/api/v1/search/product?query=Samsung&sortBy=price&sortOrder=asc"
```

## 🗣️ Hinglish Support (100+ Terms)

The search engine understands Hindi-English mixed queries commonly used in India:

| Category | Examples |
|----------|----------|
| **Price** | sasta, mehenga, kimat, daam, paisa |
| **Quality** | accha, behtreen, zabardast, lajawaab, badhiya |
| **Size** | bada, chota, lambi, patla, halka |
| **Colors** | kala (black), safed (white), laal (red), neela (blue) |
| **Time** | naya (new), purana (old), taaza (latest) |
| **Speed** | tez (fast), jaldi (quick), tagda (powerful) |
| **Shopping** | kharido (buy), mangao (order), wapsi (return) |

**Example Queries:**
```bash
# "Cheap phone" in Hinglish
curl "http://localhost:3000/api/v1/search/product?query=sasta%20phone"

# "Best quality laptop"
curl "http://localhost:3000/api/v1/search/product?query=behtreen%20laptop"

# "New red iPhone"
curl "http://localhost:3000/api/v1/search/product?query=naya%20laal%20iphone"
```

## ✏️ Spelling Correction

Handles common misspellings:

| Misspelled | Corrected |
|------------|-----------|
| ifone, iphon | iphone |
| sumsung, samung | samsung |
| onplus, one+ | oneplus |
| redme, readmi | redmi |
| labtop, leptop | laptop |

## 🎯 Ranking Algorithm

Products are ranked using multiple weighted factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Text Relevance | 50% | MongoDB text score (primary) |
| Rating | 20% | Product rating (0-5) |
| Sales Popularity | 10% | Sales count |
| Stock Availability | 5% | In-stock products rank higher |
| Price Competitiveness | 5% | Lower price = higher rank |
| Recency | 5% | Newer products rank higher |
| Return Rate | -2.5% | Penalty for high returns |
| Complaints | -2.5% | Penalty for complaints |

## 📁 Project Structure

```
indexsearch/
├── src/
│   ├── app.js                    # Express app entry
│   ├── config/
│   │   ├── constants.js          # App constants
│   │   ├── database.js           # MongoDB connection
│   │   └── swagger.js            # Swagger config
│   ├── controllers/
│   │   ├── product.controller.js
│   │   └── search.controller.js
│   ├── middleware/
│   │   ├── error.middleware.js   # Error handling
│   │   └── request.middleware.js # Request timing
│   ├── models/
│   │   ├── index.js
│   │   └── product.model.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── product.routes.js
│   │   ├── products.routes.js
│   │   └── search.routes.js
│   ├── scrapers/
│   │   ├── base.scraper.js
│   │   ├── flipkart.scraper.js
│   │   ├── amazon.scraper.js
│   │   ├── synthetic.generator.js
│   │   ├── utils.js
│   │   └── index.js              # Data ingestion
│   ├── services/
│   │   ├── product.service.js
│   │   ├── search.service.js
│   │   └── ranking.service.js
│   └── utils/
│       ├── cache.js              # In-memory cache
│       └── query-parser.js       # Hinglish & spelling
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Scripts

```bash
npm start     # Production server
npm run dev   # Development with nodemon
npm run seed  # Seed database with products
npm run scrape # Scrape from Flipkart/Amazon
```

## 📊 Product Categories

- mobile-phones
- laptops
- headphones
- phone-accessories
- tablets
- smartwatches
- cameras
- gaming
- audio

## ⚡ Performance

- All APIs respond in < 1000ms
- Text indexes for fast search
- Compound indexes for filtered queries
- In-memory caching for repeated searches

## 📝 Sample API Requests

### Create Product

```bash
curl -X POST http://localhost:3000/api/v1/product \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 17",
    "description": "Latest iPhone with A19 chip",
    "price": 81999,
    "mrp": 84999,
    "rating": 4.5,
    "stock": 100,
    "category": "mobile-phones",
    "brand": "Apple"
  }'
```

### Update Metadata

```bash
curl -X PUT http://localhost:3000/api/v1/product/meta-data \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "YOUR_PRODUCT_ID",
    "Metadata": {
      "ram": "8GB",
      "storage": "128GB",
      "color": "Black"
    }
  }'
```

## 📖 API Documentation

Swagger UI available at: `http://localhost:3000/api/docs`

## 📄 License

ISC

## 👤 Author

Built for Indexnine Software Backend Development Assignment
