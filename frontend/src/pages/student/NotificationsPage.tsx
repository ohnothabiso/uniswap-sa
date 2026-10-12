import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { formatRelativeTime } from '@/utils/formatters';
import {
  Bell,
  CheckCircle,
  CheckCheck,
  AlertTriangle,
  Gift,
  RefreshCw,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
  });

  const markOneReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TRADE_COMPLETED':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'LISTING_APPROVED':
        return <Gift className="w-5 h-5 text-sky-500" />;
      case 'LISTING_FLAGGED':
      case 'LISTING_REMOVED':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-campus-secondary" />;
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-campus-secondary" />
            Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time milestones, trade updates, and moderation feedback from SPU campus.
          </p>
        </div>

        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
            leftIcon={<CheckCheck className="w-4 h-4" />}
          >
            Mark All Read
          </Button>
        )}
      </div>

      {isLoading && <TableSkeleton rows={4} />}

      {!isLoading && notifications.length === 0 && (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You'll be alerted when peers propose trades, save your listings, or when campus moderation approves your posts."
        />
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.notification_id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                notif.is_read
                  ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  : 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                {getNotificationIcon(notif.notification_type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <p className={`text-xs leading-relaxed ${notif.is_read ? 'text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>
                  {notif.message}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>{formatRelativeTime(notif.created_at)}</span>
                  {notif.link && (
                    <Link
                      to={notif.link}
                      className="text-campus-secondary font-bold hover:underline inline-flex items-center gap-1"
                    >
                      View related item <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => markOneReadMutation.mutate(notif.notification_id)}
                  title="Mark as read"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
