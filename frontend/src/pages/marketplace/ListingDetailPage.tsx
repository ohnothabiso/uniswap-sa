import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '@/services/listingService';
import { favouriteService } from '@/services/favouriteService';
import { moderationService } from '@/services/moderationService';
import { messagingService } from '@/services/messagingService';
import { useAuth } from '@/context/AuthContext';
import { formatZAR, formatDate } from '@/utils/formatters';
import { getUserAvatar } from '@/utils/avatar';
import { extractErrorMessage } from '@/services/apiClient';
import {
  Bookmark,
  MessageSquare,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Gift,
  Coins,
  Trash2,
  Edit,
  CheckCircle,
  Flag,
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { ErrorState } from '@/components/common/ErrorState';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Prohibited item or counterfeit');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick message modal state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Fetch listing details from API
  const {
    data: listing,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingService.getListingDetail(id!),
    enabled: !!id,
  });

  // Query favourites to determine save state
  const { data: favourites = [] } = useQuery({
    queryKey: ['favourites'],
    queryFn: favouriteService.getFavourites,
    enabled: isAuthenticated,
  });

  const isFavorited = favourites.some((f) => String(f.listing) === String(id));

  // Toggle favourite mutation
  const toggleFavMutation = useMutation({
    mutationFn: () => favouriteService.toggleFavourite(Number(id)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
      setFeedbackMessage({
        type: 'success',
        text: data.favorited ? 'Added to your campus wishlist!' : 'Removed from wishlist.',
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
  });

  // Reserve listing mutation
  const reserveMutation = useMutation({
    mutationFn: () => listingService.reserveListing(id!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      setFeedbackMessage({ type: 'success', text: data.message });
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
  });

  // Complete trade mutation
  const completeTradeMutation = useMutation({
    mutationFn: () => listingService.completeTrade(id!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      setFeedbackMessage({ type: 'success', text: data.message });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
  });

  // Delete listing mutation
  const deleteMutation = useMutation({
    mutationFn: () => listingService.deleteListing(id!),
    onSuccess: () => {
      navigate('/my-listings');
    },
    onError: (err) => {
      setFeedbackMessage({ type: 'error', text: extractErrorMessage(err) });
    },
  });

  // Submit report mutation
  const reportMutation = useMutation({
    mutationFn: () => moderationService.submitReport({ listing: Number(id), reason: reportReason }),
    onSuccess: () => {
      setIsReportModalOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: 'Report submitted to campus moderation. Thank you for protecting SPU.',
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (err) => {
      setFeedbackMessage({ type: 'error', text: extractErrorMessage(err) });
    },
  });

  // Handle direct message submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !listing) return;
    setIsSendingMessage(true);

    try {
      await messagingService.sendMessage({
        receiver: listing.user,
        listing: listing.listing_id,
        message_text: messageText.trim(),
      });
      setIsMessageModalOpen(false);
      setMessageText('');
      navigate(`/messages?with=${listing.user}`);
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: extractErrorMessage(err, 'Failed to send message.') });
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-campus-secondary animate-spin mb-3" />
        <p className="text-sm text-slate-500">Retrieving listing from Sol Plaatje University records...</p>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <ErrorState
          title="Listing Not Found"
          message="This listing may have been completed, removed by the seller, or taken down by moderation."
          onRetry={() => refetch()}
        />
        <div className="text-center mt-6">
          <Link to="/explore">
            <Button variant="outline" size="sm">
              Return to Marketplace Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.user_id === listing.user;

  // Gather all images (listing.images array + fallback cover image)
  const allImages: string[] = [];
  if (listing.images && listing.images.length > 0) {
    listing.images.forEach((img) => {
      if (img.image) allImages.push(img.image);
      else if (img.image_url) allImages.push(img.image_url);
    });
  }
  if (allImages.length === 0 && (listing.cover_image || listing.image_url)) {
    allImages.push(listing.cover_image || listing.image_url!);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wardrobe Feed
        </Link>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200'
              : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-card relative">
            {allImages.length > 0 ? (
              <img
                src={allImages[activeImageIndex] || allImages[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                No photo uploaded
              </div>
            )}

            {/* Status Tag */}
            {listing.status !== 'LIVE' && (
              <div className="absolute top-4 left-4 bg-amber-500 text-white font-extrabold text-xs px-3 py-1 rounded-xl shadow">
                STATUS: {listing.status}
              </div>
            )}
          </div>

          {/* Thumbnails list */}
          {allImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-campus-secondary ring-2 ring-sky-300'
                      : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Listing Details & Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header & Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {listing.listing_type === 'DONATE' ? (
                <Badge variant="secondary" size="sm" className="bg-sky-600 text-white font-bold">
                  <Gift className="w-3 h-3" /> FREE DONATION / GIVEAWAY
                </Badge>
              ) : (
                <Badge variant="accent" size="sm" className="bg-emerald-600 text-white font-bold">
                  <RefreshCw className="w-3 h-3" /> DIRECT CLOTHING SWAP
                </Badge>
              )}
              {listing.category_name && (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {listing.category_name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {listing.title}
            </h1>

            {/* Exchange Type Presentation */}
            <div className="pt-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                {listing.listing_type === 'DONATE' ? (
                  <>
                    <Gift className="w-5 h-5 text-sky-500" /> Free Campus Donation (No Cost)
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 text-emerald-500" /> Direct Peer Swap (Item Exchange)
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Size</span>
              <span className="font-bold text-slate-800 dark:text-white">{listing.size || 'Standard'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Condition</span>
              <span className="font-bold text-slate-800 dark:text-white">{listing.condition}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Safe Zone</span>
              <span className="font-bold text-slate-800 dark:text-white">{listing.safe_zone || 'SPU Central Library'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Listed Date</span>
              <span className="font-bold text-slate-800 dark:text-white">{formatDate(listing.date_posted)}</span>
            </div>
          </div>

          {/* Swap Preference Note if Applicable */}
          {listing.swap_preference && (
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800 text-xs space-y-1">
              <span className="font-bold text-campus-secondary flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Preferred Item for Trade:
              </span>
              <p className="text-slate-700 dark:text-slate-300">{listing.swap_preference}</p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Item Description
            </h4>
            <p className="whitespace-pre-line">{listing.description}</p>
          </div>

          {/* SPU Verified Seller Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={getUserAvatar({
                  avatar_url: listing.seller_avatar,
                  full_name: listing.seller_name,
                })}
                alt={listing.seller_name || 'Seller'}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  {listing.seller_name || 'SPU Student'}
                  <CheckCircle className="w-3.5 h-3.5 text-campus-secondary" />
                </p>
                <p className="text-[11px] text-slate-500">{listing.seller_residence || 'Moroka Res'}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                {listing.seller_trust ? `${listing.seller_trust}% Trust` : 'Verified Peer'}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            {!isOwner ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1 py-3 bg-campus-primary hover:bg-campus-primaryDark gap-2"
                  onClick={() => {
                    if (!isAuthenticated) navigate('/login');
                    else setIsMessageModalOpen(true);
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Message Seller / Swap
                </Button>

                {/* Prominent Emerald Green Save to Favourites Action */}
                {isAuthenticated && (
                  <Button
                    variant="accent"
                    size="lg"
                    className={`px-5 py-3 gap-2 font-bold ${
                      isFavorited
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                    }`}
                    onClick={() => toggleFavMutation.mutate()}
                    isLoading={toggleFavMutation.isPending}
                  >
                    <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
                    {isFavorited ? 'Saved in Wishlist' : 'Save to Favourites'}
                  </Button>
                )}
              </div>
            ) : (
              /* Owner Controls */
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-semibold">
                  You own this listing ({listing.status}). Manage or conclude the exchange below.
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => navigate(`/listings/${listing.listing_id}/edit`)}
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Details
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 bg-sky-600 hover:bg-sky-700 text-white"
                    disabled={listing.status === 'RESERVED' || listing.status === 'COMPLETED'}
                    onClick={() => reserveMutation.mutate()}
                    isLoading={reserveMutation.isPending}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    {listing.status === 'RESERVED' ? 'Reserved' : 'Reserve for Meetup'}
                  </Button>

                  <Button
                    variant="accent"
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={listing.status === 'COMPLETED'}
                    onClick={() => completeTradeMutation.mutate()}
                    isLoading={completeTradeMutation.isPending}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {listing.status === 'COMPLETED' ? 'Trade Complete' : 'Confirm Complete'}
                  </Button>
                </div>
              </div>
            )}

            {/* Report Button */}
            {!isOwner && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => {
                    if (!isAuthenticated) navigate('/login');
                    else setIsReportModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Report Suspicious Listing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Seller Modal */}
      <Modal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        title={`Message ${listing.seller_name || 'Seller'}`}
        description={`Regarding: "${listing.title}"`}
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Your Message or Trade Proposal
            </label>
            <textarea
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Hi ${listing.seller_name || 'there'}, is this still available? I can meet you at ${listing.safe_zone || 'Central Library'}...`}
              required
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-campus-secondary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMessageModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSendingMessage}
            >
              Send Message
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report This Listing"
        description="Help maintain trust and security across the Sol Plaatje campus."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Reason for Report
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
            >
              <option value="Prohibited item or counterfeit">Prohibited item or counterfeit</option>
              <option value="Misleading details or condition">Misleading details or condition</option>
              <option value="Inappropriate photo or description">Inappropriate photo or description</option>
              <option value="Suspected scam or safety concern">Suspected scam or safety concern</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={reportMutation.isPending}
              onClick={() => reportMutation.mutate()}
            >
              Submit Report
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Wardrobe Listing"
        description={`Are you sure you want to permanently delete "${listing.title}"?`}
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
