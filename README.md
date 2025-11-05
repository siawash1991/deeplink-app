# 🚀 Deep Link Shortener

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Build](https://img.shields.io/badge/build-passing-success.svg)

یک سرویس **Open Source** برای ایجاد لینک‌های کوتاه که مستقیماً اپلیکیشن‌های موبایل را باز می‌کنند

[English](#) | [فارسی](#)

</div>

---

## 📋 فهرست مطالب

- [درباره پروژه](#-درباره-پروژه)
- [ویژگی‌ها](#-ویژگی‌ها)
- [دمو](#-دمو)
- [نصب و راه‌اندازی](#-نصب-و-راه‌اندازی)
- [استفاده](#-استفاده)
- [API Documentation](#-api-documentation)
- [معماری](#-معماری)
- [توسعه](#-توسعه)
- [Deployment](#-deployment)
- [مشارکت](#-مشارکت)
- [لایسنس](#-لایسنس)

---

## 🎯 درباره پروژه

**Deep Link Shortener** یک سرویس کوتاه‌کننده لینک هوشمند است که به شما امکان می‌دهد لینک‌های یوتوب، اینستاگرام و سایر پلتفرم‌ها را تبدیل به لینک‌هایی کنید که:

- ✅ مستقیماً اپلیکیشن موبایل را باز می‌کنند (اگر نصب باشد)
- ✅ در غیر این صورت به نسخه وب هدایت می‌شوند
- ✅ آمار دقیق از کلیک‌ها و باز شدن اپ ارائه می‌دهند

### چرا Deep Link Shortener؟

🎬 **برای Content Creator ها**: افزایش engagement با باز کردن مستقیم اپ
📊 **برای Marketer ها**: آمار دقیق از نحوه مشاهده محتوا
📱 **برای توسعه‌دهندگان**: API کامل و قابل توسعه
🔒 **برای همه**: امن، سریع و رایگان

---

## ✨ ویژگی‌ها

### 🎯 ویژگی‌های اصلی

- **Deep Linking هوشمند**
  - تشخیص خودکار پلتفرم (YouTube, Instagram)
  - باز کردن مستقیم اپلیکیشن
  - Fallback به نسخه وب

- **کوتاه‌سازی لینک**
  - تولید کد کوتاه یونیک
  - لینک‌های قابل اشتراک‌گذاری
  - مدیریت ساده لینک‌ها

- **Analytics پیشرفته**
  - آمار بلادرنگ
  - تشخیص دستگاه و مرورگر
  - نمودار کلیک‌ها بر اساس زمان
  - نرخ باز شدن اپلیکیشن

- **RESTful API**
  - مستندات کامل
  - Rate limiting
  - پاسخ‌های JSON استاندارد

### 🔒 امنیت

- Helmet.js برای امنیت headers
- Rate limiting برای جلوگیری از spam
- CORS configuration
- Input validation
- Environment variables

### ⚡ Performance

- Compression middleware
- Database indexing
- Efficient queries
- Static file caching

---

## 🎬 دمو

### Dashboard

![Dashboard](https://via.placeholder.com/800x400/667eea/ffffff?text=Dashboard+Screenshot)

### API Usage

```bash
# ایجاد لینک کوتاه
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url":"https://youtube.com/watch?v=dQw4w9WgXcQ"}'

# پاسخ:
{
  "success": true,
  "shortUrl": "http://localhost:3000/abc123",
  "platform": "youtube"
}
```

---

## 🛠️ نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 14+ ([دانلود](https://nodejs.org/))
- MongoDB ([دانلود](https://www.mongodb.com/try/download/community))
- Git ([دانلود](https://git-scm.com/))

### نصب سریع

```bash
# 1. Clone repository
git clone https://github.com/yourusername/deep-link-shortener.git
cd deep-link-shortener

# 2. نصب dependencies
npm install

# 3. تنظیم environment variables
cp .env.example .env
# فایل .env را ویرایش کنید

# 4. راه‌اندازی MongoDB
# در یک terminal جدید:
mongod

# 5. اجرای سرور
npm run dev
```

سرور روی `http://localhost:3000` اجرا می‌شود! 🎉

### نصب با Docker

```bash
# با Docker Compose
docker-compose up -d

# یا با Docker
docker build -t deep-link-shortener .
docker run -p 3000:3000 --env-file .env deep-link-shortener
```

---

## 📖 استفاده

### Dashboard (رابط کاربری)

1. به `http://localhost:3000` بروید
2. لینک یوتوب یا اینستاگرام خود را وارد کنید
3. روی "کوتاه کردن لینک" کلیک کنید
4. لینک کوتاه خود را کپی کنید

### API

#### ایجاد لینک کوتاه

```javascript
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

#### دریافت آمار

```javascript
const response = await fetch('http://localhost:3000/api/stats/abc123');
const stats = await response.json();

console.log(stats.totalClicks); // 150
console.log(stats.clicksByDay); // { "2025-11-05": 50, ... }
```

مستندات کامل API: [docs/API.md](docs/API.md)

---

## 🏗️ معماری

### ساختار پروژه

```
deep-link-shortener/
├── src/
│   ├── server.js           # Entry point
│   ├── models/
│   │   └── Link.js         # Mongoose model
│   ├── routes/
│   │   ├── api.js          # API endpoints
│   │   └── redirect.js     # Redirect logic
│   ├── utils/
│   │   ├── deeplink.js     # Deep linking utilities
│   │   └── analytics.js    # Analytics functions
│   └── config/
│       └── database.js     # Database config
├── public/
│   ├── index.html          # Dashboard UI
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── tests/                  # Jest tests
├── docs/                   # Documentation
├── .github/                # GitHub templates
└── docker-compose.yml      # Docker setup
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Frontend | Vanilla JavaScript |
| Security | Helmet, Rate Limiting |
| Testing | Jest + Supertest |
| DevOps | Docker, GitHub Actions |

مستندات معماری: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 👨‍💻 توسعه

### Setup محیط توسعه

```bash
# نصب dependencies
npm install

# اجرا در development mode
npm run dev

# اجرای تست‌ها
npm test

# اجرای تست‌ها با watch mode
npm run test:watch

# Linting
npm run lint

# Format کردن کد
npm run format
```

### اضافه کردن پلتفرم جدید

```javascript
// src/utils/deeplink.js

const { addPlatform } = require('./utils/deeplink');

addPlatform('spotify', {
  regex: /spotify\.com\/track\/([\w]+)/,
  deepLinkTemplate: (id) => `spotify://track/${id}`,
  fallback: (id) => `https://open.spotify.com/track/${id}`
});
```

### نوشتن تست

```javascript
// tests/myfeature.test.js

describe('My Feature', () => {
  it('should work correctly', async () => {
    // Test implementation
  });
});
```

راهنمای مشارکت: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🚀 Deployment

### Heroku

```bash
heroku create your-app-name
heroku addons:create mongolab:sandbox
git push heroku main
```

### DigitalOcean

```bash
# SSH to server
ssh root@your-server-ip

# Clone and setup
git clone https://github.com/yourusername/deep-link-shortener.git
cd deep-link-shortener
npm install --production
pm2 start src/server.js
```

### Docker

```bash
docker-compose up -d
```

راهنمای کامل Deployment: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 📊 پلتفرم‌های پشتیبانی شده

| Platform | Deep Link | Status |
|----------|-----------|--------|
| YouTube | `vnd.youtube://` | ✅ |
| Instagram | `instagram://` | ✅ |
| TikTok | `snssdk1233://` | 🔜 |
| Twitter | `twitter://` | 🔜 |
| Spotify | `spotify://` | 🔜 |

---

## 🗺️ Roadmap

- [x] YouTube & Instagram support
- [x] Basic analytics
- [x] RESTful API
- [x] Docker support
- [ ] Custom short URLs
- [ ] QR Code generation
- [ ] User authentication
- [ ] Advanced dashboard
- [ ] More platforms (TikTok, Twitter, Spotify)
- [ ] Webhooks
- [ ] GraphQL API

[ROADMAP کامل](docs/ROADMAP.md)

---

## 🤝 مشارکت

مشارکت‌ها همیشه خوش‌آمدند! 🎉

1. Fork کنید
2. Branch بسازید (`git checkout -b feature/amazing-feature`)
3. تغییرات را commit کنید
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request باز کنید

[راهنمای مشارکت](CONTRIBUTING.md)

### Contributors

<a href="https://github.com/yourusername/deep-link-shortener/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yourusername/deep-link-shortener" />
</a>

---

## 📝 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است. برای جزئیات بیشتر [LICENSE](LICENSE) را مطالعه کنید.

---

## 🙏 تشکر

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/)
- همه contributors عزیز! ❤️

---

## 📧 پشتیبانی

سوالی دارید؟ راه‌های ارتباطی:

- 🐛 [GitHub Issues](https://github.com/yourusername/deep-link-shortener/issues)
- 💬 [GitHub Discussions](https://github.com/yourusername/deep-link-shortener/discussions)
- 📧 Email: support@example.com

---

<div align="center">

**ساخته شده با ❤️ توسط [Your Name](https://github.com/yourusername)**

اگر این پروژه به شما کمک کرد، یک ⭐ بدید!

</div>
