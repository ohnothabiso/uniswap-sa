import React from 'react';
import { Category, FeedFilterParams, ListingCondition, ListingType } from '@/types';
import { RefreshCw, Coins, Gift, Filter, X } from 'lucide-react';

interface FilterSidebarProps {
  categories: Category[];
  filters: FeedFilterParams;
  onFilterChange: (newFilters: Partial<FeedFilterParams>) => void;
  onClearFilters: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const dealTypes: { label: string; value: ListingType | 'all'; icon: any }[] = [
    { label: 'All Items', value: 'all', icon: Filter },
    { label: 'Direct Swaps', value: 'SWAP', icon: RefreshCw },
    { label: 'Free Giveaways', value: 'DONATE', icon: Gift },
  ];

  const conditions: { label: string; value: ListingCondition | 'all' }[] = [
    { label: 'All Conditions', value: 'all' },
    { label: 'Brand New', value: 'NEW' },
    { label: 'Like New', value: 'LIKE_NEW' },
    { label: 'Good Condition', value: 'GOOD' },
    { label: 'Fair Wear', value: 'FAIR' },
  ];

  const hasActiveFilters =
    (filters.category && filters.category !== 'all') ||
    (filters.listing_type && filters.listing_type !== 'all') ||
    (filters.condition && filters.condition !== 'all');

  return (
    <aside className="w-full flex flex-col divide-y divide-slate-100 dark:divide-slate-800/80">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-campus-secondary/10 text-campus-secondary">
            <Filter className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Filters
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      {/* Deal Type Filter */}
      <div className="py-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
          Deal Type
        </label>
        <div className="flex flex-col gap-1.5">
          {dealTypes.map((deal) => {
            const Icon = deal.icon;
            const isSelected = (filters.listing_type || 'all') === deal.value;
            return (
              <button
                key={deal.value}
                onClick={() => onFilterChange({ listing_type: deal.value, page: 1 })}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-campus-primary text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{deal.label}</span>
                </div>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Campus Category Filter */}
      <div className="py-5">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Campus Category
          </label>
          {categories.length > 0 && (
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {categories.length} items
            </span>
          )}
        </div>

        {/* Category List: comfortable padding, clear line-height, no text overlap */}
        <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-2">
          <button
            onClick={() => onFilterChange({ category: 'all', page: 1 })}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-between ${
              !filters.category || filters.category === 'all'
                ? 'bg-blue-50 text-campus-secondary font-semibold dark:bg-blue-950/60 dark:text-blue-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
            }`}
          >
            <span className="leading-snug">All Categories</span>
            {(!filters.category || filters.category === 'all') && (
              <span className="w-1.5 h-1.5 rounded-full bg-campus-secondary shrink-0 ml-2" />
            )}
          </button>

          {categories.map((cat) => {
            const isSelected = String(filters.category) === String(cat.category_id);
            return (
              <button
                key={cat.category_id}
                onClick={() => onFilterChange({ category: cat.category_id, page: 1 })}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-50 text-campus-secondary font-semibold dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                }`}
              >
                <span className="leading-snug break-words pr-2">
                  {cat.category_name}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-campus-secondary shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Item Condition Filter */}
      <div className="py-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
          Condition
        </label>
        <select
          value={filters.condition || 'all'}
          onChange={(e) =>
            onFilterChange({ condition: e.target.value as ListingCondition | 'all', page: 1 })
          }
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-campus-secondary focus:border-transparent transition-all shadow-xs"
        >
          {conditions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
};
