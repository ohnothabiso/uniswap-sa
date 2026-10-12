import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '@/services/listingService';
import { extractErrorMessage } from '@/services/apiClient';
import { ListingCondition, ListingType } from '@/types';
import {
  Upload,
  Coins,
  RefreshCw,
  Gift,
  Building2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/common/Button';

export const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [listingType, setListingType] = useState<ListingType>('SWAP');
  const [condition, setCondition] = useState<ListingCondition>('GOOD');
  const [size, setSize] = useState('M');
  const [safeZone, setSafeZone] = useState('Central Campus Library Ground Floor');
  const [swapPreference, setSwapPreference] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch real categories from API
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: listingService.getCategories,
  });

  // Handle image files selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`Image "${file.name}" exceeds the 5 MB limit.`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!categoryId) {
      setErrorMessage('Please select a clothing category.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create base listing
      const createdListing = await listingService.createListing({
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

      // 2. Upload images if selected
      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          try {
            await listingService.uploadImage(createdListing.listing_id, selectedImages[i], i === 0);
          } catch {
            // Non-blocking upload failure handling
          }
        }
      }

      navigate(`/listings/${createdListing.listing_id}`);
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, 'Failed to create listing on campus server.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-2xl">
      <div className="mb-6">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel & Return
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Circulate Pre-Loved Campus Apparel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            List an Item on UniSwap SA
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Choose whether to swap clothing with a fellow student or donate freely to the SPU campus wardrobe.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Listing Form Issue</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deal Type Selection Tabs */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Exchange / Deal Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setListingType('SWAP')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  listingType === 'SWAP'
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RefreshCw className="w-5 h-5 mb-1" />
                <span className="text-sm">Direct Swap</span>
                <span className="text-[10px] font-normal opacity-85">Trade item for another item</span>
              </button>

              <button
                type="button"
                onClick={() => setListingType('DONATE')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  listingType === 'DONATE'
                    ? 'border-sky-600 bg-sky-600 text-white shadow'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Gift className="w-5 h-5 mb-1" />
                <span className="text-sm">Free Donation</span>
                <span className="text-[10px] font-normal opacity-85">Give away freely to a student</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Listing Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SPU Collegiate Fleece Hoodie in Navy"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-campus-secondary transition-all"
            />
          </div>

          {/* Category & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-campus-secondary transition-all"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Clothing / Gear Size
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. S, M, L, XL, UK 8, Free Size"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-campus-secondary transition-all"
              />
            </div>
          </div>

          {/* Garment Condition */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Garment Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ListingCondition)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-campus-secondary transition-all"
            >
              <option value="NEW">New (Unworn with tags)</option>
              <option value="LIKE_NEW">Like New (Worn once or twice)</option>
              <option value="GOOD">Good (Normal gentle wear)</option>
              <option value="FAIR">Fair (Visible signs of wear)</option>
            </select>
          </div>

          {/* Swap Preference (If SWAP chosen) */}
          {listingType === 'SWAP' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                What item would you like to swap for?
              </label>
              <input
                type="text"
                value={swapPreference}
                onChange={(e) => setSwapPreference(e.target.value)}
                placeholder="e.g. Looking for a warm winter crewneck or denim jacket"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-campus-secondary transition-all"
              />
            </div>
          )}

          {/* Safe Zone Meeting Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-campus-secondary" />
              Designated Campus Safe Zone Checkpoint
            </label>
            <select
              value={safeZone}
              onChange={(e) => setSafeZone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-campus-secondary transition-all"
            >
              <option value="Central Campus Library Ground Floor">Zone A: Central Campus Library Ground Floor Atrium</option>
              <option value="Luka Jantjie Wing Security Desk">Zone B: Luka Jantjie Wing Security Desk</option>
              <option value="Moroka Residence Front Desk">Zone C: Moroka Residence Front Desk Entrance</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Description & Sizing Notes
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention brand, fit details, fabric material, and any flaws..."
              required
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-campus-secondary transition-all"
            />
          </div>

          {/* Photo Upload Area */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Photos (Max 5 MB each)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                  <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-campus-secondary dark:hover:border-campus-secondary flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40">
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Add Photo</span>
                <span className="text-[9px] text-slate-400">PNG / JPG</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full py-3 bg-campus-primary hover:bg-campus-primaryDark"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Publish to Campus Wardrobe
          </Button>
        </form>
      </div>
    </div>
  );
};
