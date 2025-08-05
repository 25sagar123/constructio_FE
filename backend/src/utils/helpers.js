/**
 * Utility functions for the application
 */

/**
 * Capitalize first letter of a string
 * @param {string} str 
 * @returns {string}
 */
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Generate random string of specified length
 * @param {number} length 
 * @returns {string}
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date 
 * @returns {string}
 */
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

/**
 * Calculate days between two dates
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {number}
 */
const daysBetween = (startDate, endDate) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((endDate - startDate) / oneDay));
};

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize user input
 * @param {string} input 
 * @returns {string}
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Generate pagination metadata
 * @param {number} page 
 * @param {number} limit 
 * @param {number} total 
 * @returns {object}
 */
const getPaginationMeta = (page, limit, total) => {
  const pages = Math.ceil(total / limit);
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages,
    hasNextPage: page < pages,
    hasPrevPage: page > 1,
    nextPage: page < pages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};

/**
 * Convert camelCase to snake_case
 * @param {string} str 
 * @returns {string}
 */
const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Convert snake_case to camelCase
 * @param {string} str 
 * @returns {string}
 */
const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * Create standardized API response
 * @param {boolean} success 
 * @param {string} message 
 * @param {any} data 
 * @param {object} meta 
 * @returns {object}
 */
const createResponse = (success, message, data = null, meta = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return response;
};

/**
 * Log error with context
 * @param {Error} error 
 * @param {string} context 
 */
const logError = (error, context = '') => {
  console.error(`[ERROR] ${context}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
};

/**
 * Async wrapper for route handlers
 * @param {Function} fn 
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  capitalize,
  generateRandomString,
  formatDate,
  daysBetween,
  isValidEmail,
  sanitizeInput,
  getPaginationMeta,
  camelToSnake,
  snakeToCamel,
  createResponse,
  logError,
  asyncHandler
};