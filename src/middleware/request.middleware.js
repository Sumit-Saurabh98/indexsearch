/**
 * Request Timing Middleware
 * Logs response time for performance monitoring
 */

const requestTimer = (req, res, next) => {
  const startTime = Date.now();
  
  // Add response time header when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log if response time exceeds threshold (1000ms as per assignment requirement)
    if (duration > 1000) {
      console.warn(`[SLOW] ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};

/**
 * Request Logger Middleware
 * Additional request logging beyond morgan
 */
const requestLogger = (req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
};

module.exports = {
  requestTimer,
  requestLogger
};
