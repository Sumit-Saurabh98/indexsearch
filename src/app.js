/**
 * IndexSearch - E-commerce Product Search Engine
 * Main application entry point
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const routes = require('./routes');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { requestTimer, requestLogger } = require('./middleware/request.middleware');

// Import config
const { API_PREFIX } = require('./config/constants');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

// CORS - Allow cross-origin requests
app.use(cors());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('dev'));

// Custom middleware
app.use(requestTimer);
app.use(requestLogger);

// ============================================
// Routes
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// API routes
app.use(API_PREFIX, routes);

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// Server Startup
// ============================================

app.listen(PORT, () => {
  console.log(`\n🚀 IndexSearch Server Started`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📍 URL:         http://localhost:${PORT}`);
  console.log(`📊 Health:      http://localhost:${PORT}/health`);
  console.log(`📚 API Info:    http://localhost:${PORT}${API_PREFIX}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

module.exports = app;
