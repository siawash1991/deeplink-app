/**
 * API Routes Tests
 */

const request = require('supertest');
const app = require('../src/server');
const Link = require('../src/models/Link');

describe('API Endpoints', () => {
  describe('POST /api/shorten', () => {
    it('should shorten a valid YouTube URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.shortUrl).toBeDefined();
      expect(response.body.platform).toBe('youtube');
      expect(response.body.shortCode).toBeDefined();
    });

    it('should shorten a valid Instagram URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://instagram.com/p/ABC123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.platform).toBe('instagram');
    });

    it('should reject missing URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('URL is required');
    });

    it('should reject unsupported platform', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Unsupported platform');
    });

    it('should create unique short codes', async () => {
      const response1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://youtube.com/watch?v=abc' });

      const response2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://youtube.com/watch?v=xyz' });

      expect(response1.body.shortCode).not.toBe(response2.body.shortCode);
    });
  });

  describe('GET /api/stats/:shortCode', () => {
    it('should return stats for existing link', async () => {
      // Create a link first
      const link = await Link.create({
        shortCode: 'test123',
        originalUrl: 'https://youtube.com/watch?v=test',
        platform: 'youtube',
        clicks: 10
      });

      const response = await request(app)
        .get(`/api/stats/${link.shortCode}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.shortCode).toBe('test123');
      expect(response.body.totalClicks).toBe(10);
    });

    it('should return 404 for non-existent link', async () => {
      const response = await request(app)
        .get('/api/stats/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Link not found');
    });
  });

  describe('GET /api/links', () => {
    beforeEach(async () => {
      // Create multiple links
      await Link.create([
        {
          shortCode: 'abc1',
          originalUrl: 'https://youtube.com/watch?v=1',
          platform: 'youtube'
        },
        {
          shortCode: 'abc2',
          originalUrl: 'https://youtube.com/watch?v=2',
          platform: 'youtube'
        },
        {
          shortCode: 'abc3',
          originalUrl: 'https://instagram.com/p/3',
          platform: 'instagram'
        }
      ]);
    });

    it('should return paginated links', async () => {
      const response = await request(app)
        .get('/api/links?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.links).toHaveLength(2);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.pages).toBe(2);
    });

    it('should use default pagination values', async () => {
      const response = await request(app)
        .get('/api/links')
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('DELETE /api/links/:shortCode', () => {
    it('should delete existing link', async () => {
      const link = await Link.create({
        shortCode: 'delete123',
        originalUrl: 'https://youtube.com/watch?v=test',
        platform: 'youtube'
      });

      const response = await request(app)
        .delete(`/api/links/${link.shortCode}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Link deleted successfully');

      // Verify deletion
      const deletedLink = await Link.findOne({ shortCode: 'delete123' });
      expect(deletedLink).toBeNull();
    });

    it('should return 404 for non-existent link', async () => {
      const response = await request(app)
        .delete('/api/links/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.environment).toBe('test');
    });
  });
});
