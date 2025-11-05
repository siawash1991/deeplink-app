/**
 * Deep Link Utilities Tests
 */

const { detectPlatform, addPlatform, platforms } = require('../src/utils/deeplink');

describe('Deep Link Utilities', () => {
  describe('detectPlatform', () => {
    describe('YouTube URLs', () => {
      it('should detect standard YouTube URL', () => {
        const result = detectPlatform('https://youtube.com/watch?v=dQw4w9WgXcQ');
        expect(result).not.toBeNull();
        expect(result.platform).toBe('youtube');
        expect(result.id).toBe('dQw4w9WgXcQ');
      });

      it('should detect short YouTube URL', () => {
        const result = detectPlatform('https://youtu.be/dQw4w9WgXcQ');
        expect(result).not.toBeNull();
        expect(result.platform).toBe('youtube');
        expect(result.id).toBe('dQw4w9WgXcQ');
      });

      it('should detect YouTube URL with additional parameters', () => {
        const result = detectPlatform('https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s');
        expect(result).not.toBeNull();
        expect(result.platform).toBe('youtube');
        expect(result.id).toBe('dQw4w9WgXcQ');
      });
    });

    describe('Instagram URLs', () => {
      it('should detect Instagram post URL', () => {
        const result = detectPlatform('https://instagram.com/p/ABC123');
        expect(result).not.toBeNull();
        expect(result.platform).toBe('instagram');
        expect(result.id).toBe('ABC123');
      });

      it('should detect Instagram reel URL', () => {
        const result = detectPlatform('https://instagram.com/reel/XYZ789');
        expect(result).not.toBeNull();
        expect(result.platform).toBe('instagram');
        expect(result.id).toBe('XYZ789');
      });

      it('should detect Instagram TV URL', () => {
        const result = detectPlatform('https://instagram.com/tv/DEF456');
        expect(result).not.toBeNull();
        expect(result.platform).toBe('instagram');
        expect(result.id).toBe('DEF456');
      });
    });

    describe('Unsupported URLs', () => {
      it('should return null for unsupported URL', () => {
        const result = detectPlatform('https://example.com');
        expect(result).toBeNull();
      });

      it('should return null for invalid URL format', () => {
        const result = detectPlatform('not-a-url');
        expect(result).toBeNull();
      });

      it('should return null for empty string', () => {
        const result = detectPlatform('');
        expect(result).toBeNull();
      });
    });

    describe('Deep Link Generation', () => {
      it('should generate correct YouTube deep link', () => {
        const result = detectPlatform('https://youtube.com/watch?v=test123');
        const deepLink = result.config.deepLinkTemplate(result.id);
        expect(deepLink).toBe('vnd.youtube://watch/test123');
      });

      it('should generate correct YouTube fallback', () => {
        const result = detectPlatform('https://youtube.com/watch?v=test123');
        const fallback = result.config.fallback(result.id);
        expect(fallback).toBe('https://youtube.com/watch?v=test123');
      });

      it('should generate correct Instagram deep link', () => {
        const result = detectPlatform('https://instagram.com/p/test123');
        const deepLink = result.config.deepLinkTemplate(result.id);
        expect(deepLink).toBe('instagram://media?id=test123');
      });
    });
  });

  describe('addPlatform', () => {
    it('should add a new platform', () => {
      const tiktokConfig = {
        regex: /tiktok\.com\/.*\/video\/([\w]+)/,
        deepLinkTemplate: (id) => `tiktok://video/${id}`,
        fallback: (id) => `https://tiktok.com/video/${id}`
      };

      addPlatform('tiktok', tiktokConfig);

      expect(platforms.tiktok).toBeDefined();
      expect(platforms.tiktok.regex).toBe(tiktokConfig.regex);
    });

    it('should detect newly added platform', () => {
      const spotifyConfig = {
        regex: /spotify\.com\/track\/([\w]+)/,
        deepLinkTemplate: (id) => `spotify://track/${id}`,
        fallback: (id) => `https://open.spotify.com/track/${id}`
      };

      addPlatform('spotify', spotifyConfig);

      const result = detectPlatform('https://spotify.com/track/abc123');
      expect(result).not.toBeNull();
      expect(result.platform).toBe('spotify');
      expect(result.id).toBe('abc123');
    });
  });
});
