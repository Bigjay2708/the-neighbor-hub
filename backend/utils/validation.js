const validator = require('validator');
const mongoose = require('mongoose');

/**
 * Common validation utilities
 */

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate password strength
 */
const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate ZIP code (US format)
 */
const isValidZipCode = (zipCode) => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
};

/**
 * Validate phone number (US format)
 */
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate URL format
 */
const isValidURL = (url) => {
  return validator.isURL(url);
};

/**
 * Validate coordinates (latitude, longitude)
 */
const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Validate price (positive number)
 */
const isValidPrice = (price) => {
  return typeof price === 'number' && price >= 0;
};

/**
 * Validate date (not in future for reports, not too old)
 */
const isValidDate = (date, allowFuture = false) => {
  const inputDate = new Date(date);
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  
  if (isNaN(inputDate.getTime())) {
    return false;
  }
  
  if (!allowFuture && inputDate > now) {
    return false;
  }
  
  return inputDate >= oneYearAgo;
};

/**
 * Validate enum values
 */
const isValidEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

/**
 * Validate text length
 */
const isValidTextLength = (text, minLength = 1, maxLength = 1000) => {
  if (typeof text !== 'string') return false;
  const trimmed = text.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

/**
 * Validate array of strings
 */
const isValidStringArray = (arr, maxLength = 10, maxItemLength = 50) => {
  if (!Array.isArray(arr)) return false;
  if (arr.length > maxLength) return false;
  
  return arr.every(item => 
    typeof item === 'string' && 
    item.trim().length > 0 && 
    item.trim().length <= maxItemLength
  );
};

/**
 * Validate image file
 */
const isValidImageFile = (file) => {
  if (!file) return false;
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  return (
    allowedTypes.includes(file.mimetype) &&
    file.size <= maxSize
  );
};

/**
 * Comprehensive validation for user registration
 */
const validateUserRegistration = (userData) => {
  const errors = [];
  
  if (!userData.firstName || !isValidTextLength(userData.firstName, 1, 50)) {
    errors.push('First name must be 1-50 characters long');
  }
  
  if (!userData.lastName || !isValidTextLength(userData.lastName, 1, 50)) {
    errors.push('Last name must be 1-50 characters long');
  }
  
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!userData.password || !isValidPassword(userData.password)) {
    errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
  }
  
  if (userData.phoneNumber && !isValidPhoneNumber(userData.phoneNumber)) {
    errors.push('Invalid phone number format');
  }
  
  if (!userData.address || !userData.address.street || !userData.address.city || 
      !userData.address.state || !userData.address.zipCode) {
    errors.push('Complete address is required');
  }
  
  if (userData.address && userData.address.zipCode && !isValidZipCode(userData.address.zipCode)) {
    errors.push('Invalid ZIP code format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Comprehensive validation for forum post
 */
const validateForumPost = (postData) => {
  const errors = [];
  
  if (!postData.title || !isValidTextLength(postData.title, 3, 200)) {
    errors.push('Title must be 3-200 characters long');
  }
  
  if (!postData.content || !isValidTextLength(postData.content, 10, 5000)) {
    errors.push('Content must be 10-5000 characters long');
  }
  
  const validCategories = ['general', 'safety', 'events', 'recommendations', 'lost-found', 'buy-sell'];
  if (!postData.category || !isValidEnum(postData.category, validCategories)) {
    errors.push('Invalid category');
  }
  
  if (postData.tags && !isValidStringArray(postData.tags, 5, 30)) {
    errors.push('Tags must be an array of 1-5 strings, each 1-30 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Comprehensive validation for marketplace listing
 */
const validateMarketplaceListing = (listingData) => {
  const errors = [];
  
  if (!listingData.title || !isValidTextLength(listingData.title, 3, 100)) {
    errors.push('Title must be 3-100 characters long');
  }
  
  if (!listingData.description || !isValidTextLength(listingData.description, 10, 2000)) {
    errors.push('Description must be 10-2000 characters long');
  }
  
  if (!listingData.price || !isValidPrice(listingData.price)) {
    errors.push('Valid price is required');
  }
  
  const validCategories = ['electronics', 'furniture', 'clothing', 'books', 'sports', 'tools', 'other'];
  if (!listingData.category || !isValidEnum(listingData.category, validCategories)) {
    errors.push('Invalid category');
  }
  
  const validConditions = ['new', 'like-new', 'good', 'fair', 'poor'];
  if (!listingData.condition || !isValidEnum(listingData.condition, validConditions)) {
    errors.push('Invalid condition');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Comprehensive validation for safety report
 */
const validateSafetyReport = (reportData) => {
  const errors = [];
  
  if (!reportData.title || !isValidTextLength(reportData.title, 3, 100)) {
    errors.push('Title must be 3-100 characters long');
  }
  
  if (!reportData.description || !isValidTextLength(reportData.description, 10, 2000)) {
    errors.push('Description must be 10-2000 characters long');
  }
  
  const validTypes = ['crime', 'accident', 'suspicious-activity', 'vandalism', 'noise', 'other'];
  if (!reportData.type || !isValidEnum(reportData.type, validTypes)) {
    errors.push('Invalid report type');
  }
  
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (!reportData.severity || !isValidEnum(reportData.severity, validSeverities)) {
    errors.push('Invalid severity level');
  }
  
  if (reportData.incidentDateTime && !isValidDate(reportData.incidentDateTime)) {
    errors.push('Invalid incident date/time');
  }
  
  if (reportData.location && reportData.location.coordinates) {
    const [lng, lat] = reportData.location.coordinates;
    if (!isValidCoordinates(lat, lng)) {
      errors.push('Invalid coordinates');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  // Basic validations
  isValidEmail,
  isValidPassword,
  isValidObjectId,
  isValidZipCode,
  isValidPhoneNumber,
  isValidURL,
  isValidCoordinates,
  isValidPrice,
  isValidDate,
  isValidEnum,
  isValidTextLength,
  isValidStringArray,
  isValidImageFile,
  
  // Comprehensive validations
  validateUserRegistration,
  validateForumPost,
  validateMarketplaceListing,
  validateSafetyReport
};
