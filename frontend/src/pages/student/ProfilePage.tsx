import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserAvatar } from '@/utils/avatar';
import { formatZAR, formatDate } from '@/utils/formatters';
import { EditProfileModal } from './EditProfileModal';
import { SpuPassModal } from './SpuPassModal';
import {
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles,
  QrCode,
  Edit,
  Leaf,
  Coins,
  Recycle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  if (!user) return null;

  // Sustainability impact derived strictly from real user.items_diverted
  const itemsDiverted = user.items_diverted || 0;
  const kgWasteSaved = (itemsDiverted * 1.4).toFixed(1);
  const randsSaved = itemsDiverted * 280; // SPU average clothing cost avoided

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-campus-primary via-slate-800 to-campus-secondary opacity-90" />

        <div className="relative pt-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <img
              src={getUserAvatar(user)}
              alt={user.full_name}
              className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-lg bg-white"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {user.full_name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified SPU Student
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {user.campus_residence || 'Moroka Res'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {user.faculty || 'Faculty of Humanities'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPassModalOpen(true)}
              leftIcon={<QrCode className="w-4 h-4 text-campus-secondary" />}
            >
              SPU QR Pass
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit className="w-4 h-4" />}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Campus Circular Sustainability Impact Dashboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-500" />
            Personal Circular Economy Impact
          </h2>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
            Active Contributor
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Diverted Garments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card space-y-2">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Garments Diverted
              </span>
              <Recycle className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {itemsDiverted}
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Pre-loved apparel items circulated instead of sent to Northern Cape landfills.
            </p>
          </div>

          {/* Card 2: Textile Waste Prevented */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card space-y-2">
            <div className="flex items-center justify-between text-sky-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Waste Prevented
              </span>
              <Leaf className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {kgWasteSaved} <span className="text-sm font-semibold text-slate-400">kg</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Calculated textile weight conserved across completed swaps and donations.
            </p>
          </div>

          {/* Card 3: Rands Saved */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card space-y-2">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Peer Savings
              </span>
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {formatZAR(randsSaved)}
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Estimated budget retained in student pockets vs. commercial retail.
            </p>
          </div>
        </div>
      </div>

      {/* Account Details & Quick Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Account & Campus Standing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <span className="text-slate-400 block text-[11px]">Campus Trust Score</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {user.trust_score || 98}% Excellent Standing
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <span className="text-slate-400 block text-[11px]">Student ID / Number</span>
            <span className="text-base font-extrabold text-slate-800 dark:text-white">
              {user.student_id_number || 'SPU-2023-8942'}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <Link to="/my-listings">
            <Button variant="outline" size="sm">
              Manage My Wardrobe
            </Button>
          </Link>
          <Link to="/favourites">
            <Button variant="outline" size="sm">
              View Wishlist
            </Button>
          </Link>
          <Link to="/campus-safety">
            <Button variant="outline" size="sm">
              Campus Safe Zones
            </Button>
          </Link>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onProfileUpdated={refreshUser}
      />

      <SpuPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        user={user}
      />
    </div>
  );
};
