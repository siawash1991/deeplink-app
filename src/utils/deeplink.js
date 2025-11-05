/**
 * Deep Linking Utilities
 *
 * Functions for detecting platforms and generating deep links
 *
 * @module utils/deeplink
 */

/**
 * Platform configurations for deep linking
 */
const platforms = {
  youtube: {
    regex: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
    deepLinkTemplate: (videoId) => `vnd.youtube://watch/${videoId}`,
    fallback: (videoId) => `https://youtube.com/watch?v=${videoId}`
  },
  instagram: {
    regex: /instagram\.com\/(p|reel|tv)\/([\w-]+)/,
    deepLinkTemplate: (postId) => `instagram://media?id=${postId}`,
    fallback: (postId) => `https://instagram.com/p/${postId}`
  }
  // You can add more platforms here:
  // spotify: { ... },
  // tiktok: { ... },
  // twitter: { ... }
};

/**
 * Detect platform from URL and extract necessary information
 *
 * @param {string} url - The original URL to analyze
 * @returns {Object|null} Platform information or null if unsupported
 * @returns {string} return.platform - Platform name (youtube, instagram, etc.)
 * @returns {string} return.id - Extracted ID (video ID, post ID, etc.)
 * @returns {Object} return.config - Platform configuration object
 */
function detectPlatform(url) {
  for (const [platform, config] of Object.entries(platforms)) {
    const match = url.match(config.regex);
    if (match) {
      return {
        platform,
        id: match[match.length - 1],
        config
      };
    }
  }

  return null;
}

/**
 * Generate intermediate HTML page for deep linking
 *
 * This page attempts to open the app and falls back to web version
 *
 * @param {string} deepLink - Deep link URL scheme
 * @param {string} fallbackUrl - Fallback web URL
 * @param {string} platform - Platform name for display
 * @returns {string} HTML string
 */
function generateIntermediateHTML(deepLink, fallbackUrl, platform) {
  return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>در حال بازکردن ${platform}...</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
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
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .spinner {
            width: 50px;
            height: 50px;
            margin: 0 auto 20px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        h2 {
            color: #333;
            margin-bottom: 10px;
            font-size: 24px;
        }

        p {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.6;
        }

        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-top: 10px;
        }

        .button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102,126,234,0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h2>در حال باز کردن اپلیکیشن...</h2>
        <p>اگر اپلیکیشن باز نشد، روی دکمه زیر کلیک کنید</p>
        <a href="${fallbackUrl}" class="button" id="fallbackBtn">باز کردن در مرورگر</a>
    </div>

    <script>
        // Attempt to open the app
        let appOpened = false;

        /**
         * Try to open the app using multiple methods
         */
        function tryOpenApp() {
            // Method 1: Use iframe (for older iOS)
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = '${deepLink}';
            document.body.appendChild(iframe);

            // Method 2: Use window.location
            setTimeout(() => {
                if (!appOpened) {
                    window.location = '${deepLink}';
                }
            }, 25);

            // After 2 seconds, redirect to fallback if still on page
            setTimeout(() => {
                if (document.hidden || document.webkitHidden) {
                    appOpened = true;
                } else {
                    // App didn't open, redirect to fallback
                    window.location = '${fallbackUrl}';
                }
            }, 2000);
        }

        // Start app opening process after page load
        window.addEventListener('load', () => {
            tryOpenApp();
        });

        // If user clicks fallback button
        document.getElementById('fallbackBtn').addEventListener('click', (e) => {
            appOpened = true;
        });

        // Detect if we left the page (app opened)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                appOpened = true;
            }
        });
    </script>
</body>
</html>
  `;
}

/**
 * Add a new platform configuration
 *
 * @param {string} name - Platform name
 * @param {Object} config - Platform configuration
 * @param {RegExp} config.regex - URL pattern to match
 * @param {Function} config.deepLinkTemplate - Function to generate deep link
 * @param {Function} config.fallback - Function to generate fallback URL
 */
function addPlatform(name, config) {
  platforms[name] = config;
}

module.exports = {
  detectPlatform,
  generateIntermediateHTML,
  addPlatform,
  platforms
};
