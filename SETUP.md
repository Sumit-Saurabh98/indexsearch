# Setup Guide - IndexSearch

This guide will help you set up and run the IndexSearch application locally.

## Prerequisites

- **Node.js** v18+ 
- **MongoDB** (local or MongoDB Atlas)
- **npm** v9+

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/indexsearch.git
cd indexsearch
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/indexsearch
```

> **Using MongoDB Atlas?** Replace `MONGODB_URI` with your connection string.

### 3. Seed Database

```bash
npm run seed
```

This will populate 1200+ products across categories:
- Mobile Phones (35%)
- Laptops (20%)
- Headphones (20%)
- Phone Accessories (15%)
- Tablets (10%)

### 4. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 5. Verify

Open browser: `http://localhost:3000/health`

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected"
  }
}
```

## Available Endpoints

| URL | Description |
|-----|-------------|
| `http://localhost:3000/health` | Health check |
| `http://localhost:3000/api/v1` | API info |
| `http://localhost:3000/api/docs` | Swagger UI |

## Test Search

```bash
# Basic search
curl "http://localhost:3000/api/v1/search/product?query=iPhone"

# Hinglish search
curl "http://localhost:3000/api/v1/search/product?query=sasta%20phone"

# With filters
curl "http://localhost:3000/api/v1/search/product?category=laptops&minRating=4"
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm start` | Production server |
| `npm run seed` | Seed database |
| `npm run scrape` | Scrape from sources |

## Troubleshooting

### MongoDB Connection Failed

1. Ensure MongoDB is running locally, or
2. Check your Atlas connection string
3. Verify network access in Atlas

### Port Already in Use

```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Missing Dependencies

```bash
rm -rf node_modules
npm install
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Environment |
| `MONGODB_URI` | Yes | - | MongoDB connection |
