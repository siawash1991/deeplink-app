/**
 * Analytics Utilities
 *
 * Functions for processing and analyzing link statistics
 *
 * @module utils/analytics
 */

const useragent = require('user-agent');

/**
 * Parse user agent string and extract device information
 *
 * @param {string} userAgentString - User agent string from request
 * @returns {Object} Parsed device information
 */
function parseUserAgent(userAgentString) {
  const ua = useragent.parse(userAgentString);

  return {
    device: ua.os.toString(),
    browser: ua.family || 'Unknown',
    os: ua.os.family || 'Unknown',
    isBot: /bot|crawler|spider/i.test(userAgentString)
  };
}

/**
 * Create analytics entry for a link visit
 *
 * @param {Object} req - Express request object
 * @returns {Object} Analytics entry object
 */
function createAnalyticsEntry(req) {
  const ua = parseUserAgent(req.headers['user-agent'] || '');

  return {
    timestamp: new Date(),
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress,
    device: ua.device,
    browser: ua.browser,
    os: ua.os,
    isBot: ua.isBot,
    appOpened: false // Updated later via client-side tracking
  };
}

/**
 * Calculate statistics from analytics data
 *
 * @param {Array} analytics - Array of analytics entries
 * @returns {Object} Calculated statistics
 */
function calculateStats(analytics) {
  const stats = {
    total: analytics.length,
    clicksByDay: {},
    deviceBreakdown: {},
    browserBreakdown: {},
    osBreakdown: {},
    hourlyDistribution: Array(24).fill(0),
    appOpenRate: 0
  };

  let appOpens = 0;

  analytics.forEach(entry => {
    // Clicks by day
    const day = entry.timestamp.toISOString().split('T')[0];
    stats.clicksByDay[day] = (stats.clicksByDay[day] || 0) + 1;

    // Device breakdown
    stats.deviceBreakdown[entry.device] = (stats.deviceBreakdown[entry.device] || 0) + 1;

    // Browser breakdown
    if (entry.browser) {
      stats.browserBreakdown[entry.browser] = (stats.browserBreakdown[entry.browser] || 0) + 1;
    }

    // OS breakdown
    if (entry.os) {
      stats.osBreakdown[entry.os] = (stats.osBreakdown[entry.os] || 0) + 1;
    }

    // Hourly distribution
    const hour = entry.timestamp.getHours();
    stats.hourlyDistribution[hour]++;

    // App open tracking
    if (entry.appOpened) {
      appOpens++;
    }
  });

  // Calculate app open rate
  stats.appOpenRate = analytics.length > 0
    ? ((appOpens / analytics.length) * 100).toFixed(2)
    : 0;

  return stats;
}

/**
 * Get top N items from an object of counts
 *
 * @param {Object} counts - Object with items as keys and counts as values
 * @param {number} n - Number of top items to return
 * @returns {Array} Array of [item, count] pairs
 */
function getTopN(counts, n = 5) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

/**
 * Get date range statistics
 *
 * @param {Array} analytics - Array of analytics entries
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} Filtered statistics for date range
 */
function getDateRangeStats(analytics, startDate, endDate) {
  const filtered = analytics.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= startDate && entryDate <= endDate;
  });

  return calculateStats(filtered);
}

module.exports = {
  parseUserAgent,
  createAnalyticsEntry,
  calculateStats,
  getTopN,
  getDateRangeStats
};
