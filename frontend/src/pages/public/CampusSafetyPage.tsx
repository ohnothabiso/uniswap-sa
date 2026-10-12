import React from 'react';
import { ShieldCheck, MapPin, AlertTriangle, CheckCircle2, Clock, Phone, Eye } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';

export const CampusSafetyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          SPU Safe Exchange Protocol
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Campus Meetup Safety Guidelines
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          UniSwap SA prioritizes student safety. All apparel handovers and cash payments should occur strictly at designated Sol Plaatje University exchange checkpoints.
        </p>
      </div>

      {/* 3 Designated SPU Zones */}
      <div className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-campus-secondary" />
          Monitored Campus Safe Zones
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Zone A */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card space-y-3">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              ZONE A
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Central Campus Library Atrium
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ground floor atrium adjacent to the student study hall. Excellent daytime lighting, steady peer foot traffic, and staffed information counter.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Recommended: 08:30 – 17:00</span>
            </div>
          </div>

          {/* Zone B */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card space-y-3">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ZONE B
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Luka Jantjie Wing Security Desk
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Main security checkpoint foyer at Luka Jantjie Hall. Direct proximity to campus protection officers and CCTV coverage.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Recommended: 08:00 – 18:00</span>
            </div>
          </div>

          {/* Zone C */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card space-y-3">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              ZONE C
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Moroka Residence Front Desk
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Residence entry foyer with access-controlled turnstiles and resident assistant desk. Ideal for evening handovers between residence peers.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Recommended: 09:00 – 19:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Protocol Checklist */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 mb-10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Safe Exchange Protocol Checklist
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <Eye className="w-4 h-4 text-campus-secondary shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-white font-semibold">Inspect in Daylight</strong>
              Inspect clothing condition, seams, and fit thoroughly before completing cash payment or swap confirmation.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-white font-semibold">Never Meet Off-Campus</strong>
              Decline requests to meet in secluded areas, private rooms, or outside campus perimeters.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-white font-semibold">Keep Chat on UniSwap SA</strong>
              Do not take conversations off-platform to untracked private chats until basic exchange parameters are agreed.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <Phone className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-white font-semibold">Report Suspicious Behavior</strong>
              Use the built-in report button on any listing or message that appears fraudulent, abusive, or counterfeit.
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link to="/explore">
          <Button variant="primary" size="md">
            Return to Marketplace Feed
          </Button>
        </Link>
      </div>
    </div>
  );
};
