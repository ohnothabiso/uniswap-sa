import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  RefreshCw,
  Gift,
  Coins,
  ArrowRight,
  CheckCircle,
  Building2,
  TreePine,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/common/Button';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 py-16 md:py-24 border-b border-slate-200/60 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/80 text-campus-primary dark:text-blue-300 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sol Plaatje University Campus Wardrobe Collective
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.15]">
                Connect. Swap. <span className="text-campus-secondary">Thrive.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                The verified student marketplace for affordable fashion, smarter peer exchanges, and a sustainable Kimberley campus.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link to="/explore">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto text-sm px-6 py-3 bg-campus-primary hover:bg-campus-primaryDark"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Explore Campus Wardrobe
                  </Button>
                </Link>

                {!isAuthenticated ? (
                  <Link to="/register">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto text-sm px-6 py-3"
                    >
                      Join UniSwap (@spu.ac.za)
                    </Button>
                  </Link>
                ) : (
                  <Link to="/listings/create">
                    <Button
                      variant="accent"
                      size="lg"
                      className="w-full sm:w-auto text-sm px-6 py-3"
                    >
                      List an Item
                    </Button>
                  </Link>
                )}
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/60 dark:border-slate-800 text-left max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>SPU Only</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Verified university emails</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                    <ShieldCheck className="w-4 h-4 text-sky-500" />
                    <span>Safe Zones</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Monitored campus meetups</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                    <TreePine className="w-4 h-4 text-emerald-600" />
                    <span>Zero Waste</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Circular campus fashion</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900 p-3 shadow-2xl border border-slate-200/80 dark:border-slate-800">
                <img
                  src="/assets/katlego.png"
                  alt="Sol Plaatje University Student"
                  className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Overlay Card 1: Safe Zone Meetup */}
                <div className="absolute top-6 left-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-lg flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-campus-secondary shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      SPU Central Library Ground Floor
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Active Guarded Exchange Point
                    </p>
                  </div>
                </div>

                {/* Overlay Card 2: Deal Example */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Direct Peer Swap
                      </p>
                      <p className="text-[11px] text-slate-500">Hoodie for Denim Jacket</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                    Cash-Free
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-campus-secondary">
              Campus Circular Model
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              100% Cash-Free Campus Exchange
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Zero cash transactions, zero selling, no prices. Exchange apparel and campus gear through mutual peer swaps or generous student donations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 1: Direct Swaps */}
            <div className="bg-slate-50 dark:bg-slate-950 p-7 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/80 rounded-2xl flex items-center justify-center text-emerald-600">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                1. Direct Peer Swaps
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Exchange garments you no longer wear for something you need without spending a cent. Coordinate through built-in safe chat and meet at verified SPU checkpoints.
              </p>
            </div>

            {/* 2: Free Student Donations */}
            <div className="bg-slate-50 dark:bg-slate-950 p-7 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-950/80 rounded-2xl flex items-center justify-center text-sky-600">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                2. Free Academic Donations & Giveaways
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Graduating or clearing residence space? Give away lab coats, formal wear, textbooks, or warm winter hoodies freely to fellow students who need them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SPU Campus Monitored Zones Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="bg-campus-primary text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SPU Safe Exchange Protocol</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Exchange with Confidence at Sol Plaatje University
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                UniSwap SA handovers take place exclusively within monitored campus zones equipped with campus security presence and high-visibility student foot traffic:
              </p>
              <ul className="space-y-2 text-xs text-slate-200 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <strong>Zone A:</strong> Central Campus Library Ground Floor Atrium
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <strong>Zone B:</strong> Luka Jantjie Wing Security Desk
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <strong>Zone C:</strong> Moroka Residence Front Desk Entrance
                </li>
              </ul>
              <div className="pt-4">
                <Link to="/campus-safety">
                  <Button
                    variant="accent"
                    size="md"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                  >
                    Read Safe Exchange Guidelines
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
