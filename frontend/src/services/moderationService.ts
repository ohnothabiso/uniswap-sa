/**
 * UniSwap SA — Moderation & Reports Service
 */

import { apiClient } from './apiClient';
import { ModerationLog, ModerationStats, PaginatedResponse, Report } from '@/types';

export const moderationService = {
  /**
   * Submit report for inappropriate or suspicious listing
   */
  async submitReport(data: { listing: number; reason: string }): Promise<Report> {
    const res = await apiClient.post<Report>('/api/moderation/reports/', data);
    return res.data;
  },

  /**
   * Admin: view reports queue
   */
  async getReports(): Promise<Report[]> {
    const res = await apiClient.get<Report[] | PaginatedResponse<Report>>('/api/moderation/reports/');
    if (Array.isArray(res.data)) return res.data;
    if ('results' in res.data) return res.data.results;
    return [];
  },

  /**
   * Admin: dismiss or delete a report
   */
  async dismissReport(reportId: number): Promise<void> {
    await apiClient.delete(`/api/moderation/reports/${reportId}/`);
  },

  /**
   * Admin: audit log trail
   */
  async getLogs(): Promise<ModerationLog[]> {
    const res = await apiClient.get<ModerationLog[] | PaginatedResponse<ModerationLog>>('/api/moderation/logs/');
    if (Array.isArray(res.data)) return res.data;
    if ('results' in res.data) return res.data.results;
    return [];
  },

  /**
   * Admin: dashboard statistics
   */
  async getStats(): Promise<ModerationStats> {
    const res = await apiClient.get<ModerationStats>('/api/moderation/listings/stats/');
    return res.data;
  },

  /**
   * Admin: approve pending or flagged listing
   */
  async approveListing(listingId: number): Promise<{ status: string }> {
    const res = await apiClient.post<{ status: string }>(`/api/moderation/listings/${listingId}/approve/`);
    return res.data;
  },

  /**
   * Admin: flag listing with reason
   */
  async flagListing(listingId: number, reason: string): Promise<{ status: string }> {
    const res = await apiClient.post<{ status: string }>(`/api/moderation/listings/${listingId}/flag/`, { reason });
    return res.data;
  },

  /**
   * Admin: remove listing with reason
   */
  async removeListing(listingId: number, reason: string): Promise<{ status: string }> {
    const res = await apiClient.post<{ status: string }>(`/api/moderation/listings/${listingId}/remove/`, { reason });
    return res.data;
  },
};
