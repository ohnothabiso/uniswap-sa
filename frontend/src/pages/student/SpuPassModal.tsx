import React from 'react';
import { User } from '@/types';
import { Modal } from '@/components/common/Modal';
import { getUserAvatar } from '@/utils/avatar';
import { ShieldCheck, QrCode, CheckCircle, Sparkles } from 'lucide-react';

interface SpuPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const SpuPassModal: React.FC<SpuPassModalProps> = ({ isOpen, onClose, user }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SPU Student Digital Pass"
      description="Present at monitored checkpoints to verify exchange standing."
      maxWidth="sm"
    >
      <div className="flex flex-col items-center text-center space-y-4 pt-2">
        {/* Digital Pass Card */}
        <div className="w-full bg-gradient-to-b from-campus-primary to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-blue-400/20 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                Sol Plaatje University
              </span>
              <span className="text-xs font-black">Verified Circular Pass</span>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          <img
            src={getUserAvatar(user)}
            alt={user.full_name}
            className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-emerald-400/80 shadow-md"
          />

          <h4 className="text-base font-extrabold text-white truncate">
            {user.full_name}
          </h4>
          <p className="text-xs text-slate-300 truncate">{user.email}</p>
          <p className="text-[11px] text-emerald-300 font-semibold mt-1">
            {user.campus_residence} • {user.student_id_number || 'SPU-2026'}
          </p>

          {/* QR Code Graphic */}
          <div className="my-5 p-3 bg-white rounded-2xl inline-block shadow-inner">
            <svg
              className="w-32 h-32"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Decorative QR Pattern */}
              <rect x="5" y="5" width="25" height="25" fill="#0b2545" rx="4" />
              <rect x="10" y="10" width="15" height="15" fill="#ffffff" rx="2" />
              <rect x="13" y="13" width="9" height="9" fill="#0b2545" />

              <rect x="70" y="5" width="25" height="25" fill="#0b2545" rx="4" />
              <rect x="75" y="10" width="15" height="15" fill="#ffffff" rx="2" />
              <rect x="78" y="13" width="9" height="9" fill="#0b2545" />

              <rect x="5" y="70" width="25" height="25" fill="#0b2545" rx="4" />
              <rect x="10" y="75" width="15" height="15" fill="#ffffff" rx="2" />
              <rect x="13" y="78" width="9" height="9" fill="#0b2545" />

              <rect x="40" y="10" width="8" height="8" fill="#0b2545" />
              <rect x="52" y="10" width="8" height="8" fill="#0b2545" />
              <rect x="40" y="25" width="8" height="8" fill="#0b2545" />
              <rect x="45" y="45" width="12" height="12" fill="#059669" rx="2" />
              <rect x="70" y="45" width="8" height="8" fill="#0b2545" />
              <rect x="82" y="65" width="8" height="8" fill="#0b2545" />
              <rect x="65" y="80" width="8" height="8" fill="#0b2545" />
              <rect x="40" y="75" width="8" height="8" fill="#0b2545" />
            </svg>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Valid at Zones A, B, and C</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          Exchange security pass generated dynamically for active Sol Plaatje University sessions.
        </p>
      </div>
    </Modal>
  );
};
