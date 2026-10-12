import React from 'react';
import { FileText, Shield } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <FileText className="w-6 h-6 text-campus-secondary" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Terms of Campus Use
        </h1>
      </div>

      <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-5 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. University Eligibility</h2>
          <p>
            UniSwap SA is created exclusively for enrolled students, alumni, and authorized staff of Sol Plaatje University (SPU). Account creation requires an authentic university email ending in <code>@spu.ac.za</code>. Accounts misrepresenting university standing or using unauthorized credentials will be terminated by campus moderators.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Prohibited Items and Conduct</h2>
          <p>
            The marketplace is strictly reserved for pre-loved fashion apparel, footwear, academic gear (lab coats, textbooks, graduation attire), and personal student accessories. The following are strictly prohibited:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Weapons, hazardous materials, or illicit substances.</li>
            <li>Stolen property or university-issued equipment not designated for personal disposal.</li>
            <li>Counterfeit designer clothing falsely advertised as authentic.</li>
            <li>Harassment, abusive messaging, or discriminatory conduct towards peers.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Exchange & Payment Rules</h2>
          <p>
            UniSwap SA does not act as an escrow agent or process electronic bank transfers. All transactions are peer-to-peer cash, direct item swaps, or free student donations coordinated directly between students within monitored SPU Safe Zones.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Moderation & Enforcement</h2>
          <p>
            Campus moderators reserve the right to review, flag, or remove listings reported by students or violating community trust. Repeat offenders will be barred from posting to the campus wardrobe collective.
          </p>
        </section>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <Shield className="w-6 h-6 text-emerald-600" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Privacy Notice & POPIA Compliance
        </h1>
      </div>

      <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-5 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Protection of Personal Information (POPIA)</h2>
          <p>
            In compliance with the South African Protection of Personal Information Act (POPIA), UniSwap SA collects only the information necessary to verify enrollment, maintain campus trust, and coordinate safe wardrobe handovers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. What We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>University Email:</strong> Used strictly for account authentication and domain validation.</li>
            <li><strong>Display Name & Residence:</strong> Displayed to peer students to arrange on-campus meetups.</li>
            <li><strong>Listings & Images:</strong> Publicly visible on the campus feed to facilitate circular fashion trades.</li>
            <li><strong>Direct Messages:</strong> Private between the communicating buyer and seller.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Information Security</h2>
          <p>
            Passwords are encrypted using industry-standard hashing. JWT authentication tokens are rotated to protect sessions. UniSwap SA never sells or distributes student data to commercial advertising brokers.
          </p>
        </section>
      </div>
    </div>
  );
};
