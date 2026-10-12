/**
 * UniSwap SA — Authentication & User Profile Services
 */

import { apiClient, clearStoredAuth, storeTokens } from './apiClient';
import { AuthResponse, University, User } from '@/types';

export const authService = {
  /**
   * Retrieves supported universities for registration
   */
  async getUniversities(): Promise<University[]> {
    const res = await apiClient.get<University[] | { results: University[] }>('/api/accounts/universities/');
    if (Array.isArray(res.data)) return res.data;
    if (res.data && 'results' in res.data && Array.isArray(res.data.results)) {
      return res.data.results;
    }
    return [];
  },

  /**
   * Login with university email and password
   */
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/api/accounts/login/', credentials);
    storeTokens(res.data.access, res.data.refresh);
    return res.data;
  },

  /**
   * Student registration with university domain validation
   */
  async register(data: FormData | Record<string, any>): Promise<AuthResponse> {
    const isFormData = data instanceof FormData;
    const res = await apiClient.post<AuthResponse>('/api/accounts/register/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    storeTokens(res.data.access, res.data.refresh);
    return res.data;
  },

  /**
   * Fetch current authenticated student profile
   */
  async getMe(): Promise<User> {
    const res = await apiClient.get<User>('/api/accounts/me/');
    return res.data;
  },

  /**
   * Update profile (name, residence, faculty, avatar)
   */
  async updateProfile(data: FormData | Partial<User>): Promise<User> {
    const isFormData = data instanceof FormData;
    const res = await apiClient.patch<User>('/api/accounts/me/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data;
  },

  /**
   * Public profile of a student or seller
   */
  async getUserDetail(userId: number): Promise<User> {
    const res = await apiClient.get<User>(`/api/accounts/${userId}/`);
    return res.data;
  },

  /**
   * Retrieve list of students (for chat partner search)
   */
  async getUsersList(): Promise<User[]> {
    const res = await apiClient.get<User[]>('/api/accounts/users/');
    return res.data;
  },

  /**
   * Terminate session
   */
  logout(): void {
    clearStoredAuth();
    window.dispatchEvent(new Event('uniswap:logout'));
  },
};
