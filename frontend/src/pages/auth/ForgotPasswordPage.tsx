import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Info, Send } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-16 max-w-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-2xl flex items-center justify-center mx-auto text-campus-secondary">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Password Recovery
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your Sol Plaatje University email address to receive password reset assistance.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 space-y-3">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Campus Mail Service Notice</p>
                <p className="mt-1 leading-relaxed">
                  Your request for <strong>{email}</strong> has been logged. However, automated SMTP mail delivery is currently awaiting Sol Plaatje University IT gateway integration on this backend node.
                </p>
                <p className="mt-2 text-amber-700 dark:text-amber-300">
                  Please consult SPU Student Affairs or the campus administrator (<code>admin@spu.ac.za</code>) to reset credentials if locked out.
                </p>
              </div>
            </div>
            <Link to="/login" className="block text-center pt-2 font-bold text-campus-primary dark:text-white hover:underline">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                University Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student.number@spu.ac.za"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-campus-secondary transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full py-2.5 bg-campus-primary"
              rightIcon={<Send className="w-4 h-4" />}
            >
              Submit Reset Request
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export const VerifyEmailPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-16 max-w-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-2xl flex items-center justify-center mx-auto text-campus-secondary">
          <Info className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          University Email Status
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Account standing is verified against active Sol Plaatje University email domain records (<code>@spu.ac.za</code>). Outbound token link dispatch is governed by university firewall policies.
        </p>
        <Link to="/explore">
          <Button variant="primary" size="md" className="w-full">
            Browse Campus Marketplace
          </Button>
        </Link>
      </div>
    </div>
  );
};
