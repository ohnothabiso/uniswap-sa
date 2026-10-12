import { describe, it, expect } from 'vitest';
import { formatZAR, formatDate, formatRelativeTime } from '@/utils/formatters';

describe('Formatters Utility', () => {
  describe('formatZAR', () => {
    it('formats numeric positive values into South African Rand', () => {
      const res = formatZAR(250);
      expect(res).toContain('250,00');
    });

    it('returns "Free / Swap" for null, undefined, or zero price', () => {
      expect(formatZAR(null)).toBe('Free / Swap');
      expect(formatZAR(undefined)).toBe('Free / Swap');
      expect(formatZAR(0)).toBe('Free / Swap');
      expect(formatZAR('0')).toBe('Free / Swap');
    });

    it('formats decimal string values correctly', () => {
      const res = formatZAR('420.50');
      expect(res).toContain('420,50');
    });
  });

  describe('formatDate', () => {
    it('formats ISO dates accurately', () => {
      const res = formatDate('2026-10-12T00:00:00Z');
      expect(res).toContain('2026');
      expect(res).toContain('Oct');
    });

    it('handles empty or invalid date gracefully', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate('')).toBe('');
      expect(formatDate('invalid-date')).toBe('');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns "Just now" for recent timestamps', () => {
      const now = new Date().toISOString();
      expect(formatRelativeTime(now)).toBe('Just now');
    });

    it('handles null timestamps safely', () => {
      expect(formatRelativeTime(null)).toBe('');
    });
  });
});
