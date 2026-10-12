import { describe, it, expect } from 'vitest';
import { FeedFilterParams, ListingType } from '@/types';

describe('Filter & Listing Rules', () => {
  it('validates cash-free circular exchange rule: swaps and donations require no monetary price', () => {
    const isCashFreeExchange = (type: ListingType, price: string | number | null | undefined): boolean => {
      // Platform is strictly cash-free (direct peer swaps & campus donations only)
      if (type === 'SWAP' || type === 'DONATE') {
        return price === null || price === undefined || price === '' || Number(price) === 0;
      }
      return false;
    };

    expect(isCashFreeExchange('SWAP', null)).toBe(true);
    expect(isCashFreeExchange('SWAP', undefined)).toBe(true);
    expect(isCashFreeExchange('DONATE', null)).toBe(true);
    expect(isCashFreeExchange('DONATE', '')).toBe(true);
    expect(isCashFreeExchange('FOR_SALE', 100)).toBe(false);
  });

  it('validates university student email domain requirement', () => {
    const isDomainMatching = (email: string, expectedDomain: string): boolean => {
      const parts = email.trim().toLowerCase().split('@');
      if (parts.length !== 2) return false;
      return parts[1] === expectedDomain.toLowerCase();
    };

    expect(isDomainMatching('student@spu.ac.za', 'spu.ac.za')).toBe(true);
    expect(isDomainMatching('202211758@spu.ac.za', 'spu.ac.za')).toBe(true);
    expect(isDomainMatching('student@gmail.com', 'spu.ac.za')).toBe(false);
    expect(isDomainMatching('student@uct.ac.za', 'spu.ac.za')).toBe(false);
    expect(isDomainMatching('invalid-email', 'spu.ac.za')).toBe(false);
  });

  it('constructs valid filter query parameters for circular exchange', () => {
    const buildParams = (filters: FeedFilterParams) => {
      const q: Record<string, any> = {};
      if (filters.category && filters.category !== 'all') q.category = filters.category;
      if (filters.listing_type && filters.listing_type !== 'all') q.listing_type = filters.listing_type;
      if (filters.search && filters.search.trim()) q.search = filters.search.trim();
      return q;
    };

    const params = buildParams({
      category: 15,
      listing_type: 'SWAP',
      search: 'hoodie',
    });

    expect(params.category).toBe(15);
    expect(params.listing_type).toBe('SWAP');
    expect(params.search).toBe('hoodie');

    // Should omit 'all' and empty strings
    const emptyParams = buildParams({
      category: 'all',
      listing_type: 'all',
      search: '',
    });
    expect(emptyParams).toEqual({});
  });
});

