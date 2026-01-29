import { describe, it, expect } from 'vitest';
import { truncateString } from '../lib/utils';

describe('MusicStats Utilities', () => {
  describe('truncateString', () => {
    it('returns empty string for empty input', () => {
      expect(truncateString('', 10)).toBe('');
    });

    it('returns original string if length is within limit', () => {
      expect(truncateString('short', 10)).toBe('short');
      expect(truncateString('exact', 5)).toBe('exact');
    });

    it('truncates string and adds ellipsis if length exceeds limit', () => {
      expect(truncateString('longer string', 6)).toBe('longer...');
    });

    it('truncates long strings correctly', () => {
      const longString = 'a'.repeat(200);
      const truncated = truncateString(longString, 150);
      expect(truncated.length).toBe(153); // 150 + '...'
      expect(truncated.endsWith('...')).toBe(true);
    });
  });
});
