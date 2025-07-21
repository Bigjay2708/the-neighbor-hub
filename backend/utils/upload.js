const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { validateFileUpload } = require('./security');
const logger = require('./logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'neighbor-hub',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  },
});

const fileFilter = (req, file, cb) => {
  const validation = validateFileUpload(file);
  
  if (validation.isValid) {
    cb(null, true);
  } else {
    cb(new Error(validation.errors.join(', ')), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files per upload
  }
});

/**
 * Upload single image
 */
const uploadSingle = upload.single('image');

/**
 * Upload multiple images
 */
const uploadMultiple = upload.array('images', 5);

/**
 * Delete image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise} - Promise resolving to deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error('Error deleting image from Cloudinary:', {
      error: error.message,
      stack: error.stack,
      publicId
    });
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
const extractPublicId = (url) => {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  } catch (error) {
    logger.error('Error extracting public ID:', {
      error: error.message,
      stack: error.stack,
      url
    });
    return null;
  }
};

/**
 * Process uploaded files and return formatted data
 * @param {Array} files - Array of uploaded files
 * @returns {Array} - Array of processed image data
 */
const processUploadedFiles = (files) => {
  if (!files || !Array.isArray(files)) {
    return [];
  }

  return files.map(file => ({
    url: file.path,
    publicId: file.filename,
    originalName: file.originalname,
    size: file.size,
    format: file.format,
    width: file.width,
    height: file.height
  }));
};

/**
 * Middleware to handle upload errors
 */
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          message: 'File too large. Maximum size is 5MB' 
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          message: 'Too many files. Maximum is 5 files' 
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ 
          message: 'Unexpected file field' 
        });
      default:
        return res.status(400).json({ 
          message: 'File upload error: ' + error.message 
        });
    }
  }

  if (error.message) {
    return res.status(400).json({ 
      message: error.message 
    });
  }

  next(error);
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteImage,
  extractPublicId,
  processUploadedFiles,
  handleUploadError,
  cloudinary
};
