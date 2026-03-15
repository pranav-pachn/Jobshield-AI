const NodeCache = require('node-cache');
const crypto = require('crypto');

// Create cache instances
const statsCache = new NodeCache({ stdTTL: 300, checkperiod: 600 }); // 5 minutes
const reportsCache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // 10 minutes
const domainCache = new NodeCache({ stdTTL: 1800, checkperiod: 360 }); // 30 minutes
const emailCache = new NodeCache({ stdTTL: 900, checkperiod: 180 }); // 15 minutes

/**
 * Generate cache key from request parameters
 */
function generateCacheKey(prefix, params = {}) {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return crypto.createHash('md5')
    .update(`${prefix}:${paramString}`)
    .digest('hex');
}

/**
 * Cache middleware for API responses
 */
function cacheMiddleware(cache, ttl = 300) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req.route?.path || req.originalUrl, req.query);
    
    // Try to get from cache
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`[CACHE] Cache hit for ${req.originalUrl}`);
      
      // Set cache headers
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Age', Math.floor((Date.now() - cachedResponse.timestamp) / 1000));
      
      return res.json(cachedResponse.data);
    }

    console.log(`[CACHE] Cache miss for ${req.originalUrl}`);
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      const responseData = {
        data,
        timestamp: Date.now()
      };
      
      // Cache the response
      cache.set(cacheKey, responseData, ttl);
      
      // Set cache headers
      res.set('X-Cache', 'MISS');
      
      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Cache invalidation helper
 */
function invalidateCache(pattern) {
  const keys = statsCache.keys().filter(key => key.includes(pattern));
  keys.forEach(key => {
    statsCache.del(key);
    reportsCache.del(key);
    domainCache.del(key);
    emailCache.del(key);
  });
  
  console.log(`[CACHE] Invalidated ${keys.length} cache entries matching pattern: ${pattern}`);
}

/**
 * Cache statistics
 */
function getCacheStats() {
  return {
    stats: statsCache.getStats(),
    reports: reportsCache.getStats(),
    domain: domainCache.getStats(),
    email: emailCache.getStats()
  };
}

module.exports = {
  cacheMiddleware,
  invalidateCache,
  getCacheStats,
  statsCache,
  reportsCache,
  domainCache,
  emailCache
};
