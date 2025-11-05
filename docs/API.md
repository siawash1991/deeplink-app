# 📚 API Documentation

Complete API reference for Deep Link Shortener.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

Currently, the API is public and doesn't require authentication. Future versions will support API keys and OAuth.

---

## Endpoints

### 1. Create Short Link

Create a shortened URL with deep linking support.

**Endpoint**: `POST /api/shorten`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "url": "https://youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ",
  "platform": "youtube",
  "shortCode": "abc123"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "URL is required"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Unsupported platform. Currently supporting YouTube and Instagram."
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url":"https://youtube.com/watch?v=dQw4w9WgXcQ"}'
```

**JavaScript Example**:
```javascript
const response = await fetch('http://localhost:3000/api/shorten', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
  })
});

const data = await response.json();
console.log(data.shortUrl);
```

---

### 2. Get Link Statistics

Get detailed statistics for a shortened link.

**Endpoint**: `GET /api/stats/:shortCode`

**Parameters**:
- `shortCode` (path parameter): The short code of the link

**Response** (200 OK):
```json
{
  "success": true,
  "shortCode": "abc123",
  "originalUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ",
  "platform": "youtube",
  "totalClicks": 150,
  "createdAt": "2025-11-05T10:30:00.000Z",
  "clicksByDay": {
    "2025-11-05": 50,
    "2025-11-06": 100
  },
  "deviceBreakdown": {
    "iOS": 80,
    "Android": 60,
    "Windows": 10
  },
  "topCountries": {}
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "Link not found"
}
```

**cURL Example**:
```bash
curl http://localhost:3000/api/stats/abc123
```

**JavaScript Example**:
```javascript
const response = await fetch('http://localhost:3000/api/stats/abc123');
const data = await response.json();
console.log(`Total clicks: ${data.totalClicks}`);
```

---

### 3. List All Links

Get a paginated list of all shortened links.

**Endpoint**: `GET /api/links`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response** (200 OK):
```json
{
  "success": true,
  "links": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "shortCode": "abc123",
      "originalUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ",
      "platform": "youtube",
      "clicks": 150,
      "createdAt": "2025-11-05T10:30:00.000Z",
      "updatedAt": "2025-11-05T15:45:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

**cURL Example**:
```bash
curl "http://localhost:3000/api/links?page=1&limit=10"
```

**JavaScript Example**:
```javascript
const response = await fetch('http://localhost:3000/api/links?page=1&limit=10');
const data = await response.json();
console.log(`Found ${data.pagination.total} links`);
```

---

### 4. Delete Link

Delete a shortened link.

**Endpoint**: `DELETE /api/links/:shortCode`

**Parameters**:
- `shortCode` (path parameter): The short code of the link to delete

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Link deleted successfully"
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "Link not found"
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:3000/api/links/abc123
```

**JavaScript Example**:
```javascript
const response = await fetch('http://localhost:3000/api/links/abc123', {
  method: 'DELETE'
});
const data = await response.json();
console.log(data.message);
```

---

### 5. Redirect to Original URL

Access a shortened link and get redirected with deep linking.

**Endpoint**: `GET /:shortCode`

**Parameters**:
- `shortCode` (path parameter): The short code of the link

**Response**:
- Returns HTML page that attempts to open the app
- If app is not installed, redirects to web version

**Behavior**:
1. Increments click counter
2. Saves analytics data
3. Attempts to open native app
4. Falls back to web version after 2 seconds

**Example**:
```
http://localhost:3000/abc123
→ Opens YouTube app (if installed)
→ Or redirects to YouTube website
```

---

### 6. Health Check

Check if the server is running.

**Endpoint**: `GET /health`

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

**cURL Example**:
```bash
curl http://localhost:3000/health
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Applies to**: `/api/*` routes

**Rate Limit Headers**:
```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1699012345
```

**Rate Limit Exceeded Response** (429):
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Supported Platforms

Currently supported platforms for deep linking:

### YouTube

**URL Patterns**:
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`

**Deep Link**: `vnd.youtube://watch/VIDEO_ID`

### Instagram

**URL Patterns**:
- `https://instagram.com/p/POST_ID`
- `https://instagram.com/reel/REEL_ID`
- `https://instagram.com/tv/TV_ID`

**Deep Link**: `instagram://media?id=POST_ID`

---

## Examples

### Complete Workflow Example

```javascript
// 1. Create a short link
const createResponse = await fetch('http://localhost:3000/api/shorten', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
  })
});

const { shortUrl, shortCode } = await createResponse.json();
console.log('Short URL:', shortUrl);

// 2. Share the short URL with users
// Users click on: http://localhost:3000/abc123

// 3. Check statistics
const statsResponse = await fetch(`http://localhost:3000/api/stats/${shortCode}`);
const stats = await statsResponse.json();
console.log('Total clicks:', stats.totalClicks);

// 4. Delete the link when done
await fetch(`http://localhost:3000/api/links/${shortCode}`, {
  method: 'DELETE'
});
```

---

## SDK Examples

### Node.js SDK (Example)

```javascript
class DeepLinkClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async shorten(url) {
    const response = await fetch(`${this.baseUrl}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return response.json();
  }

  async getStats(shortCode) {
    const response = await fetch(`${this.baseUrl}/api/stats/${shortCode}`);
    return response.json();
  }

  async delete(shortCode) {
    const response = await fetch(`${this.baseUrl}/api/links/${shortCode}`, {
      method: 'DELETE'
    });
    return response.json();
  }
}

// Usage
const client = new DeepLinkClient('http://localhost:3000');
const result = await client.shorten('https://youtube.com/watch?v=...');
```

---

## Webhooks (Future Feature)

Coming soon: Webhook support for link events.

```json
{
  "event": "link.clicked",
  "data": {
    "shortCode": "abc123",
    "clicks": 151,
    "timestamp": "2025-11-05T10:30:00.000Z"
  }
}
```

---

## Postman Collection

Import this collection to test the API in Postman:

```json
{
  "info": {
    "name": "Deep Link Shortener API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Short Link",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"url\": \"https://youtube.com/watch?v=dQw4w9WgXcQ\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/shorten",
          "host": ["{{base_url}}"],
          "path": ["api", "shorten"]
        }
      }
    }
  ]
}
```

---

## Support

For API support:
- 📧 Email: api@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/deep-link-shortener/issues)
- 📖 Docs: [Full Documentation](https://github.com/yourusername/deep-link-shortener)
