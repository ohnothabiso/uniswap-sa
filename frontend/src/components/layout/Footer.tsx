import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 text-slate-600 dark:text-slate-400 text-xs">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-campus-primary dark:text-white">
                UniSwap<span className="text-campus-secondary">SA</span>
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Sol Plaatje University
              </span>
            </div>
            <p className="font-medium text-slate-700 dark:text-slate-300">
              "Connect. Swap. Thrive."
            </p>
            <p className="max-w-md text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              The South African university student marketplace for affordable fashion, smarter exchanges, and a more sustainable campus. Diverting textile waste while easing financial pressure in student accommodation.
            </p>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>SPU Monitored Safe Zones: Central Library, Luka Jantjie, Moroka Res</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Marketplace
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/explore" className="hover:text-campus-secondary transition-colors">
                  Explore Wardrobe Feed
                </Link>
              </li>
              <li>
                <Link to="/listings/create" className="hover:text-campus-secondary transition-colors">
                  List Pre-Loved Item
                </Link>
              </li>
              <li>
                <Link to="/favourites" className="hover:text-campus-secondary transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/campus-safety" className="hover:text-campus-secondary transition-colors">
                  Safe Exchange Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Policy */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Campus Trust & Policy
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/campus-safety" className="hover:text-campus-secondary transition-colors">
                  Safe Exchange Protocol
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-campus-secondary transition-colors">
                  Terms of Campus Use
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-campus-secondary transition-colors">
                  Privacy Notice & POPIA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <p>© {new Date().getFullYear()} UniSwap SA. Sol Plaatje University Student Circular Economy Initiative.</p>
          <div className="flex items-center gap-1.5">
            <span>Built with care for SPU students</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>in Kimberley, Northern Cape</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
