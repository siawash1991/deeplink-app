// server.js - سرور اصلی Deep Link Shortener

const express = require('express');
const deeplink = require('node-deeplink');
const shortid = require('shortid');
const mongoose = require('mongoose');
const useragent = require('user-agent');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ═══════════════════════════════════════════════════════════════
// 📊 مدل دیتابیس برای ذخیره لینک‌ها
// ═══════════════════════════════════════════════════════════════

const linkSchema = new mongoose.Schema({
  shortCode: { type: String, unique: true, required: true },
  originalUrl: { type: String, required: true },
  platform: { type: String, required: true }, // 'youtube', 'instagram', etc.
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  analytics: [{
    timestamp: Date,
    userAgent: String,
    ip: String,
    country: String,
    device: String,
    appOpened: Boolean
  }]
});

const Link = mongoose.model('Link', linkSchema);

// ═══════════════════════════════════════════════════════════════
// 🔧 تابع تشخیص پلتفرم و استخراج اطلاعات
// ═══════════════════════════════════════════════════════════════

function detectPlatform(url) {
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
    // می‌توانید پلتفرم‌های دیگر را اضافه کنید
  };

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

// ═══════════════════════════════════════════════════════════════
// 🎯 API: کوتاه کردن لینک
// ═══════════════════════════════════════════════════════════════

app.post('/api/shorten', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // تشخیص پلتفرم
    const platformInfo = detectPlatform(url);
    
    if (!platformInfo) {
      return res.status(400).json({ 
        error: 'Unsupported platform. Currently supporting YouTube and Instagram.' 
      });
    }

    // ایجاد کد کوتاه یونیک
    const shortCode = shortid.generate();

    // ذخیره در دیتابیس
    const link = new Link({
      shortCode,
      originalUrl: url,
      platform: platformInfo.platform
    });

    await link.save();

    // بازگشت لینک کوتاه
    const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
    
    res.json({
      success: true,
      shortUrl,
      originalUrl: url,
      platform: platformInfo.platform
    });

  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// 🔀 Redirect Handler با Deep Linking
// ═══════════════════════════════════════════════════════════════

app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // پیدا کردن لینک در دیتابیس
    const link = await Link.findOne({ shortCode });

    if (!link) {
      return res.status(404).send('Link not found');
    }

    // آپدیت شمارنده کلیک
    link.clicks += 1;

    // ذخیره اطلاعات Analytics
    const ua = useragent.parse(req.headers['user-agent']);
    link.analytics.push({
      timestamp: new Date(),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      device: ua.os.toString(),
      appOpened: false // این را بعداً با JavaScript tracking آپدیت می‌کنیم
    });

    await link.save();

    // استخراج اطلاعات پلتفرم
    const platformInfo = detectPlatform(link.originalUrl);

    if (!platformInfo) {
      return res.redirect(link.originalUrl);
    }

    const { platform, id, config } = platformInfo;

    // تولید Deep Link و Fallback URL
    const deepLink = config.deepLinkTemplate(id);
    const fallbackUrl = config.fallback(id);

    // ارسال صفحه HTML واسط که تلاش می‌کند اپ را باز کند
    res.send(generateIntermediateHTML(deepLink, fallbackUrl, platform));

  } catch (error) {
    console.error('Error handling redirect:', error);
    res.status(500).send('Internal server error');
  }
});

// ═══════════════════════════════════════════════════════════════
// 🎨 تولید HTML واسط برای Deep Linking
// ═══════════════════════════════════════════════════════════════

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
        // تلاش برای باز کردن اپ
        let appOpened = false;
        
        // تابعی که تلاش می‌کند اپ را باز کند
        function tryOpenApp() {
            // تلاش 1: استفاده از iframe (برای iOS قدیمی‌تر)
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = '${deepLink}';
            document.body.appendChild(iframe);
            
            // تلاش 2: استفاده از window.location
            setTimeout(() => {
                if (!appOpened) {
                    window.location = '${deepLink}';
                }
            }, 25);
            
            // پس از 2 ثانیه، اگر هنوز در صفحه هستیم، به مرورگر redirect می‌کنیم
            setTimeout(() => {
                if (document.hidden || document.webkitHidden) {
                    appOpened = true;
                } else {
                    // اپ باز نشد، به fallback می‌ریم
                    window.location = '${fallbackUrl}';
                }
            }, 2000);
        }
        
        // شروع فرآیند باز کردن اپ بعد از لود شدن صفحه
        window.addEventListener('load', () => {
            tryOpenApp();
        });
        
        // اگر کاربر روی دکمه fallback کلیک کرد
        document.getElementById('fallbackBtn').addEventListener('click', (e) => {
            appOpened = true;
        });
        
        // تشخیص اینکه آیا از صفحه خارج شدیم (یعنی اپ باز شد)
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

// ═══════════════════════════════════════════════════════════════
// 📊 API: دریافت آمار لینک
// ═══════════════════════════════════════════════════════════════

app.get('/api/stats/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const link = await Link.findOne({ shortCode });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // محاسبه آمار
    const stats = {
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      platform: link.platform,
      totalClicks: link.clicks,
      createdAt: link.createdAt,
      clicksByDay: {},
      deviceBreakdown: {},
      topCountries: {}
    };

    // پردازش analytics
    link.analytics.forEach(entry => {
      const day = entry.timestamp.toISOString().split('T')[0];
      stats.clicksByDay[day] = (stats.clicksByDay[day] || 0) + 1;
      
      stats.deviceBreakdown[entry.device] = (stats.deviceBreakdown[entry.device] || 0) + 1;
    });

    res.json(stats);

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// 🚀 راه‌اندازی سرور
// ═══════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;

// اتصال به MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/deeplink-shortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Test the API:
    - Shorten: POST http://localhost:${PORT}/api/shorten
    - Access: GET http://localhost:${PORT}/{shortCode}
    - Stats: GET http://localhost:${PORT}/api/stats/{shortCode}
    `);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

module.exports = app;
