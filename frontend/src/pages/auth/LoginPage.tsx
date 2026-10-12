import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { extractErrorMessage } from '@/services/apiClient';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fromLocation = (location.state as any)?.from?.pathname || '/explore';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your university email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: cleanEmail, password });
      navigate(fromLocation, { replace: true });
    } catch (err) {
      const msg = extractErrorMessage(err, 'Invalid university email or password. Please verify your credentials.');
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-950">
      {/* Left Panel: SPU Branding & Mission (Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-campus-primary via-slate-900 to-campus-primaryDark text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="UniSwap Logo" className="w-9 h-9 rounded-xl object-contain bg-white/10 p-1" />
            <span className="font-extrabold text-xl tracking-tight text-white">
              UniSwap<span className="text-campus-secondary">SA</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sol Plaatje University Verified</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight pt-4 leading-snug">
            "Connect. Swap. Thrive."
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            The student marketplace for affordable fashion, smarter peer exchanges, and a sustainable Kimberley campus.
          </p>
        </div>

        <div className="space-y-3 relative z-10 pt-8 border-t border-white/10 text-xs text-slate-300">
          <p className="font-semibold text-white">SPU Monitored Meeting Zones:</p>
          <ul className="space-y-1 text-slate-400">
            <li>• Central Library Ground Floor Atrium</li>
            <li>• Luka Jantjie Wing Security Desk</li>
            <li>• Moroka Residence Front Desk</li>
          </ul>
        </div>
      </div>

      {/* Right Panel: Student Sign-in Form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Sign In to UniSwap SA
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Access your wardrobe, peer swap proposals, and active campus chats.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Sign in unsuccessful</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-campus-secondary focus:border-transparent transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Must end with <code>@spu.ac.za</code>
              </p>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-campus-secondary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-campus-secondary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
              Sign In to Campus Account
            </Button>
          </form>

          {/* Registration Prompt */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            <span>New Sol Plaatje University student? </span>
            <Link
              to="/register"
              className="font-bold text-campus-secondary hover:underline"
            >
              Create student account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
