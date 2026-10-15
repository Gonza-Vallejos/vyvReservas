/**
 * Response normalizer to ensure consistent property naming
 * Converts all responses to camelCase for consistency
 */

/**
 * Recursively converts object keys from PascalCase/snake_case to camelCase
 */
const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const isArray = Array.isArray;

// Track visited objects to prevent circular reference infinite loops
const convertKeys = (obj, visited = new WeakSet()) => {
  if (obj === null || obj === undefined) return obj;
  
  if (isArray(obj)) {
    return obj.map(item => convertKeys(item, visited));
  }
  
  if (typeof obj !== 'object') return obj;
  
  // Prevent infinite recursion for circular references
  if (visited.has(obj)) return obj;
  visited.add(obj);
  
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = toCamelCase(key);
      const value = obj[key];
      
      // Skip Sequelize metadata and internal fields
      if (camelKey === 'dataValues' || camelKey === '_previousDataValues' || 
          camelKey === '_changed' || camelKey === '_options' ||
          camelKey === '_modelOptions' || camelKey === 'sequelize') continue;
      
      // Recursively convert nested objects and arrays
      if (value && typeof value === 'object') {
        result[camelKey] = convertKeys(value, visited);
      } else {
        result[camelKey] = value;
      }
    }
  }
  return result;
};

/**
 * Normalizes a Sequelize model instance or plain object to camelCase
 */
const normalize = (data) => {
  if (!data) return data;
  
  if (isArray(data)) {
    return data.map(item => convertKeys(item));
  }
  
  return convertKeys(data);
};

/**
 * Normalizes a response with consistent structure
 */
const normalizeResponse = (data, message = 'Operación exitosa') => {
  return {
    success: true,
    message,
    data: normalize(data)
  };
};

module.exports = {
  normalize,
  normalizeResponse,
  toCamelCase
};
