import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, PhoneCall, CheckCircle2, ShieldAlert, X } from 'lucide-react';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ isOpen, onClose }) => {
  const [sosSent, setSosSent] = useState(false);

  if (!isOpen) return null;

  const handleDispatch = () => {
    setSosSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl border border-red-200 shadow-2xl p-6 relative overflow-hidden text-center space-y-5"
      >
        <button
          onClick={() => {
            setSosSent(false);
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-[#5F6368]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center mx-auto shadow-md">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
            National Emergency Dispatch
          </span>
          <h2 className="text-2xl font-extrabold text-[#202124] font-heading mt-0.5">
            1-Click Emergency SOS
          </h2>
          <p className="text-xs text-[#5F6368] mt-1">
            Immediate high-priority dispatch for live electrical wire, gas leak, water main burst, or public hazard.
          </p>
        </div>

        {!sosSent ? (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-left text-xs space-y-1">
              <span className="font-bold text-[#DC2626]">Geotagged Location Active</span>
              <p className="text-red-900">Ward 174, Outer Ring Rd, Koramangala Junction</p>
            </div>

            <button
              onClick={handleDispatch}
              className="w-full py-3.5 rounded-2xl bg-[#DC2626] hover:bg-red-700 text-white font-extrabold text-sm transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>DISPATCH EMERGENCY ALERTS NOW</span>
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-[#202124] font-bold">
              <span>Fire: <strong>101</strong></span>
              <span>Police: <strong>112</strong></span>
              <span>Disaster: <strong>108</strong></span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#16A34A] mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-[#202124]">Emergency Responders Notified!</h3>
            <p className="text-xs text-[#5F6368]">
              Control room team and municipal quick-response squad have received your GPS coordinates.
            </p>
            <button
              onClick={() => {
                setSosSent(false);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-[#2563EB] text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
