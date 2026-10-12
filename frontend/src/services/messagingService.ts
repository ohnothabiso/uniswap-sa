/**
 * UniSwap SA — Messaging and Safe Chat Service
 */

import { apiClient } from './apiClient';
import { Message, PaginatedResponse } from '@/types';

export const messagingService = {
  /**
   * Fetch active conversation threads (one entry per conversation partner)
   */
  async getThreads(): Promise<Message[]> {
    const res = await apiClient.get<Message[] | PaginatedResponse<Message>>('/api/messaging/threads/');
    if (Array.isArray(res.data)) return res.data;
    if ('results' in res.data) return res.data.results;
    return [];
  },

  /**
   * Fetch message history with a specific peer
   */
  async getMessagesWithUser(userId: number): Promise<Message[]> {
    const res = await apiClient.get<Message[] | PaginatedResponse<Message>>('/api/messaging/', {
      params: { with: userId },
    });
    if (Array.isArray(res.data)) return res.data;
    if ('results' in res.data) return res.data.results;
    return [];
  },

  /**
   * Send a message to a peer, optionally tagged with a listing
   */
  async sendMessage(data: {
    receiver: number;
    listing?: number | null;
    message_text: string;
  }): Promise<Message> {
    const res = await apiClient.post<Message>('/api/messaging/', data);
    return res.data;
  },

  /**
   * Mark a message as read
   */
  async markRead(messageId: number): Promise<Message> {
    const res = await apiClient.post<Message>(`/api/messaging/${messageId}/mark_read/`);
    return res.data;
  },
};
