import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '@/services/listingService';
import { Listing, ListingStatus } from '@/types';
import { formatZAR, formatDate } from '@/utils/formatters';
import {
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Building2,
  CheckCircle,
  Loader2,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';

export const MyListingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);

  // Fetch student's own listings from API
  const { data: listingsData, isLoading, refetch } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => listingService.getListings({ mine: true }),
  });

  const listings: Listing[] = listingsData?.results || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => listingService.deleteListing(id),
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  // Complete trade mutation
  const completeMutation = useMutation({
    mutationFn: (id: number) => listingService.completeTrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  // Reserve mutation
  const reserveMutation = useMutation({
    mutationFn: (id: number) => listingService.reserveListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  const filteredListings = listings.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case 'LIVE':
        return <Badge variant="accent" size="sm">Active Live</Badge>;
      case 'RESERVED':
        return <Badge variant="warning" size="sm">Reserved Meetup</Badge>;
      case 'COMPLETED':
        return <Badge variant="neutral" size="sm">Swapped / Complete</Badge>;
      case 'PENDING':
        return <Badge variant="primary" size="sm">Pending Review</Badge>;
      case 'FLAGGED':
        return <Badge variant="danger" size="sm">Flagged</Badge>;
      case 'REMOVED':
        return <Badge variant="danger" size="sm">Removed</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Wardrobe Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your active circular fashion items, reserve handovers, and conclude swaps.
          </p>
        </div>

        <Link to="/listings/create">
          <Button
            variant="primary"
            size="md"
            className="bg-campus-primary hover:bg-campus-primaryDark gap-2"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            List Another Item
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 text-xs">
        {['all', 'LIVE', 'RESERVED', 'COMPLETED', 'PENDING', 'FLAGGED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              statusFilter === tab
                ? 'bg-campus-primary text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {tab === 'all' ? 'All Items' : tab}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="p-12 text-center text-xs text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-campus-secondary" />
          Loading your wardrobe...
        </div>
      )}

      {!isLoading && filteredListings.length === 0 && (
        <EmptyState
          icon={PackageCheck}
          title="No listings in this view"
          description="You haven't posted any items matching this status filter yet."
          actionText="List Pre-Loved Apparel"
          onAction={() => (window.location.href = '/listings/create')}
        />
      )}

      {/* Listings Table / Responsive Grid */}
      {!isLoading && filteredListings.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-card divide-y divide-slate-100 dark:divide-slate-800">
          {filteredListings.map((item) => (
            <div
              key={item.listing_id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              {/* Left Item Details */}
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={
                    item.cover_image ||
                    item.image_url ||
                    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200/60 dark:border-slate-800"
                />

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    <span className="text-[11px] font-bold text-slate-400">
                      {formatDate(item.date_posted)}
                    </span>
                  </div>

                  <Link to={`/listings/${item.listing_id}`} className="block">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-campus-secondary">
                      {item.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {item.listing_type === 'DONATE' ? 'Free Donation' : 'Direct Swap'}
                    </span>
                    <span>•</span>
                    <span>Size {item.size || 'M'}</span>
                    <span>•</span>
                    <span className="truncate">{item.safe_zone}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                <Link to={`/listings/${item.listing_id}`}>
                  <Button variant="outline" size="sm" title="View details">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </Link>

                <Link to={`/listings/${item.listing_id}/edit`}>
                  <Button variant="outline" size="sm" title="Edit listing">
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                </Link>

                {item.status !== 'COMPLETED' && (
                  <Button
                    variant="accent"
                    size="sm"
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    title="Mark handover complete"
                    onClick={() => completeMutation.mutate(item.listing_id)}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Complete
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  title="Delete item"
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Wardrobe Listing"
        description={`Confirm deletion of "${deleteTarget?.title}"?`}
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.listing_id)}
          >
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
