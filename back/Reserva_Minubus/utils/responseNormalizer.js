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

const convertKeys = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (isArray(obj)) {
    return obj.map(convertKeys);
  }
  
  if (typeof obj !== 'object') return obj;
  
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = toCamelCase(key);
      const value = obj[key];
      
      // Skip Sequelize metadata and internal fields
      if (camelKey === 'dataValues' || camelKey === '_previousDataValues' || 
          camelKey === '_changed' || camelKey === '_options') continue;
      
      // Recursively convert nested objects and arrays
      if (value && typeof value === 'object') {
        result[camelKey] = convertKeys(value);
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
