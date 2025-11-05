/**
 * API Routes
 *
 * RESTful API endpoints for link management
 *
 * @module routes/api
 */

const express = require('express');
const router = express.Router();
const shortid = require('shortid');
const Link = require('../models/Link');
const { detectPlatform } = require('../utils/deeplink');

/**
 * POST /api/shorten
 *
 * Create a shortened link
 *
 * Request body:
 * - url: Original URL to shorten (required)
 *
 * Response:
 * - success: Boolean indicating success
 * - shortUrl: Generated short URL
 * - originalUrl: Original URL
 * - platform: Detected platform name
 */
router.post('/shorten', async (req, res) => {
  try {
    const { url } = req.body;

    // Validation
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Detect platform
    const platformInfo = detectPlatform(url);

    if (!platformInfo) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported platform. Currently supporting YouTube and Instagram.'
      });
    }

    // Generate unique short code
    const shortCode = shortid.generate();

    // Save to database
    const link = new Link({
      shortCode,
      originalUrl: url,
      platform: platformInfo.platform
    });

    await link.save();

    // Build short URL
    const domain = process.env.DOMAIN || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${domain}/${shortCode}`;

    res.json({
      success: true,
      shortUrl,
      originalUrl: url,
      platform: platformInfo.platform,
      shortCode
    });

  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/stats/:shortCode
 *
 * Get statistics for a shortened link
 *
 * Response:
 * - shortCode: Short code
 * - originalUrl: Original URL
 * - platform: Platform name
 * - totalClicks: Total number of clicks
 * - createdAt: Creation timestamp
 * - clicksByDay: Object with daily click counts
 * - deviceBreakdown: Object with device distribution
 */
router.get('/stats/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const link = await Link.findOne({ shortCode });

    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link not found'
      });
    }

    // Get statistics using model method
    const stats = link.getStats();

    res.json({
      success: true,
      ...stats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/links
 *
 * Get all links (with pagination)
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 */
router.get('/links', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const links = await Link.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-analytics'); // Exclude analytics for performance

    const total = await Link.countDocuments();

    res.json({
      success: true,
      links,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/links/:shortCode
 *
 * Delete a shortened link
 */
router.delete('/links/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const link = await Link.findOneAndDelete({ shortCode });

    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link not found'
      });
    }

    res.json({
      success: true,
      message: 'Link deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
