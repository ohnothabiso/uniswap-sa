import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favouriteService } from '@/services/favouriteService';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { CardSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { Bookmark, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';

export const FavouritesPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: favourites = [], isLoading, isError } = useQuery({
    queryKey: ['favourites'],
    queryFn: favouriteService.getFavourites,
  });

  const toggleFavMutation = useMutation({
    mutationFn: (listingId: number) => favouriteService.toggleFavourite(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold mb-2">
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Campus Saved Wishlist</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Saved Wardrobe Items
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Keep track of items you plan to buy, swap, or collect at Sol Plaatje University safe zones.
          </p>
        </div>

        <Link to="/explore">
          <Button variant="outline" size="sm">
            Discover More Items
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && !isError && favourites.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="Your wishlist is empty"
          description="Browse the campus marketplace and tap the green save button on apparel you want to follow."
          actionText="Explore Campus Feed"
          onAction={() => (window.location.href = '/explore')}
        />
      )}

      {!isLoading && !isError && favourites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favourites.map((fav) => {
            const item = fav.listing_detail;
            if (!item) return null;
            return (
              <ListingCard
                key={fav.favourite_id}
                listing={item}
                isFavorited={true}
                onToggleFavorite={(id) => toggleFavMutation.mutate(id)}
                isFavoriteLoading={toggleFavMutation.isPending}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
