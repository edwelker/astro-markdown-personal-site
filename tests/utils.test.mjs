import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  formatDate,
  readingTime,
  formatRelativeTime,
  decodeHtmlEntities,
  getSourceDomain,
} from '../src/lib/utils';

describe('Utils Library', () => {
  describe('formatDate', () => {
    it('should format a date correctly', () => {
      const testDate = new Date(2024, 0, 1); // Jan 1, 2024
      expect(formatDate(testDate)).toBe('01/01/2024');
    });
  });

  describe('readingTime', () => {
    it('should calculate reading time correctly for 400 words', () => {
      const html = '<p>word</p> '.repeat(400);
      expect(readingTime(html)).toBe('3 min read');
    });

    it('should calculate reading time for 100 words', () => {
      const html = 'word '.repeat(100);
      expect(readingTime(html)).toBe('2 min read');
    });
  });

  describe('formatRelativeTime', () => {
    const baseDate = new Date();

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(baseDate);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "Today" for the same day', () => {
      const today = new Date();
      today.setHours(today.getHours() - 1);
      expect(formatRelativeTime(today)).toBe('Today');
    });

    it('should return "Yesterday" for the previous day', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatRelativeTime(yesterday)).toBe('Yesterday');
    });

    it('should return "2 days ago" for two days ago', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago');
    });

    it('should handle invalid date input', () => {
      expect(formatRelativeTime('invalid date')).toBe('');
      expect(formatRelativeTime(null)).toBe('');
    });
  });

  describe('decodeHtmlEntities', () => {
    it('should decode named entities', () => {
      const str = '&lt;div&gt;&quot;It&apos;s a test&quot; &amp; Co.&lt;/div&gt;';
      expect(decodeHtmlEntities(str)).toBe(`<div>"It's a test" & Co.</div>`);
    });

    it('should decode numeric entities', () => {
      const str = '&#60;hello&#62;';
      expect(decodeHtmlEntities(str)).toBe('<hello>');
    });

    it('should decode hex entities', () => {
      const str = '&#x3C;hello&#x3E;';
      expect(decodeHtmlEntities(str)).toBe('<hello>');
    });

    it('should handle null or empty input', () => {
      expect(decodeHtmlEntities(null)).toBe('');
      expect(decodeHtmlEntities('')).toBe('');
    });
  });

  describe('getSourceDomain', () => {
    it('should extract the domain and remove www.', () => {
      const url = 'https://www.example.com/path/to/page';
      expect(getSourceDomain(url)).toBe('example.com');
    });

    it('should handle URLs without www.', () => {
      const url = 'https://sub.example.co.uk/page';
      expect(getSourceDomain(url)).toBe('sub.example.co.uk');
    });

    it('should handle invalid URLs gracefully', () => {
      const url = 'not-a-url';
      expect(getSourceDomain(url)).toBe('');
    });

    it('should handle null or empty input', () => {
      expect(getSourceDomain(null)).toBe('');
      expect(getSourceDomain('')).toBe('');
    });
  });
});
