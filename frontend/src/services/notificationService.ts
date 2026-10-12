/**
 * UniSwap SA — Notifications Service
 */

import { apiClient } from './apiClient';
import { Notification, PaginatedResponse } from '@/types';

export const notificationService = {
  /**
   * Fetch notifications for logged-in student
   */
  async getNotifications(): Promise<Notification[]> {
    const res = await apiClient.get<Notification[] | PaginatedResponse<Notification>>('/api/notifications/');
    if (Array.isArray(res.data)) return res.data;
    if ('results' in res.data) return res.data.results;
    return [];
  },

  /**
   * Mark single notification as read
   */
  async markRead(notificationId: number): Promise<Notification> {
    const res = await apiClient.post<Notification>(`/api/notifications/${notificationId}/mark_read/`);
    return res.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllRead(): Promise<void> {
    await apiClient.post('/api/notifications/mark_all_read/');
  },
};
