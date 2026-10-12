/**
 * UniSwap SA — TypeScript Model Definitions & API Response Types
 * Synchronized with Django REST Framework backend serializers
 */

export interface University {
  university_id: number;
  name: string;
  location: string;
  email_domain: string;
}

export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  university: number;
  university_name?: string;
  role: UserRole;
  is_verified: boolean;
  is_staff?: boolean;
  date_joined: string;
  avatar?: string | null;
  avatar_url?: string;
  campus_residence: string;
  faculty: string;
  student_id_number: string;
  trust_score: number;
  items_diverted: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface Category {
  category_id: number;
  category_name: string;
  description: string;
}

export type ListingType = 'FOR_SALE' | 'SWAP' | 'DONATE';
export type ListingCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
export type ListingStatus = 'PENDING' | 'LIVE' | 'RESERVED' | 'COMPLETED' | 'FLAGGED' | 'REMOVED';

export interface ListingImage {
  id: number;
  image?: string;
  image_url?: string;
  is_cover: boolean;
  uploaded_at: string;
}

export interface Listing {
  listing_id: number;
  user: number;
  seller_name: string;
  seller_email?: string;
  seller_avatar?: string;
  seller_residence?: string;
  seller_trust?: number;
  category: number;
  category_name?: string;
  title: string;
  description: string;
  listing_type: ListingType;
  price: string | number | null;
  condition: ListingCondition;
  size: string;
  safe_zone: string;
  swap_preference: string;
  image_url?: string;
  cover_image?: string | null;
  status: ListingStatus;
  images?: ListingImage[];
  date_posted: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Message {
  message_id: number;
  sender: number;
  sender_name: string;
  sender_email?: string;
  sender_avatar?: string;
  receiver: number;
  receiver_name: string;
  receiver_email?: string;
  receiver_avatar?: string;
  listing?: number | null;
  listing_title?: string;
  listing_price?: string | number | null;
  listing_type?: ListingType;
  listing_image?: string | null;
  message_text: string;
  is_read: boolean;
  date_sent: string;
}

export interface Favourite {
  favourite_id: number;
  listing: number;
  listing_detail?: Listing;
  date_saved: string;
}

export type NotificationType =
  | 'TRADE_COMPLETED'
  | 'LISTING_APPROVED'
  | 'LISTING_FLAGGED'
  | 'LISTING_REMOVED'
  | 'NEW_MESSAGE'
  | 'ITEM_FAVOURITED'
  | 'GENERAL';

export interface Notification {
  notification_id: number;
  notification_type: NotificationType | string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  report_id: number;
  listing: number;
  listing_title?: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  date_reported: string;
  user?: number;
}

export interface ModerationLog {
  log_id: number;
  listing: number;
  admin: number;
  action: 'APPROVED' | 'FLAGGED' | 'REMOVED';
  reason: string;
  created_at: string;
}

export interface ModerationStats {
  active_listings: number;
  pending_review: number;
  flagged: number;
  open_reports: number;
}

export interface FeedFilterParams {
  category?: string | number;
  listing_type?: ListingType | 'all';
  condition?: ListingCondition | 'all';
  status?: ListingStatus | 'all' | string;
  search?: string;
  min_price?: number | string;
  max_price?: number | string;
  ordering?: string;
  mine?: boolean;
  page?: number;
}
