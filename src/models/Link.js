/**
 * Link Model
 *
 * Mongoose schema for storing shortened links with analytics
 *
 * @module models/Link
 */

const mongoose = require('mongoose');

/**
 * Link Schema
 * Stores shortened URL information and analytics data
 */
const linkSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['youtube', 'instagram', 'other']
  },
  clicks: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  analytics: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    userAgent: String,
    ip: String,
    country: String,
    device: String,
    appOpened: {
      type: Boolean,
      default: false
    }
  }]
});

// Index for faster queries
linkSchema.index({ createdAt: -1 });
linkSchema.index({ platform: 1 });

// Update timestamp on save
linkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Get link statistics
 * @returns {Object} Statistics object
 */
linkSchema.methods.getStats = function() {
  const stats = {
    shortCode: this.shortCode,
    originalUrl: this.originalUrl,
    platform: this.platform,
    totalClicks: this.clicks,
    createdAt: this.createdAt,
    clicksByDay: {},
    deviceBreakdown: {},
    topCountries: {}
  };

  // Process analytics
  this.analytics.forEach(entry => {
    // Clicks by day
    const day = entry.timestamp.toISOString().split('T')[0];
    stats.clicksByDay[day] = (stats.clicksByDay[day] || 0) + 1;

    // Device breakdown
    stats.deviceBreakdown[entry.device] = (stats.deviceBreakdown[entry.device] || 0) + 1;

    // Top countries
    if (entry.country) {
      stats.topCountries[entry.country] = (stats.topCountries[entry.country] || 0) + 1;
    }
  });

  return stats;
};

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;
