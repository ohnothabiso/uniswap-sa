import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '@/services/listingService';
import { useAuth } from '@/context/AuthContext';
import { extractErrorMessage } from '@/services/apiClient';
import { ListingCondition, ListingType } from '@/types';
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [listingType, setListingType] = useState<ListingType>('SWAP');
  const [condition, setCondition] = useState<ListingCondition>('GOOD');
  const [size, setSize] = useState('M');
  const [safeZone, setSafeZone] = useState('Central Campus Library Ground Floor');
  const [swapPreference, setSwapPreference] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch listing data
  const {
    data: listing,
    isLoading: isFetchingListing,
    isError,
  } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingService.getListingDetail(id!),
    enabled: !!id,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: listingService.getCategories,
  });

  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description);
      setCategoryId(listing.category);
      setListingType(listing.listing_type === 'DONATE' ? 'DONATE' : 'SWAP');
      setCondition(listing.condition);
      setSize(listing.size);
      setSafeZone(listing.safe_zone);
      setSwapPreference(listing.swap_preference);
    }
  }, [listing]);

  if (isFetchingListing) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-campus-secondary animate-spin mb-3" />
        <p className="text-sm text-slate-500">Loading listing details...</p>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm text-red-600">Failed to load listing for editing.</p>
        <Link to="/explore">
          <Button variant="outline" size="sm">Back to Feed</Button>
        </Link>
      </div>
    );
  }

  // Check ownership
  if (user && user.user_id !== listing.user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm text-red-600 font-bold">You are not authorized to edit this listing.</p>
        <Link to={`/listings/${id}`}>
          <Button variant="outline" size="sm">Back to Listing</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await listingService.updateListing(id!, {
        title: title.trim(),
        description: description.trim(),
        category: Number(categoryId),
        listing_type: listingType,
        price: null,
        condition,
        size,
        safe_zone: safeZone,
        swap_preference: listingType === 'SWAP' ? swapPreference.trim() : '',
      });
      navigate(`/listings/${id}`);
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, 'Failed to update listing.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-2xl">
      <div className="mb-6">
        <Link
          to={`/listings/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel & Return to Item
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Edit Listing Details
        </h1>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Exchange Type Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Exchange Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setListingType('SWAP')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  listingType === 'SWAP'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600'
                }`}
              >
                Direct Swap
              </button>
              <button
                type="button"
                onClick={() => setListingType('DONATE')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  listingType === 'DONATE'
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600'
                }`}
              >
                Free Donation
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Listing Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Size
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ListingCondition)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            >
              <option value="NEW">New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Safe Zone Checkpoint
            </label>
            <select
              value={safeZone}
              onChange={(e) => setSafeZone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            >
              <option value="Central Campus Library Ground Floor">Zone A: Central Campus Library Ground Floor</option>
              <option value="Luka Jantjie Wing Security Desk">Zone B: Luka Jantjie Wing Security Desk</option>
              <option value="Moroka Residence Front Desk">Zone C: Moroka Residence Front Desk</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full py-3 bg-campus-primary"
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};
