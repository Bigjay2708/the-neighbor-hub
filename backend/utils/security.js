const DOMPurify = require('isomorphic-dompurify');

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} content - The content to sanitize
 * @returns {string} - Sanitized content
 */
const sanitizeHtml = (content) => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Configure DOMPurify for safe HTML
  const cleanHtml = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false
  });

  return cleanHtml;
};

/**
 * Sanitize plain text content
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text
 */
const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove any HTML tags and decode entities
  return DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [], 
    KEEP_CONTENT: true 
  });
};

/**
 * Validate and sanitize user input
 * @param {object} data - Object containing user input
 * @param {object} rules - Validation rules
 * @returns {object} - Sanitized data
 */
const sanitizeUserInput = (data, rules = {}) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }

    switch (rules[key]?.type) {
      case 'html':
        sanitized[key] = sanitizeHtml(value);
        break;
      case 'text':
      default:
        sanitized[key] = sanitizeText(value);
        break;
    }
  }

  return sanitized;
};

/**
 * Validate file upload
 * @param {object} file - Uploaded file object
 * @returns {object} - Validation result
 */
const validateFileUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
  }

  if (file.size > maxSize) {
    errors.push('File size too large. Maximum size is 5MB');
  }

  // Check for potentially malicious file names
  const dangerousPatterns = [/\.php$/i, /\.exe$/i, /\.js$/i, /\.html$/i, /\.htm$/i];
  if (dangerousPatterns.some(pattern => pattern.test(file.originalname))) {
    errors.push('Invalid file name');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  sanitizeHtml,
  sanitizeText,
  sanitizeUserInput,
  validateFileUpload
};
