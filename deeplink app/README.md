# 🚀 Deep Link Shortener - کوتاه‌کننده لینک هوشمند

یک سرویس Open Source برای ایجاد لینک‌های کوتاه که مستقیماً اپلیکیشن‌های موبایل را باز می‌کنند (YouTube, Instagram, و غیره)

## 📋 فهرست مطالب

- [ویژگی‌ها](#-ویژگی‌ها)
- [نحوه کار](#-نحوه-کار)
- [نصب و راه‌اندازی](#-نصب-و-راه‌اندازی)
- [استفاده](#-استفاده)
- [API Documentation](#-api-documentation)
- [توسعه و Customization](#-توسعه-و-customization)
- [Deployment](#-deployment)
- [ایده‌های توسعه](#-ایده‌های-توسعه)

---

## ✨ ویژگی‌ها

### 🎯 ویژگی‌های اصلی:
- ✅ **Deep Linking هوشمند**: باز کردن مستقیم اپلیکیشن‌ها (YouTube, Instagram)
- ✅ **کوتاه‌سازی لینک**: تبدیل لینک‌های طولانی به لینک‌های کوتاه و یادآوری آسان
- ✅ **User-Agent Detection**: تشخیص هوشمند دستگاه کاربر (iOS, Android, Desktop)
- ✅ **Analytics و Tracking**: آمارگیری دقیق از کلیک‌ها و عملکرد
- ✅ **Fallback Mechanism**: اگر اپ نصب نباشد، به مرورگر هدایت می‌شود
- ✅ **RESTful API**: API کامل برای یکپارچه‌سازی با سیستم‌های دیگر

### 📊 قابلیت‌های Analytics:
- تعداد کلیک‌ها
- نرخ باز شدن اپلیکیشن
- توزیع دستگاه‌ها (iOS, Android, Desktop)
- موقعیت جغرافیایی کاربران
- نمودار کلیک‌ها بر اساس زمان

---

## 🔧 نحوه کار

### معماری سیستم:

```
کاربر کلیک می‌کند
    ↓
سرور (Node.js)
    ↓
User-Agent Detection
    ↓
صفحه HTML واسط
    ↓
JavaScript سعی می‌کند اپ را باز کند
    ↓
┌─────────────┬─────────────┐
│   اپ نصب    │  اپ نصب     │
│   است ✓    │  نیست ✗    │
└─────────────┴─────────────┘
       ↓              ↓
   باز شدن اپ    مرورگر/App Store
```

### Deep Linking چگونه کار می‌کند؟

1. **URL Schemes**: هر اپ یک پروتکل خاص دارد
   ```
   YouTube:    youtube://watch/{video_id}
   Instagram:  instagram://media?id={post_id}
   ```

2. **Platform Detection**: سیستم عامل را تشخیص می‌دهد

3. **App Opening Attempt**: 
   - JavaScript سعی می‌کند با URL Scheme اپ را باز کند
   - اگر موفق شد → اپ باز می‌شود
   - اگر نه → به fallback URL هدایت می‌شود

---

## 🛠️ نصب و راه‌اندازی

### پیش‌نیازها:
- Node.js (نسخه 14 یا بالاتر)
- MongoDB (برای ذخیره‌سازی داده)
- Git

### مراحل نصب:

#### 1. Clone کردن Repository:
```bash
git clone <your-repo-url>
cd deep-link-shortener
```

#### 2. نصب Dependencies:
```bash
npm install
```

#### 3. تنظیمات محیطی:
فایل `.env` بسازید:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/deeplink-shortener

# Domain (برای production)
DOMAIN=https://yourdomain.com

# Optional: Analytics
GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
```

#### 4. راه‌اندازی MongoDB:
```bash
# Local
mongod

# یا با Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

#### 5. اجرای سرور:
```bash
# Development
npm run dev

# Production
npm start
```

سرور روی `http://localhost:3000` اجرا می‌شود.

---

## 📖 استفاده

### روش 1: استفاده از Dashboard

1. به `http://localhost:3000` بروید
2. لینک یوتوب یا اینستاگرام خود را paste کنید
3. روی "کوتاه کردن لینک" کلیک کنید
4. لینک کوتاه خود را کپی و به اشتراک بگذارید

### روش 2: استفاده از API

```javascript
// کوتاه کردن لینک
const response = await fetch('http://localhost:3000/api/shorten', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
  })
});

const data = await response.json();
console.log(data.shortUrl); // http://localhost:3000/abc123
```

---

## 📚 API Documentation

### POST `/api/shorten`
کوتاه کردن یک لینک

**Request Body:**
```json
{
  "url": "https://youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "success": true,
  "shortUrl": "http://yourdomain.com/abc123",
  "originalUrl": "https://youtube.com/watch?v=VIDEO_ID",
  "platform": "youtube"
}
```

### GET `/:shortCode`
Redirect به لینک اصلی با Deep Link

**مثال:**
```
GET http://yourdomain.com/abc123
→ باز می‌کند اپ یوتوب یا redirect به youtube.com
```

### GET `/api/stats/:shortCode`
دریافت آمار یک لینک

**Response:**
```json
{
  "shortCode": "abc123",
  "originalUrl": "https://youtube.com/watch?v=...",
  "platform": "youtube",
  "totalClicks": 150,
  "clicksByDay": {
    "2025-01-01": 50,
    "2025-01-02": 100
  },
  "deviceBreakdown": {
    "iOS": 80,
    "Android": 60,
    "Other": 10
  }
}
```

---

## 🎨 توسعه و Customization

### اضافه کردن پلتفرم جدید:

در فایل `server.js`، تابع `detectPlatform` را ویرایش کنید:

```javascript
const platforms = {
  // ... پلتفرم‌های موجود
  
  spotify: {
    regex: /spotify\.com\/track\/([\w]+)/,
    deepLinkTemplate: (trackId) => `spotify://track/${trackId}`,
    fallback: (trackId) => `https://open.spotify.com/track/${trackId}`
  },
  
  tiktok: {
    regex: /tiktok\.com\/@[\w]+\/video\/([\w]+)/,
    deepLinkTemplate: (videoId) => `snssdk1233://video/${videoId}`,
    fallback: (videoId) => `https://tiktok.com/.../${videoId}`
  }
};
```

### تغییر طراحی صفحه واسط:

فایل `generateIntermediateHTML` را در `server.js` ویرایش کنید.

### اضافه کردن Authentication:

```javascript
const jwt = require('jsonwebtoken');

// Middleware برای احراز هویت
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// محافظت از API
app.post('/api/shorten', authenticate, async (req, res) => {
  // ... کد موجود
});
```

---

## 🌐 Deployment

### Option 1: Heroku

```bash
# نصب Heroku CLI
npm install -g heroku

# Login و ایجاد app
heroku login
heroku create your-app-name

# اضافه کردن MongoDB addon
heroku addons:create mongolab:sandbox

# Deploy
git push heroku main

# باز کردن app
heroku open
```

### Option 2: Vercel

```bash
# نصب Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

### Option 3: VPS (DigitalOcean, AWS, etc.)

```bash
# نصب Node.js و MongoDB
sudo apt update
sudo apt install nodejs npm mongodb

# Clone و setup
git clone your-repo
cd your-repo
npm install

# استفاده از PM2 برای مدیریت process
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save

# Setup Nginx به عنوان reverse proxy
sudo nano /etc/nginx/sites-available/deeplink
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 💡 ایده‌های توسعه

### Phase 1: MVP (فعلی)
- ✅ Deep Linking برای YouTube و Instagram
- ✅ کوتاه‌سازی لینک
- ✅ Analytics اولیه

### Phase 2: ویژگی‌های اضافی
- 🔲 **Custom Short URLs**: امکان انتخاب short code دلخواه
- 🔲 **QR Code Generator**: تولید QR Code برای هر لینک
- 🔲 **Link Expiration**: تاریخ انقضا برای لینک‌ها
- 🔲 **Password Protection**: محافظت از لینک‌ها با رمز
- 🔲 **A/B Testing**: تست چند destination برای یک لینک

### Phase 3: پلتفرم حرفه‌ای
- 🔲 **User Accounts**: سیستم ثبت‌نام و لاگین
- 🔲 **Dashboard پیشرفته**: نمودارها و آمار تفصیلی
- 🔲 **Team Management**: امکان کار تیمی
- 🔲 **Webhook Integration**: اتصال به Zapier, IFTTT
- 🔲 **White Label**: امکان برندینگ شخصی
- 🔲 **API Rate Limiting**: محدودیت درخواست‌ها
- 🔲 **Custom Domains**: استفاده از دامنه شخصی

### Phase 4: Monetization
- 🔲 **Freemium Model**: پلن رایگان + پولی
- 🔲 **Analytics Pro**: آمار پیشرفته (UTM tracking, etc.)
- 🔲 **Pixel Integration**: Facebook Pixel, Google Analytics
- 🔲 **Retargeting**: امکان retargeting کاربران
- 🔲 **Affiliate Integration**: سیستم افیلیت مارکتینگ

### Phase 5: Scale
- 🔲 **CDN Integration**: سرعت بیشتر با Cloudflare
- 🔲 **Multi-region Deployment**: دیتاسنترهای متعدد
- 🔲 **Redis Caching**: کش کردن برای performance
- 🔲 **Load Balancing**: توزیع بار
- 🔲 **Microservices**: معماری میکروسرویس

---

## 🔐 امنیت

### Best Practices:
- ✅ Validation ورودی‌ها
- ✅ Rate Limiting برای جلوگیری از spam
- ✅ HTTPS (در production)
- ✅ Environment Variables برای اطلاعات حساس
- ✅ CORS Configuration
- ✅ XSS و SQL Injection Protection

```javascript
// اضافه کردن rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقیقه
  max: 100 // حداکثر 100 درخواست
});

app.use('/api/', limiter);
```

---

## 📝 License

MIT License - برای استفاده شخصی و تجاری آزاد هستید.

---

## 🤝 مشارکت

برای مشارکت در پروژه:
1. Fork کنید
2. Branch جدید بسازید (`git checkout -b feature/AmazingFeature`)
3. تغییرات را commit کنید
4. Push کنید (`git push origin feature/AmazingFeature`)
5. Pull Request باز کنید

---

## 📧 پشتیبانی

سوالات؟ ایمیل بزنید یا Issue باز کنید!

**ساخته شده با ❤️ با استفاده از Claude Code**
