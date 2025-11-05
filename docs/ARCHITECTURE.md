# 🏗️ Architecture Documentation

This document describes the architecture and design decisions of the Deep Link Shortener project.

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Component Design](#component-design)
- [Data Flow](#data-flow)
- [Database Schema](#database-schema)
- [API Design](#api-design)
- [Security Architecture](#security-architecture)
- [Deep Linking Mechanism](#deep-linking-mechanism)

---

## Overview

Deep Link Shortener is a URL shortening service with deep linking capabilities. It allows users to create short URLs that automatically open mobile apps when available, falling back to web versions when not.

### Key Features

- URL shortening
- Deep linking (app opening)
- Analytics tracking
- RESTful API
- Responsive dashboard

### Technology Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Frontend**: Vanilla JavaScript + HTML + CSS
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest
- **Containerization**: Docker

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │   API Client │      │
│  │  Dashboard   │  │    Device    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Express.js Application                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │  Routes  │  │  Models  │  │  Utils   │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              MongoDB Database                         │  │
│  │  ┌────────────┐                                       │  │
│  │  │   Links    │  (Collections)                        │  │
│  │  └────────────┘                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Diagram

```
src/
├── server.js           # Application entry point
├── models/
│   └── Link.js         # Link data model
├── routes/
│   ├── api.js          # API endpoints
│   └── redirect.js     # Redirect logic
├── utils/
│   ├── deeplink.js     # Deep linking utilities
│   └── analytics.js    # Analytics processing
└── config/
    └── database.js     # Database configuration
```

---

## Component Design

### 1. Server (src/server.js)

**Responsibilities**:
- Initialize Express application
- Configure middleware
- Register routes
- Connect to database
- Handle errors

**Key Middleware**:
- `helmet`: Security headers
- `cors`: Cross-origin requests
- `express-rate-limit`: Rate limiting
- `morgan`: Request logging
- `compression`: Response compression

### 2. Models (src/models/)

#### Link Model

```javascript
{
  shortCode: String,      // Unique identifier
  originalUrl: String,    // Original URL
  platform: String,       // Platform (youtube, instagram, etc.)
  clicks: Number,         // Total clicks
  createdAt: Date,        // Creation timestamp
  updatedAt: Date,        // Last update timestamp
  analytics: [{           // Analytics entries
    timestamp: Date,
    userAgent: String,
    ip: String,
    device: String,
    appOpened: Boolean
  }]
}
```

**Methods**:
- `getStats()`: Calculate and return statistics

### 3. Routes (src/routes/)

#### API Routes (api.js)

- `POST /api/shorten`: Create short link
- `GET /api/stats/:shortCode`: Get link statistics
- `GET /api/links`: List all links (paginated)
- `DELETE /api/links/:shortCode`: Delete link

#### Redirect Routes (redirect.js)

- `GET /:shortCode`: Handle redirect with deep linking

### 4. Utils (src/utils/)

#### Deep Link Utilities (deeplink.js)

**Functions**:
- `detectPlatform(url)`: Detect platform from URL
- `generateIntermediateHTML(...)`: Create deep linking page
- `addPlatform(name, config)`: Add new platform support

#### Analytics Utilities (analytics.js)

**Functions**:
- `parseUserAgent(ua)`: Parse user agent string
- `createAnalyticsEntry(req)`: Create analytics entry
- `calculateStats(analytics)`: Calculate statistics
- `getTopN(counts, n)`: Get top N items
- `getDateRangeStats(...)`: Filter by date range

### 5. Config (src/config/)

#### Database Configuration (database.js)

**Functions**:
- `connectDatabase(uri)`: Connect to MongoDB
- `closeDatabase()`: Close connection

**Features**:
- Connection event handling
- Graceful shutdown
- Error handling

---

## Data Flow

### Creating a Short Link

```
1. User enters URL in dashboard
   ↓
2. POST /api/shorten request
   ↓
3. Validate URL
   ↓
4. Detect platform (YouTube, Instagram, etc.)
   ↓
5. Generate unique short code
   ↓
6. Save to database
   ↓
7. Return short URL to user
```

### Accessing a Short Link

```
1. User clicks short link
   ↓
2. GET /:shortCode request
   ↓
3. Find link in database
   ↓
4. Update click counter
   ↓
5. Save analytics data
   ↓
6. Detect platform
   ↓
7. Generate deep link URL
   ↓
8. Return intermediate HTML
   ↓
9. JavaScript attempts to open app
   ↓
10a. App installed → Open app
10b. App not installed → Redirect to web
```

---

## Database Schema

### Links Collection

```javascript
{
  _id: ObjectId,
  shortCode: {
    type: String,
    unique: true,
    index: true
  },
  originalUrl: String,
  platform: {
    type: String,
    enum: ['youtube', 'instagram', 'other'],
    index: true
  },
  clicks: Number,
  createdAt: {
    type: Date,
    index: true
  },
  updatedAt: Date,
  analytics: [{
    timestamp: Date,
    userAgent: String,
    ip: String,
    device: String,
    browser: String,
    os: String,
    isBot: Boolean,
    appOpened: Boolean
  }]
}
```

### Indexes

- `shortCode`: Unique index for fast lookups
- `createdAt`: Index for sorting and date queries
- `platform`: Index for filtering by platform

---

## API Design

### RESTful Principles

- Use HTTP methods correctly (GET, POST, DELETE)
- Use proper status codes
- Return consistent JSON responses
- Version API if needed (future)

### Response Format

**Success**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Pagination

```json
{
  "success": true,
  "links": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

## Security Architecture

### Security Layers

1. **HTTP Headers** (Helmet)
   - Content Security Policy
   - X-Frame-Options
   - X-Content-Type-Options
   - Strict-Transport-Security

2. **Rate Limiting**
   - 100 requests per 15 minutes per IP
   - Applied to API routes

3. **Input Validation**
   - URL validation
   - Required field checks
   - Type checking

4. **CORS**
   - Configurable origins
   - Credentials support

5. **Database Security**
   - Mongoose schema validation
   - NoSQL injection prevention
   - Connection string in environment variables

### Authentication (Future)

```
┌─────────┐         ┌─────────┐         ┌──────────┐
│ Client  │ ──JWT──>│  Server │ ──────> │ Database │
└─────────┘         └─────────┘         └──────────┘
```

---

## Deep Linking Mechanism

### Platform Detection

```javascript
const platforms = {
  youtube: {
    regex: /youtube\.com\/watch\?v=([\w-]+)/,
    deepLink: (id) => `vnd.youtube://watch/${id}`,
    fallback: (id) => `https://youtube.com/watch?v=${id}`
  }
};
```

### App Opening Strategy

```javascript
// Method 1: iframe (iOS compatibility)
<iframe src="app-scheme://..."></iframe>

// Method 2: window.location
window.location = "app-scheme://...";

// Method 3: Timeout fallback
setTimeout(() => {
  if (!appOpened) {
    window.location = "https://fallback-url";
  }
}, 2000);
```

### Detection Logic

```javascript
// Detect if app opened
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    appOpened = true; // User left the page (app opened)
  }
});
```

---

## Scalability Considerations

### Current Architecture

- Single server instance
- Direct MongoDB connection
- Suitable for small to medium traffic

### Scaling Strategies

1. **Horizontal Scaling**
   ```
   Load Balancer
        │
   ┌────┼────┬────┐
   │    │    │    │
   App  App  App  App
   │    │    │    │
   └────┼────┴────┘
        │
    MongoDB Cluster
   ```

2. **Caching Layer**
   - Redis for frequently accessed links
   - Reduce database load
   - Faster response times

3. **CDN**
   - Serve static files
   - Reduce server load
   - Improve global performance

4. **Database Optimization**
   - Sharding for large datasets
   - Read replicas for analytics
   - Archiving old data

---

## Performance Optimization

### Current Optimizations

- Compression middleware
- Database indexes
- Efficient queries
- Static file serving

### Future Optimizations

- Caching frequently accessed links
- Database query optimization
- Connection pooling
- Lazy loading for dashboard

---

## Monitoring & Logging

### Current Logging

- Morgan for HTTP request logging
- Console logging for errors
- Environment-based log levels

### Future Monitoring

- Application metrics (response time, error rate)
- Database metrics (query performance)
- System metrics (CPU, memory)
- Alert system for errors

---

## Deployment Architecture

### Development

```
Developer → Local Server → Local MongoDB
```

### Production

```
Users → Load Balancer → App Servers → MongoDB Cluster
                ↓
           Log Aggregator
                ↓
           Monitoring System
```

---

## Design Decisions

### Why Node.js + Express?

- Fast and lightweight
- Great for I/O operations
- Large ecosystem
- Easy deployment

### Why MongoDB?

- Flexible schema
- Great for analytics data
- Good performance
- Easy to scale

### Why Vanilla JS for Frontend?

- No build step
- Lightweight
- Easy to understand
- Fast loading

### Why Modular Structure?

- Separation of concerns
- Easy to maintain
- Easy to test
- Easy to scale

---

## Future Enhancements

1. **Microservices Architecture**
   - Separate analytics service
   - Separate auth service
   - Better scalability

2. **Real-time Features**
   - WebSocket for live analytics
   - Real-time dashboard updates

3. **Advanced Analytics**
   - Machine learning for predictions
   - Anomaly detection
   - User behavior analysis

---

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for how to contribute to this project.
