/**
 * Analytics Utilities Tests
 */

const {
  parseUserAgent,
  createAnalyticsEntry,
  calculateStats,
  getTopN
} = require('../src/utils/analytics');

describe('Analytics Utilities', () => {
  describe('parseUserAgent', () => {
    it('should parse Chrome user agent', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0';
      const result = parseUserAgent(ua);

      expect(result.device).toBeDefined();
      expect(result.browser).toBeDefined();
      expect(result.os).toBeDefined();
      expect(result.isBot).toBe(false);
    });

    it('should detect bot user agent', () => {
      const ua = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
      const result = parseUserAgent(ua);

      expect(result.isBot).toBe(true);
    });

    it('should handle empty user agent', () => {
      const result = parseUserAgent('');

      expect(result.device).toBeDefined();
      expect(result.isBot).toBe(false);
    });
  });

  describe('createAnalyticsEntry', () => {
    it('should create analytics entry from request', () => {
      const mockReq = {
        headers: {
          'user-agent': 'Mozilla/5.0 Chrome/120.0.0.0'
        },
        ip: '127.0.0.1',
        connection: {
          remoteAddress: '127.0.0.1'
        }
      };

      const entry = createAnalyticsEntry(mockReq);

      expect(entry.timestamp).toBeInstanceOf(Date);
      expect(entry.userAgent).toBe(mockReq.headers['user-agent']);
      expect(entry.ip).toBe('127.0.0.1');
      expect(entry.device).toBeDefined();
      expect(entry.appOpened).toBe(false);
    });

    it('should handle missing user agent', () => {
      const mockReq = {
        headers: {},
        ip: '127.0.0.1',
        connection: {
          remoteAddress: '127.0.0.1'
        }
      };

      const entry = createAnalyticsEntry(mockReq);

      expect(entry.userAgent).toBeUndefined();
      expect(entry.device).toBeDefined();
    });
  });

  describe('calculateStats', () => {
    it('should calculate statistics from analytics data', () => {
      const analytics = [
        {
          timestamp: new Date('2025-11-05T10:00:00'),
          device: 'iOS',
          browser: 'Safari',
          os: 'iOS',
          appOpened: true
        },
        {
          timestamp: new Date('2025-11-05T11:00:00'),
          device: 'Android',
          browser: 'Chrome',
          os: 'Android',
          appOpened: false
        },
        {
          timestamp: new Date('2025-11-06T10:00:00'),
          device: 'iOS',
          browser: 'Safari',
          os: 'iOS',
          appOpened: true
        }
      ];

      const stats = calculateStats(analytics);

      expect(stats.total).toBe(3);
      expect(stats.clicksByDay['2025-11-05']).toBe(2);
      expect(stats.clicksByDay['2025-11-06']).toBe(1);
      expect(stats.deviceBreakdown['iOS']).toBe(2);
      expect(stats.deviceBreakdown['Android']).toBe(1);
      expect(stats.appOpenRate).toBe('66.67'); // 2/3 = 66.67%
    });

    it('should handle empty analytics array', () => {
      const stats = calculateStats([]);

      expect(stats.total).toBe(0);
      expect(stats.appOpenRate).toBe(0);
      expect(Object.keys(stats.clicksByDay)).toHaveLength(0);
    });

    it('should calculate hourly distribution', () => {
      const analytics = [
        { timestamp: new Date('2025-11-05T10:00:00'), device: 'iOS', browser: 'Safari', os: 'iOS' },
        { timestamp: new Date('2025-11-05T10:30:00'), device: 'iOS', browser: 'Safari', os: 'iOS' },
        { timestamp: new Date('2025-11-05T14:00:00'), device: 'Android', browser: 'Chrome', os: 'Android' }
      ];

      const stats = calculateStats(analytics);

      expect(stats.hourlyDistribution[10]).toBe(2);
      expect(stats.hourlyDistribution[14]).toBe(1);
    });
  });

  describe('getTopN', () => {
    it('should return top N items', () => {
      const counts = {
        'Chrome': 50,
        'Safari': 30,
        'Firefox': 15,
        'Edge': 5
      };

      const top2 = getTopN(counts, 2);

      expect(top2).toHaveLength(2);
      expect(top2[0]).toEqual(['Chrome', 50]);
      expect(top2[1]).toEqual(['Safari', 30]);
    });

    it('should handle empty object', () => {
      const top5 = getTopN({}, 5);

      expect(top5).toHaveLength(0);
    });

    it('should return all items if N is larger than total', () => {
      const counts = {
        'A': 10,
        'B': 5
      };

      const top10 = getTopN(counts, 10);

      expect(top10).toHaveLength(2);
    });
  });
});
