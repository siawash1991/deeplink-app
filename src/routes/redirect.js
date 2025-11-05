/**
 * Redirect Routes
 *
 * Handle short link redirects and deep linking
 *
 * @module routes/redirect
 */

const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const { detectPlatform, generateIntermediateHTML } = require('../utils/deeplink');
const { createAnalyticsEntry } = require('../utils/analytics');

/**
 * GET /:shortCode
 *
 * Handle redirect with deep linking
 *
 * Tracks analytics and attempts to open the app,
 * falling back to web version if app is not installed
 */
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find link in database
    const link = await Link.findOne({ shortCode });

    if (!link) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="fa" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>لینک یافت نشد</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              text-align: center;
              max-width: 400px;
            }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ لینک یافت نشد</h1>
            <p>این لینک وجود ندارد یا حذف شده است.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Update click counter
    link.clicks += 1;

    // Save analytics data
    const analyticsEntry = createAnalyticsEntry(req);
    link.analytics.push(analyticsEntry);

    await link.save();

    // Detect platform and get deep link info
    const platformInfo = detectPlatform(link.originalUrl);

    if (!platformInfo) {
      // If platform not detected, just redirect to original URL
      return res.redirect(link.originalUrl);
    }

    const { platform, id, config } = platformInfo;

    // Generate deep link and fallback URL
    const deepLink = config.deepLinkTemplate(id);
    const fallbackUrl = config.fallback(id);

    // Send intermediate HTML that attempts to open the app
    res.send(generateIntermediateHTML(deepLink, fallbackUrl, platform));

  } catch (error) {
    console.error('Error handling redirect:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>خطا</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 400px;
          }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ خطا</h1>
          <p>خطایی در پردازش درخواست شما رخ داد. لطفاً بعداً دوباره تلاش کنید.</p>
        </div>
      </body>
      </html>
    `);
  }
});

module.exports = router;
