import { describe, it, expect, beforeEach } from 'vitest';
import {
  TOKEN_STORAGE_KEY,
  REFRESH_STORAGE_KEY,
  storeTokens,
  clearStoredAuth,
  getStoredAccessToken,
  extractErrorMessage,
} from '@/services/apiClient';

describe('Auth Client & Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and retrieves access and refresh tokens', () => {
    storeTokens('test-access-token-123', 'test-refresh-token-456');
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('test-access-token-123');
    expect(localStorage.getItem(REFRESH_STORAGE_KEY)).toBe('test-refresh-token-456');
    expect(getStoredAccessToken()).toBe('test-access-token-123');
  });

  it('clears stored authentication upon logout', () => {
    storeTokens('test-access-token-123', 'test-refresh-token-456');
    clearStoredAuth();
    expect(getStoredAccessToken()).toBeNull();
    expect(localStorage.getItem(REFRESH_STORAGE_KEY)).toBeNull();
  });

  it('extracts detail string from API error object', () => {
    const errorObj = {
      response: {
        data: {
          detail: 'No active account found with the given credentials',
        },
      },
    };
    const msg = extractErrorMessage(errorObj);
    expect(msg).toBe('No active account found with the given credentials');
  });

  it('normalizes validation field errors into readable message', () => {
    const errorObj = {
      response: {
        data: {
          email: ['You must register with a @spu.ac.za email address.'],
          password: ['This password is too short.'],
        },
      },
    };
    const msg = extractErrorMessage(errorObj);
    expect(msg).toContain('email: You must register with a @spu.ac.za email address.');
    expect(msg).toContain('password: This password is too short.');
  });
});
