import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, ExternalLink, X, CheckCircle2 } from 'lucide-react';
import { GOVERNMENT_SCHEMES } from '../data/departments';

interface GovernmentSchemesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GovernmentSchemesModal: React.FC<GovernmentSchemesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white rounded-3xl border border-[#DADCE0] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-[#5F6368]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-[#DADCE0] pb-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#202124] font-heading">
              National Welfare Schemes & Civic Grants
            </h2>
            <p className="text-xs text-[#5F6368]">
              Explore government initiatives connected to grievance resolution & urban development.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {GOVERNMENT_SCHEMES.map((scheme) => (
            <div key={scheme.id} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2563EB] px-2.5 py-0.5 rounded-full bg-blue-50">
                  {scheme.category}
                </span>
                <span className="text-[10px] text-[#5F6368] font-medium">{scheme.department}</span>
              </div>
              <h3 className="text-base font-bold text-[#202124]">{scheme.title}</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">{scheme.description}</p>
              
              <div className="pt-2 border-t border-[#DADCE0] flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Eligibility: {scheme.eligibility}
                </span>
                <a
                  href={scheme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] font-bold inline-flex items-center gap-1 hover:underline"
                >
                  <span>Apply Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
