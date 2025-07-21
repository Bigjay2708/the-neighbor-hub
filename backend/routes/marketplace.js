const express = require('express');
const { body, validationResult } = require('express-validator');
const MarketplaceListing = require('../models/MarketplaceListing');
const { auth, verifiedOnly } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/listings', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      condition,
      priceMin,
      priceMax,
      search,
      sortBy = 'newest',
      status = 'available'
    } = req.query;

    const query = { 
      neighborhoodId: req.user.neighborhoodId,
      status: status === 'all' ? { $ne: 'removed' } : status
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (condition && condition !== 'all') {
      query.condition = condition;
    }

    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = parseFloat(priceMin);
      if (priceMax) query.price.$lte = parseFloat(priceMax);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'priceLow':
        sortOptions = { price: 1 };
        break;
      case 'priceHigh':
        sortOptions = { price: -1 };
        break;
      case 'mostViewed':
        sortOptions = { views: -1 };
        break;
      default:
        sortOptions = { lastBumped: -1 };
    }

    const listings = await MarketplaceListing.find(query)
      .populate('sellerId', 'firstName lastName avatar role isVerified')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await MarketplaceListing.countDocuments(query);

    res.json({
      listings,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    logger.error('Get marketplace listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/listings/:id', auth, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id)
      .populate('sellerId', 'firstName lastName avatar role isVerified joinedAt');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.neighborhoodId.toString() !== req.user.neighborhoodId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (listing.sellerId._id.toString() !== req.user.id) {
      await MarketplaceListing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    }

    res.json({ listing });

  } catch (error) {
    logger.error('Get marketplace listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/listings', [
  auth,
  verifiedOnly,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['furniture', 'electronics', 'clothing', 'books', 'toys', 'tools', 'appliances', 'vehicles', 'services', 'other']).withMessage('Valid category is required'),
  body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']).withMessage('Valid condition is required'),
  body('price').isNumeric().withMessage('Valid price is required'),
  body('priceType').optional().isIn(['fixed', 'negotiable', 'free', 'trade']).withMessage('Valid price type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, 
      description, 
      category, 
      condition, 
      price, 
      priceType = 'fixed',
      images = [],
      tags = [],
      location
    } = req.body;

    const listing = new MarketplaceListing({
      title,
      description,
      category,
      condition,
      price,
      priceType,
      images,
      tags,
      location,
      sellerId: req.user.id,
      neighborhoodId: req.user.neighborhoodId
    });

    await listing.save();

    const populatedListing = await MarketplaceListing.findById(listing._id)
      .populate('sellerId', 'firstName lastName avatar role isVerified');

    res.status(201).json({
      message: 'Listing created successfully',
      listing: populatedListing
    });

  } catch (error) {
    logger.error('Create marketplace listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/listings/:id', [
  auth,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isNumeric().withMessage('Valid price is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const listing = await MarketplaceListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedUpdates = ['title', 'description', 'price', 'priceType', 'condition', 'tags', 'status'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedListing = await MarketplaceListing.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('sellerId', 'firstName lastName avatar role isVerified');

    res.json({
      message: 'Listing updated successfully',
      listing: updatedListing
    });

  } catch (error) {
    logger.error('Update marketplace listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/listings/:id/favorite', auth, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const existingFavorite = listing.favorites.find(fav => fav.userId.toString() === req.user.id);

    if (existingFavorite) {
      listing.favorites = listing.favorites.filter(fav => fav.userId.toString() !== req.user.id);
    } else {
      listing.favorites.push({ userId: req.user.id });
    }

    await listing.save();

    res.json({
      message: existingFavorite ? 'Removed from favorites' : 'Added to favorites',
      favoritesCount: listing.favorites.length,
      isFavorited: !existingFavorite
    });

  } catch (error) {
    logger.error('Favorite listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/listings/:id/bump', auth, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (listing.lastBumped >= today) {
      return res.status(400).json({ message: 'Listing can only be bumped once per day' });
    }

    listing.lastBumped = new Date();
    await listing.save();

    res.json({ message: 'Listing bumped successfully' });

  } catch (error) {
    logger.error('Bump listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-listings', auth, async (req, res) => {
  try {
    const { status = 'all' } = req.query;

    const query = { sellerId: req.user.id };
    if (status !== 'all') {
      query.status = status;
    }

    const listings = await MarketplaceListing.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ listings });

  } catch (error) {
    logger.error('Get my listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/favorites', auth, async (req, res) => {
  try {
    const listings = await MarketplaceListing.find({
      'favorites.userId': req.user.id,
      status: { $ne: 'removed' }
    })
      .populate('sellerId', 'firstName lastName avatar role isVerified')
      .sort({ 'favorites.favoritedAt': -1 });

    res.json({ listings });

  } catch (error) {
    logger.error('Get favorite listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/listings/:id', auth, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await MarketplaceListing.findByIdAndDelete(req.params.id);

    res.json({ message: 'Listing deleted successfully' });

  } catch (error) {
    logger.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
