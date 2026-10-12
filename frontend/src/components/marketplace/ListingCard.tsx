import React from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '@/types';
import { formatZAR, formatDate } from '@/utils/formatters';
import { getUserAvatar } from '@/utils/avatar';
import { useAuth } from '@/context/AuthContext';
import {
  Bookmark,
  Building2,
  RefreshCw,
  Coins,
  Gift,
  CheckCircle,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

interface ListingCardProps {
  listing: Listing;
  isFavorited?: boolean;
  onToggleFavorite?: (listingId: number) => void;
  isFavoriteLoading?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorited = false,
  onToggleFavorite,
  isFavoriteLoading = false,
}) => {
  const { isAuthenticated } = useAuth();

  // Resolve cover image
  const coverUrl =
    listing.cover_image ||
    listing.image_url ||
    (listing.images && listing.images.length > 0
      ? listing.images[0].image || listing.images[0].image_url
      : null);

  const getDealBadge = () => {
    if (listing.listing_type === 'DONATE') {
      return (
        <Badge variant="secondary" size="sm" className="gap-1 bg-sky-600 text-white font-bold border-none shadow-sm">
          <Gift className="w-3 h-3" /> FREE DONATION
        </Badge>
      );
    }
    return (
      <Badge variant="accent" size="sm" className="gap-1 bg-emerald-600 text-white font-bold border-none shadow-sm">
        <RefreshCw className="w-3 h-3" /> SWAP
      </Badge>
    );
  };

  const getConditionLabel = () => {
    switch (listing.condition) {
      case 'NEW':
        return 'Brand New';
      case 'LIKE_NEW':
        return 'Like New';
      case 'GOOD':
        return 'Good Condition';
      case 'FAIR':
        return 'Fair Wear';
      default:
        return listing.condition;
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(listing.listing_id);
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col">
      {/* Listing Media Header */}
      <Link to={`/listings/${listing.listing_id}`} className="block relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // Fallback placeholder image
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-400">
            <Tag className="w-8 h-8 stroke-1 mb-1" />
            <span className="text-[11px] font-medium">No photo provided</span>
          </div>
        )}

        {/* Deal Type Badge Overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {getDealBadge()}
        </div>

        {/* Prominent Emerald Green Save to Favourites Action (Prompt Mandate) */}
        {isAuthenticated && onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            disabled={isFavoriteLoading}
            className={`absolute top-2.5 right-2.5 p-2 rounded-xl transition-all shadow-md z-10 ${
              isFavorited
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 scale-105 ring-2 ring-emerald-300'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-800'
            }`}
            title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Bookmark
              className={`w-4 h-4 ${isFavorited ? 'fill-white stroke-white' : 'stroke-current'}`}
            />
          </button>
        )}

        {/* Safe Zone Tag Overlay */}
        {listing.safe_zone && (
          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white text-[10px] font-medium flex items-center gap-1.5 truncate">
            <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{listing.safe_zone}</span>
          </div>
        )}
      </Link>

      {/* Listing Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Deal Type & Size */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-1.5">
              {listing.listing_type === 'DONATE' ? (
                <>
                  <Gift className="w-3.5 h-3.5 text-sky-500" /> Free Giveaway
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-500" /> Direct Swap
                </>
              )}
            </span>
            {listing.size && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Size {listing.size}
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/listings/${listing.listing_id}`} className="block">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-campus-secondary transition-colors">
              {listing.title}
            </h3>
          </Link>

          {/* Category & Condition */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            {listing.category_name && <span className="truncate">{listing.category_name}</span>}
            <span>•</span>
            <span>{getConditionLabel()}</span>
          </div>
        </div>

        {/* Seller Info Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <img
              src={getUserAvatar({
                avatar_url: listing.seller_avatar,
                full_name: listing.seller_name,
              })}
              alt={listing.seller_name || 'Seller'}
              className="w-5 h-5 rounded-full object-cover shrink-0"
            />
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
              {listing.seller_name || 'SPU Student'}
            </span>
          </div>

          {listing.seller_residence && (
            <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
              {listing.seller_residence}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
