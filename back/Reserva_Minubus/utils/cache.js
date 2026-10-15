/**
 * Simple in-memory cache utility
 * For production, replace with Redis for distributed caching
 */
const NodeCache = require('node-cache');

// Cache instance with TTL of 5 minutes default
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Cleanup every 60 seconds
  useClones: true,
});

/**
 * Get value from cache
 */
const get = (key) => {
  return cache.get(key);
};

/**
 * Set value in cache
 */
const set = (key, value, ttl = null) => {
  if (ttl) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
};

/**
 * Delete key from cache
 */
const del = (key) => {
  cache.del(key);
};

/**
 * Clear all cache
 */
const flush = () => {
  cache.flushAll();
};

/**
 * Get or set cache - fetch data if not cached
 */
const remember = async (key, ttl, fetchFn) => {
  const cached = get(key);
  if (cached !== undefined) {
    return cached;
  }
  
  const data = await fetchFn();
  set(key, data, ttl);
  return data;
};

module.exports = {
  get,
  set,
  del,
  flush,
  remember,
  cache
};
