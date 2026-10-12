import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '@/services/listingService';
import { favouriteService } from '@/services/favouriteService';
import { useAuth } from '@/context/AuthContext';
import { FeedFilterParams, Listing } from '@/types';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { FilterSidebar } from '@/components/marketplace/FilterSidebar';
import { CardSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/common/Button';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MarketplaceFeedPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<FeedFilterParams>({
    category: 'all',
    listing_type: 'all',
    condition: 'all',
    page: 1,
  });

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setFilters((prev) => ({ ...prev, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query categories catalog
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: listingService.getCategories,
  });

  // Query authenticated student's favourites for instant heart states
  const { data: favourites = [] } = useQuery({
    queryKey: ['favourites'],
    queryFn: favouriteService.getFavourites,
    enabled: isAuthenticated,
  });

  const favoritedListingIds = useMemo(() => {
    return new Set(favourites.map((f) => f.listing));
  }, [favourites]);

  // Query marketplace listings from Django API
  const queryParams = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch]
  );

  const {
    data: listingData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['listings', queryParams],
    queryFn: () => listingService.getListings(queryParams),
  });

  // Favourite toggle mutation with optimistic cache update
  const toggleFavMutation = useMutation({
    mutationFn: (listingId: number) => favouriteService.toggleFavourite(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  const handleFilterChange = (newFilters: Partial<FeedFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setFilters({
      category: 'all',
      listing_type: 'all',
      condition: 'all',
      page: 1,
    });
  };

  const listings: Listing[] = listingData?.results || [];
  const totalCount = listingData?.count || 0;
  const currentPage = filters.page || 1;
  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Sol Plaatje University Wardrobe
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse genuine student listings, direct swaps, and free academic donations.
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hoodie, sneakers, lab coat, denim..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-campus-secondary transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Drawer Trigger */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar (Spacious 4 cols on lg, 3 cols on xl) */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-w-[280px]">
          <FilterSidebar
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Listings Feed Area (8 cols on lg, 9 cols on xl) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Active Filter Chips */}
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="font-semibold text-slate-500">
              Showing <strong className="text-slate-900 dark:text-white">{listings.length}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white">{totalCount}</strong> campus listings
            </span>

            {/* Quick Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs hidden sm:inline">Sort:</span>
              <select
                value={filters.ordering || '-date_posted'}
                onChange={(e) => handleFilterChange({ ordering: e.target.value })}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
              >
                <option value="-date_posted">Newest First</option>
                <option value="date_posted">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Loading Skeleton Grid */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <ErrorState
              title="Failed to retrieve marketplace listings"
              message="The server did not respond or returned an error. Please verify that the Django backend is running."
              onRetry={() => refetch()}
            />
          )}

          {/* Empty Results State */}
          {!isLoading && !isError && listings.length === 0 && (
            <EmptyState
              title="No campus listings found"
              description={
                debouncedSearch || filters.category !== 'all' || filters.listing_type !== 'all'
                  ? 'No items matched your current search or filter criteria. Try broadening your parameters.'
                  : 'The Sol Plaatje University wardrobe is currently empty. Be the first student to list an item!'
              }
              actionText={
                debouncedSearch || filters.category !== 'all' || filters.listing_type !== 'all'
                  ? 'Clear All Filters'
                  : 'List an Item on SPU'
              }
              onAction={
                debouncedSearch || filters.category !== 'all' || filters.listing_type !== 'all'
                  ? handleClearFilters
                  : () => (window.location.href = '/listings/create')
              }
            />
          )}

          {/* Listing Cards Grid */}
          {!isLoading && !isError && listings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {listings.map((item) => (
                <ListingCard
                  key={item.listing_id}
                  listing={item}
                  isFavorited={favoritedListingIds.has(item.listing_id)}
                  onToggleFavorite={(id) => toggleFavMutation.mutate(id)}
                  isFavoriteLoading={toggleFavMutation.isPending}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-8 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => handleFilterChange({ page: currentPage - 1 })}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => handleFilterChange({ page: currentPage + 1 })}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Slideover Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-sm bg-white dark:bg-slate-900 h-full p-6 overflow-y-auto shadow-2xl z-10 flex flex-col justify-between">
            <FilterSidebar
              categories={categories}
              filters={filters}
              onFilterChange={(newF) => {
                handleFilterChange(newF);
                setIsMobileFiltersOpen(false);
              }}
              onClearFilters={() => {
                handleClearFilters();
                setIsMobileFiltersOpen(false);
              }}
            />
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
