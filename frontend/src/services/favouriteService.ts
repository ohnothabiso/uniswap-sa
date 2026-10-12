/**
 * UniSwap SA — Favourites & Wishlist Service
 */

import { apiClient } from './apiClient';
import { Favourite, PaginatedResponse } from '@/types';

export const favouriteService = {
  /**
   * Retrieve student's saved listings
   */
  async getFavourites(): Promise<Favourite[]> {
    const res = await apiClient.get<Favourite[] | PaginatedResponse<Favourite>>('/api/favourites/');
    if (Array.isArray(res.data)) return res.data;
    if ('results' in res.data) return res.data.results;
    return [];
  },

  /**
   * Toggle favourite state for a listing
   */
  async toggleFavourite(listingId: number): Promise<{
    status: 'added' | 'removed';
    favorited: boolean;
    listing_id?: number;
    favourite?: Favourite;
  }> {
    const res = await apiClient.post('/api/favourites/toggle/', { listing: listingId });
    return res.data;
  },

  /**
   * Explicitly delete a favourite by ID
   */
  async deleteFavourite(favouriteId: number): Promise<void> {
    await apiClient.delete(`/api/favourites/${favouriteId}/`);
  },
};
