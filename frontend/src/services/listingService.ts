/**
 * UniSwap SA — Marketplace Listings Service
 */

import { apiClient } from './apiClient';
import { Category, FeedFilterParams, Listing, ListingImage, PaginatedResponse } from '@/types';

export const listingService = {
  /**
   * Fetch all clothing & campus categories
   */
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<Category[] | PaginatedResponse<Category>>('/api/listings/categories/');
    if (Array.isArray(res.data)) return res.data;
    if ('results' in res.data) return res.data.results;
    return [];
  },

  /**
   * Fetch marketplace feed with filters, search, and pagination
   */
  async getListings(params: FeedFilterParams = {}): Promise<PaginatedResponse<Listing>> {
    const queryParams: Record<string, any> = {};

    if (params.category && params.category !== 'all') {
      queryParams.category = params.category;
    }
    if (params.listing_type && params.listing_type !== 'all') {
      queryParams.listing_type = params.listing_type;
    }
    if (params.condition && params.condition !== 'all') {
      queryParams.condition = params.condition;
    }
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.min_price !== undefined && params.min_price !== '') {
      queryParams.min_price = params.min_price;
    }
    if (params.max_price !== undefined && params.max_price !== '') {
      queryParams.max_price = params.max_price;
    }
    if (params.status && params.status !== 'all') {
      queryParams.status = params.status;
    }
    if (params.ordering) {
      queryParams.ordering = params.ordering;
    }
    if (params.mine) {
      queryParams.mine = 'true';
    }
    if (params.page) {
      queryParams.page = params.page;
    }

    const res = await apiClient.get<PaginatedResponse<Listing> | Listing[]>('/api/listings/', {
      params: queryParams,
    });

    // DRF may return either PaginatedResponse or flat array
    if (Array.isArray(res.data)) {
      return {
        count: res.data.length,
        next: null,
        previous: null,
        results: res.data,
      };
    }

    return res.data;
  },

  /**
   * Fetch detailed listing info
   */
  async getListingDetail(id: number | string): Promise<Listing> {
    const res = await apiClient.get<Listing>(`/api/listings/${id}/`);
    return res.data;
  },

  /**
   * Create a new listing
   */
  async createListing(data: Partial<Listing> | FormData): Promise<Listing> {
    const isFormData = data instanceof FormData;
    const res = await apiClient.post<Listing>('/api/listings/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data;
  },

  /**
   * Update existing listing
   */
  async updateListing(id: number | string, data: Partial<Listing> | FormData): Promise<Listing> {
    const isFormData = data instanceof FormData;
    const res = await apiClient.patch<Listing>(`/api/listings/${id}/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data;
  },

  /**
   * Delete an owned listing
   */
  async deleteListing(id: number | string): Promise<void> {
    await apiClient.delete(`/api/listings/${id}/`);
  },

  /**
   * Upload image for listing
   */
  async uploadImage(id: number | string, file: File, isCover = false): Promise<ListingImage> {
    const formData = new FormData();
    formData.append('image', file);
    if (isCover) {
      formData.append('is_cover', 'true');
    }
    const res = await apiClient.post<ListingImage>(`/api/listings/${id}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Reserve listing for meetup at Safe Zone
   */
  async reserveListing(id: number | string): Promise<{ status: string; message: string }> {
    const res = await apiClient.post<{ status: string; message: string }>(`/api/listings/${id}/reserve/`);
    return res.data;
  },

  /**
   * Confirm completed peer trade / handover
   */
  async completeTrade(id: number | string): Promise<{ status: string; message: string }> {
    const res = await apiClient.post<{ status: string; message: string }>(`/api/listings/${id}/complete_trade/`);
    return res.data;
  },
};
