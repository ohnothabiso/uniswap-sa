import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moderationService } from '@/services/moderationService';
import { Report } from '@/types';
import { formatDate, exportToCSV } from '@/utils/formatters';
import {
  ShieldAlert,
  Trash2,
  Eye,
  Download,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { Link } from 'react-router-dom';

export const AdminReportsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading, isError, refetch } = useQuery<Report[]>({
    queryKey: ['admin-reports'],
    queryFn: moderationService.getReports,
  });

  const dismissMutation = useMutation({
    mutationFn: (id: number) => moderationService.dismissReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-stats'] });
    },
  });

  const handleExportCSV = () => {
    exportToCSV(
      `uniswap_spu_reports_${new Date().toISOString().slice(0, 10)}`,
      reports,
      [
        { key: 'report_id', label: 'Report ID' },
        { key: 'listing', label: 'Listing ID' },
        { key: 'reason', label: 'Reason' },
        { key: 'status', label: 'Status' },
        { key: 'date_reported', label: 'Reported Date' },
      ]
    );
  };

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
            <ShieldAlert className="w-6 h-6 text-red-600" />
            Urgent Student Reports Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Safety flags submitted by students regarding counterfeit items or policy violations.
          </p>
        </div>

        {reports.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Reports (CSV)
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="p-16 text-center text-xs text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
          Loading reports queue...
        </div>
      )}

      {!isLoading && reports.length === 0 && (
        <EmptyState
          icon={CheckCircle}
          title="No open reports"
          description="All student reports have been addressed or dismissed. Sol Plaatje campus marketplace is clear."
        />
      )}

      {!isLoading && reports.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-card divide-y divide-slate-100 dark:divide-slate-800">
          {reports.map((report) => (
            <div
              key={report.report_id}
              className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="danger" size="sm">
                    {report.status}
                  </Badge>
                  <span className="text-[11px] font-bold text-slate-400">
                    Reported {formatDate(report.date_reported)}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Reason: "{report.reason}"
                </p>

                <p className="text-[11px] text-slate-500">
                  Target Listing ID: #{report.listing}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Link to={`/listings/${report.listing}`} target="_blank">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Inspect Item
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-600 hover:bg-slate-100"
                  onClick={() => dismissMutation.mutate(report.report_id)}
                  isLoading={dismissMutation.isPending}
                >
                  Dismiss Report
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
