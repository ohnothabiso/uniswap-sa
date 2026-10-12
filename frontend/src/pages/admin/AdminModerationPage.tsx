import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '@/services/listingService';
import { moderationService } from '@/services/moderationService';
import { Listing, ModerationLog } from '@/types';
import { formatZAR, formatDate } from '@/utils/formatters';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Eye,
  Loader2,
  FileText,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { Link } from 'react-router-dom';

export const AdminModerationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'listings' | 'logs'>('listings');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');

  // Modal actions
  const [flagTarget, setFlagTarget] = useState<Listing | null>(null);
  const [flagReason, setFlagReason] = useState('Suspected counterfeit or prohibited item');
  const [removeTarget, setRemoveTarget] = useState<Listing | null>(null);
  const [removeReason, setRemoveReason] = useState('Violates Sol Plaatje University safety guidelines');

  // Query all listings for moderation (staff can see all statuses)
  const { data: listingsData, isLoading: isLoadingListings } = useQuery({
    queryKey: ['admin-listings', statusFilter],
    queryFn: () => listingService.getListings({ status: statusFilter === 'all' ? undefined : (statusFilter as any) }),
  });

  const listings: Listing[] = listingsData?.results || [];

  // Query audit logs
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery<ModerationLog[]>({
    queryKey: ['moderation-logs'],
    queryFn: moderationService.getLogs,
    enabled: activeTab === 'logs',
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: number) => moderationService.approveListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-stats'] });
    },
  });

  // Flag mutation
  const flagMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      moderationService.flagListing(id, reason),
    onSuccess: () => {
      setFlagTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-stats'] });
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      moderationService.removeListing(id, reason),
    onSuccess: () => {
      setRemoveTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-stats'] });
    },
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-purple-600" />
            Listing Moderation & Review
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Approve pending student submissions, flag suspicious posts, or view audit logs.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'listings' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'
            }`}
          >
            Moderation Queue
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'logs' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {activeTab === 'listings' ? (
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="flex gap-2 text-xs overflow-x-auto pb-2">
            {['PENDING', 'FLAGGED', 'LIVE', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  statusFilter === tab
                    ? 'bg-purple-700 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab === 'all' ? 'All Statuses' : tab}
              </button>
            ))}
          </div>

          {isLoadingListings ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
              Loading moderation queue...
            </div>
          ) : listings.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No listings currently matching status "{statusFilter}".
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-card divide-y divide-slate-100 dark:divide-slate-800">
              {listings.map((item) => (
                <div
                  key={item.listing_id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={
                        item.cover_image ||
                        item.image_url ||
                        'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            item.status === 'LIVE'
                              ? 'accent'
                              : item.status === 'PENDING'
                              ? 'primary'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-bold">
                          {formatDate(item.date_posted)}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-500">
                        Seller: <strong>{item.seller_name || 'Student'}</strong> ({item.seller_residence || 'SPU'}) • Type: {item.listing_type}
                      </p>
                    </div>
                  </div>

                  {/* Moderation Controls */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <Link to={`/listings/${item.listing_id}`} target="_blank">
                      <Button variant="outline" size="sm" title="Inspect Listing">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </Link>

                    {item.status !== 'LIVE' && (
                      <Button
                        variant="accent"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        onClick={() => approveMutation.mutate(item.listing_id)}
                        isLoading={approveMutation.isPending}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </Button>
                    )}

                    {item.status !== 'FLAGGED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-amber-600 border-amber-300 hover:bg-amber-50 gap-1"
                        onClick={() => setFlagTarget(item)}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Flag
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      size="sm"
                      className="gap-1"
                      onClick={() => setRemoveTarget(item)}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Audit Logs Tab */
        <div className="space-y-4">
          {isLoadingLogs ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No moderation decisions recorded yet.
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-card divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <div key={log.log_id} className="p-4 sm:p-5 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        Action: {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Listing ID: #{log.listing} • Admin ID: #{log.admin}
                    </p>
                    {log.reason && (
                      <p className="text-slate-500 italic">"{log.reason}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flag Listing Modal */}
      <Modal
        isOpen={!!flagTarget}
        onClose={() => setFlagTarget(null)}
        title="Flag Listing for Review"
        description={`Item: "${flagTarget?.title}"`}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Moderation Reason
            </label>
            <input
              type="text"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setFlagTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={flagMutation.isPending}
              onClick={() =>
                flagTarget && flagMutation.mutate({ id: flagTarget.listing_id, reason: flagReason })
              }
            >
              Confirm Flag
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Listing Modal */}
      <Modal
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title="Remove Listing from Marketplace"
        description={`Item: "${removeTarget?.title}"`}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Removal Justification
            </label>
            <input
              type="text"
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={removeMutation.isPending}
              onClick={() =>
                removeTarget && removeMutation.mutate({ id: removeTarget.listing_id, reason: removeReason })
              }
            >
              Confirm Removal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
