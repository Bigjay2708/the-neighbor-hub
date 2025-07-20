// Performance utilities for the React app

/**
 * Debounce function to limit the rate of function execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle function to limit the rate of function execution
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
};

/**
 * Lazy load images with intersection observer
 * @param {HTMLElement} imgElement - Image element to lazy load
 */
export const lazyLoadImage = (imgElement) => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  if (imgElement) {
    imageObserver.observe(imgElement);
  }
};

/**
 * Check if device has reduced motion preference
 * @returns {boolean} - True if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Optimize image for display
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<Blob>} - Optimized image blob
 */
export const optimizeImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Check if user is on a slow connection
 * @returns {boolean} - True if connection is slow
 */
export const isSlowConnection = () => {
  if ('connection' in navigator) {
    const conn = navigator.connection;
    return conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
  }
  return false;
};

/**
 * Preload critical resources
 * @param {Array} urls - Array of resource URLs to preload
 */
export const preloadResources = (urls) => {
  if (!Array.isArray(urls)) return;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    if (url.includes('.woff') || url.includes('.woff2')) {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    } else if (url.includes('.css')) {
      link.as = 'style';
    } else if (url.includes('.js')) {
      link.as = 'script';
    }
    
    document.head.appendChild(link);
  });
};
