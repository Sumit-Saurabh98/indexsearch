# E-Commerce Product Search Engine - Implementation Plan

> **Tech Stack:** Node.js + Javascript + MongoDB  
> **Goal:** Build a search engine for electronics e-commerce platform with intelligent product ranking

---

## Phase 1: Project Initialization

### Stage 1.1: Repository & Basic Setup
**Commit: `chore: initialize node.js project`**

- [ ] Create GitHub repository
- [ ] Initialize npm project: `npm init -y`
- [ ] Install nodemon for development
- [ ] Setup folder structure:
```
src/
├── config/
├── controllers/
├── services/
├── models/
├── routes/
├── utils/
├── scrapers/
└── app.js
```

**Files to create:**
| File | Purpose |
|------|---------|
| `package.json` | Project dependencies |
| `.gitignore` | Ignore node_modules, .env |
| `.env.example` | Environment variables template |

---

### Stage 1.2: Express Server Setup
**Commit: `feat: setup express server with basic middleware`**

- [ ] Install Express & middleware packages
- [ ] Create base Express app with:
  - CORS
  - JSON body parser
  - Error handling middleware
  - Request logging (morgan)
- [ ] Add health check endpoint: `GET /health`

**Dependencies:**
```bash
npm install express cors morgan dotenv
npm install -D nodemon
```

---

## Phase 2: Database Setup & Models

### Stage 2.1: MongoDB Connection
**Commit: `feat: add mongodb connection with mongoose`**

- [ ] Install Mongoose
- [ ] Create database connection utility
- [ ] Add connection error handling
- [ ] Configure environment variables for DB URI

**Dependencies:**
```bash
npm install mongoose
```

---

### Stage 2.2: Product Schema & Model
**Commit: `feat: create product model with metadata schema`**

- [ ] Design Product schema with fields:
  - `title` (string, required, indexed)
  - `description` (string, text indexed for search)
  - `rating` (number, 0-5)
  - `stock` (number)
  - `price` (number) - selling price
  - `mrp` (number) - maximum retail price
  - `currency` (string, default: "Rupee")
  - `metadata` (object) - flexible key-value pairs
  - `category` (string)
  - `brand` (string)
  - `salesCount` (number) - for ranking
  - `reviewCount` (number)
  - `returnRate` (number) - percentage
  - `complaintsCount` (number)
  - `source` (string) - "flipkart" | "amazon" | "manual"
  - `sourceUrl` (string)
  - `images` (array of strings)
  - `createdAt`, `updatedAt` (timestamps)

- [ ] Add text indexes for search
- [ ] Add compound indexes for ranking queries

---

## Phase 3: Web Scraping Service

### Stage 3.1: Scraper Base Setup
**Commit: `feat: create base scraper infrastructure`**

- [ ] Install scraping dependencies
- [ ] Create abstract scraper interface
- [ ] Add rate limiting utility
- [ ] Add retry logic with exponential backoff
- [ ] Create data transformation utilities

**Dependencies:**
```bash
npm install axios cheerio puppeteer
```

---

### Stage 3.2: Flipkart Scraper
**Commit: `feat: implement flipkart product scraper`**

- [ ] Create Flipkart scraper service
- [ ] Scrape electronics categories:
  - Mobile phones
  - Laptops
  - Headphones
  - Phone accessories
  - Electronic gadgets
- [ ] Extract product data:
  - Title, description, price, MRP
  - Ratings, review count
  - Specifications/metadata
  - Images
- [ ] Handle pagination
- [ ] Map data to Product schema

---

### Stage 3.3: Amazon Scraper
**Commit: `feat: implement amazon product scraper`**

- [ ] Create Amazon scraper service
- [ ] Scrape same electronics categories
- [ ] Handle Amazon's anti-bot measures
- [ ] Extract and transform product data
- [ ] Implement fallback for blocked requests

---

### Stage 3.4: Synthetic Data Fallback
**Commit: `feat: add synthetic data generator as fallback`**

- [ ] Create realistic product data generator
- [ ] Generate 1000+ electronics products
- [ ] Include varied:
  - Brands (Apple, Samsung, OnePlus, etc.)
  - Price ranges
  - Ratings distribution
  - Stock levels
  - Metadata attributes
- [ ] Use for development/testing if scraping fails

---

### Stage 3.5: Data Ingestion Pipeline
**Commit: `feat: create data ingestion pipeline for scraped products`**

- [ ] Create ingestion service
- [ ] Deduplicate products
- [ ] Validate and sanitize data
- [ ] Batch insert into MongoDB
- [ ] Add progress logging
- [ ] Create CLI command: `npm run scrape`

---

## Phase 4: Product APIs

### Stage 4.1: Create Product API
**Commit: `feat: implement POST /api/v1/product endpoint`**

- [ ] Create product controller
- [ ] Implement `POST /api/v1/product`
- [ ] Add request validation (Zod/Joi)
- [ ] Handle duplicate detection
- [ ] Return `productId` on success

**Endpoint:** `POST /api/v1/product`

---

### Stage 4.2: Update Metadata API
**Commit: `feat: implement PUT /api/v1/product/meta-data endpoint`**

- [ ] Implement `PUT /api/v1/product/meta-data`
- [ ] Merge new metadata with existing
- [ ] Validate productId exists
- [ ] Return updated product metadata

**Endpoint:** `PUT /api/v1/product/meta-data`

---

### Stage 4.3: Additional Product APIs
**Commit: `feat: add CRUD endpoints for products`**

- [ ] `GET /api/v1/product/:id` - Get single product
- [ ] `GET /api/v1/products` - List products with pagination
- [ ] `DELETE /api/v1/product/:id` - Delete product
- [ ] `PATCH /api/v1/product/:id` - Partial update

---

## Phase 5: Search & Ranking Engine

### Stage 5.1: Basic Text Search
**Commit: `feat: implement basic text search with mongodb`**

- [ ] Create search service
- [ ] Use MongoDB text search
- [ ] Implement `GET /api/v1/search/product`
- [ ] Return matching products

**Endpoint:** `GET /api/v1/search/product?query="..."`

---

### Stage 5.2: Query Preprocessing
**Commit: `feat: add query preprocessing for better search`**

- [ ] Spelling correction (fuzzy matching)
- [ ] Hinglish to English translation map
  - "sastha" → "cheap/budget"
  - "ifone" → "iphone"
- [ ] Extract intent keywords:
  - "latest" → sort by newest
  - "cheap/sasta" → sort by price asc
  - "best" → sort by rating
- [ ] Extract filters from query:
  - Color mentions
  - Storage/RAM values
  - Price ranges ("50k rupees")

---

### Stage 5.3: Ranking Algorithm
**Commit: `feat: implement multi-factor ranking algorithm`**

- [ ] Create ranking service with weighted scoring:

```javascript
const RankingFactors = {
  textRelevance: 0.30,
  rating: 0.20,
  salesPopularity: 0.15,
  stockAvailability: 0.10,
  priceCompetitiveness: 0.10,
  recency: 0.05,
  returnRate: -0.05,      // penalty
  complaintsRate: -0.05   // penalty
};
```

- [ ] Normalize all factors to 0-1 scale
- [ ] Calculate composite score
- [ ] Sort by final score descending

---

### Stage 5.4: Advanced Search Features
**Commit: `feat: add filters and faceted search`**

- [ ] Add query parameters:
  - `category` filter
  - `brand` filter
  - `minPrice`, `maxPrice`
  - `minRating`
  - `inStock` (boolean)
  - `sortBy` (price, rating, popularity)
  - `sortOrder` (asc, desc)
- [ ] Implement pagination (`page`, `limit`)
- [ ] Return facets/aggregations

---

### Stage 5.5: Search Performance Optimization
**Commit: `perf: optimize search queries for <1000ms latency`**

- [ ] Add compound indexes
- [ ] Implement query caching (Redis optional)
- [ ] Add response time logging
- [ ] Limit result set size
- [ ] Use projection to return only needed fields

---

## Phase 6: Polish & Documentation

### Stage 6.1: Error Handling & Validation
**Commit: `feat: add comprehensive error handling`**

- [ ] Create custom error classes
- [ ] Add global error handler
- [ ] Validate all request bodies
- [ ] Return consistent error responses:
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID 123 not found"
  }
}
```

---

### Stage 6.2: API Documentation
**Commit: `docs: add swagger/openapi documentation`**

- [ ] Install swagger packages
- [ ] Document all endpoints
- [ ] Add request/response examples
- [ ] Setup Swagger UI at `/api/docs`

---

### Stage 6.3: README & Setup Guide
**Commit: `docs: add comprehensive README`**

- [ ] Write README.md with:
  - Project overview
  - Tech stack
  - Setup instructions
  - API documentation
  - Environment variables
  - Architecture decisions
  - Ranking algorithm explanation

---

### Stage 6.4: LLM Conversation Log
**Commit: `docs: add llm conversation log`**

- [ ] Create `LLM_CONVERSATION.md`
- [ ] Document all AI-assisted development
- [ ] Include key decisions and iterations

---

## Folder Structure (Final)

```
indexsearch/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── constants.js
│   ├── controllers/
│   │   ├── product.controller.js
│   │   └── search.controller.js
│   ├── models/
│   │   └── product.model.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── product.routes.js
│   │   └── search.routes.js
│   ├── services/
│   │   ├── product.service.js
│   │   ├── search.service.js
│   │   └── ranking.service.js
│   ├── scrapers/
│   │   ├── base.scraper.js
│   │   ├── flipkart.scraper.js
│   │   ├── amazon.scraper.js
│   │   └── synthetic.generator.js
│   ├── utils/
│   │   ├── query-parser.js
│   │   ├── spelling-corrector.js
│   │   └── error-handler.js
│   ├── middleware/
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   └── app.js
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── LLM_CONVERSATION.md
```

---

## Dependencies Summary

```json
{
  "dependencies": {
    "express": "^4.18.x",
    "mongoose": "^8.x",
    "cors": "^2.8.x",
    "morgan": "^1.10.x",
    "dotenv": "^16.x",
    "joi": "^17.x",
    "axios": "^1.x",
    "cheerio": "^1.x",
    "puppeteer": "^21.x"
  },
  "devDependencies": {
    "nodemon": "^3.x",
    "jest": "^29.x"
  }
}
```

---

## Commit Message Convention

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `chore:` - Maintenance
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `perf:` - Performance improvements

---

## Quick Start Commands

```bash
# Phase 1.1 - Initialize
npm init -y
npm install -D nodemon

# Phase 1.2 - Express
npm install express cors morgan dotenv

# Phase 2.1 - MongoDB
npm install mongoose

# Phase 3.1 - Scraping
npm install axios cheerio puppeteer

# Run development server
npm run dev

# Run scraper
npm run scrape
```

---

> **💡 Tip:** Start with Phase 1 and commit after each stage. This gives you ~15+ meaningful commits showing incremental progress.
