import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { moderationService } from '@/services/moderationService';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Users,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/common/Button';

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['moderation-stats'],
    queryFn: moderationService.getStats,
    refetchInterval: 15000,
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Sol Plaatje University Staff Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Campus Moderation Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time administrative stats, safety flags, and student reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/moderation">
            <Button variant="primary" size="sm" className="bg-purple-700 hover:bg-purple-800 text-white">
              Listing Review Queue
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="outline" size="sm">
              Urgent Reports Queue
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="p-16 text-center text-xs text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
          Querying campus moderation metrics...
        </div>
      )}

      {isError && (
        <div className="p-6 rounded-2xl bg-red-50 text-red-700 text-xs text-center space-y-3">
          <p className="font-bold">Failed to load administrative statistics.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {!isLoading && !isError && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Active Live */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card space-y-2">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Live
              </span>
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.active_listings}
            </div>
            <p className="text-[11px] text-slate-400">Published student wardrobe items</p>
          </div>

          {/* Pending Review */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card space-y-2">
            <div className="flex items-center justify-between text-sky-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pending Review
              </span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.pending_review}
            </div>
            <p className="text-[11px] text-slate-400">Awaiting moderator verification</p>
          </div>

          {/* Flagged */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card space-y-2">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Flagged Items
              </span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.flagged}
            </div>
            <p className="text-[11px] text-slate-400">Under campus safety review</p>
          </div>

          {/* Open Reports */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card space-y-2">
            <div className="flex items-center justify-between text-red-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Open Reports
              </span>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.open_reports}
            </div>
            <p className="text-[11px] text-slate-400">Urgent reports submitted by peers</p>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Link
          to="/admin/moderation"
          className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-card hover:shadow-elevated transition-all flex items-start justify-between group"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-700">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
              Approve, Flag & Remove Listings
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Review marketplace listings submitted across Sol Plaatje University categories and apply moderation decisions.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/reports"
          className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-card hover:shadow-elevated transition-all flex items-start justify-between group"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
              Student Safety Reports Queue
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Inspect listings flagged by university students for policy violations, counterfeiting, or suspicious activity.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
