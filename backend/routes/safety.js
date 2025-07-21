const express = require('express');
const { body, validationResult } = require('express-validator');
const SafetyReport = require('../models/SafetyReport');
const { auth, verifiedOnly, moderatorOrAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/reports', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      severity,
      status = 'active',
      sortBy = 'newest',
      lat,
      lng,
      radius = 5 // miles
    } = req.query;

    const query = { 
      neighborhoodId: req.user.neighborhoodId
    };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (severity && severity !== 'all') {
      query.severity = severity;
    }

    if (status !== 'all') {
      query.status = status;
    }

    if (lat && lng) {
      const radiusInMeters = radius * 1609.34; // Convert miles to meters
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'severity':
        sortOptions = { severity: -1, createdAt: -1 };
        break;
      case 'mostAcknowledged':
        sortOptions = { 'acknowledgedBy.length': -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const reports = await SafetyReport.find(query)
      .populate('reporterId', 'firstName lastName avatar role isVerified')
      .populate('verifiedBy', 'firstName lastName role')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await SafetyReport.countDocuments(query);

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    logger.error('Get safety reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/reports/:id', auth, async (req, res) => {
  try {
    const report = await SafetyReport.findById(req.params.id)
      .populate('reporterId', 'firstName lastName avatar role isVerified')
      .populate('verifiedBy', 'firstName lastName role')
      .populate('comments.authorId', 'firstName lastName avatar role isVerified');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.neighborhoodId.toString() !== req.user.neighborhoodId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ report });

  } catch (error) {
    logger.error('Get safety report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reports', [
  auth,
  verifiedOnly,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').isIn(['crime', 'suspicious-activity', 'lost-pet', 'found-pet', 'weather-alert', 'road-closure', 'utility-outage', 'emergency', 'other']).withMessage('Valid type is required'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Valid severity is required'),
  body('location.address').notEmpty().withMessage('Location address is required'),
  body('location.coordinates.lat').isNumeric().withMessage('Valid latitude is required'),
  body('location.coordinates.lng').isNumeric().withMessage('Valid longitude is required'),
  body('incidentDateTime').isISO8601().withMessage('Valid incident date and time is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, 
      description, 
      type, 
      severity = 'medium',
      location,
      images = [],
      tags = [],
      isAnonymous = false,
      incidentDateTime,
      policeReported = false,
      policeReportNumber,
      contactInfo
    } = req.body;

    const report = new SafetyReport({
      title,
      description,
      type,
      severity,
      location,
      images,
      tags,
      isAnonymous,
      incidentDateTime,
      policeReported,
      policeReportNumber,
      contactInfo,
      reporterId: req.user.id,
      neighborhoodId: req.user.neighborhoodId
    });

    await report.save();

    const populatedReport = await SafetyReport.findById(report._id)
      .populate('reporterId', 'firstName lastName avatar role isVerified');

    res.status(201).json({
      message: 'Safety report created successfully',
      report: populatedReport
    });

  } catch (error) {
    logger.error('Create safety report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/reports/:id', [
  auth,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const report = await SafetyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.reporterId.toString() !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedUpdates = ['title', 'description', 'status', 'tags', 'policeReported', 'policeReportNumber'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedReport = await SafetyReport.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('reporterId', 'firstName lastName avatar role isVerified');

    res.json({
      message: 'Report updated successfully',
      report: updatedReport
    });

  } catch (error) {
    logger.error('Update safety report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reports/:id/acknowledge', auth, async (req, res) => {
  try {
    const report = await SafetyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const existingAck = report.acknowledgedBy.find(ack => ack.userId.toString() === req.user.id);

    if (existingAck) {
      report.acknowledgedBy = report.acknowledgedBy.filter(ack => ack.userId.toString() !== req.user.id);
    } else {
      report.acknowledgedBy.push({ userId: req.user.id });
    }

    await report.save();

    res.json({
      message: existingAck ? 'Acknowledgment removed' : 'Report acknowledged',
      acknowledgedCount: report.acknowledgedBy.length,
      isAcknowledged: !existingAck
    });

  } catch (error) {
    logger.error('Acknowledge report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reports/:id/comments', [
  auth,
  body('content').trim().notEmpty().withMessage('Comment content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, isAnonymous = false } = req.body;

    const report = await SafetyReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const comment = {
      authorId: req.user.id,
      content,
      isAnonymous
    };

    report.comments.push(comment);
    await report.save();

    const updatedReport = await SafetyReport.findById(req.params.id)
      .populate('comments.authorId', 'firstName lastName avatar role isVerified');

    const newComment = updatedReport.comments[updatedReport.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });

  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reports/:id/verify', [auth, moderatorOrAdmin], async (req, res) => {
  try {
    const report = await SafetyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.isVerified = !report.isVerified;
    report.verifiedBy = report.isVerified ? req.user.id : null;

    await report.save();

    const updatedReport = await SafetyReport.findById(req.params.id)
      .populate('reporterId', 'firstName lastName avatar role isVerified')
      .populate('verifiedBy', 'firstName lastName role');

    res.json({
      message: `Report ${report.isVerified ? 'verified' : 'unverified'} successfully`,
      report: updatedReport
    });

  } catch (error) {
    logger.error('Verify report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const { timeframe = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    const stats = await SafetyReport.aggregate([
      {
        $match: {
          neighborhoodId: req.user.neighborhoodId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          typeBreakdown: {
            $push: '$type'
          },
          severityBreakdown: {
            $push: '$severity'
          },
          statusBreakdown: {
            $push: '$status'
          }
        }
      }
    ]);

    const typeCount = {};
    const severityCount = {};
    const statusCount = {};

    if (stats.length > 0) {
      stats[0].typeBreakdown.forEach(type => {
        typeCount[type] = (typeCount[type] || 0) + 1;
      });

      stats[0].severityBreakdown.forEach(severity => {
        severityCount[severity] = (severityCount[severity] || 0) + 1;
      });

      stats[0].statusBreakdown.forEach(status => {
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
    }

    res.json({
      totalReports: stats.length > 0 ? stats[0].totalReports : 0,
      timeframe: parseInt(timeframe),
      typeBreakdown: typeCount,
      severityBreakdown: severityCount,
      statusBreakdown: statusCount
    });

  } catch (error) {
    logger.error('Get safety stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/reports/:id', auth, async (req, res) => {
  try {
    const report = await SafetyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.reporterId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await SafetyReport.findByIdAndDelete(req.params.id);

    res.json({ message: 'Report deleted successfully' });

  } catch (error) {
    logger.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
