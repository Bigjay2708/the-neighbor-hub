const express = require('express');
const { auth } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, handleUploadError, processUploadedFiles } = require('../utils/upload');
const { uploadLimiter } = require('../utils/rateLimiting');
const logger = require('../utils/logger');

const router = express.Router();

router.post('/single', [auth, uploadLimiter, uploadSingle], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageData = {
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      format: req.file.format,
      width: req.file.width,
      height: req.file.height
    };

    res.json({
      message: 'Image uploaded successfully',
      image: imageData
    });

  } catch (error) {
    logger.error('Single upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/multiple', [auth, uploadLimiter, uploadMultiple], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const images = processUploadedFiles(req.files);

    res.json({
      message: `${images.length} image(s) uploaded successfully`,
      images: images
    });

  } catch (error) {
    logger.error('Multiple upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.use(handleUploadError);

module.exports = router;
