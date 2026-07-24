import React from 'react';
import { ShieldCheck, PhoneCall, Globe, ArrowUpRight } from 'lucide-react';
import { PageRoute } from '../types';

interface FooterProps {
  onNavigate: (page: PageRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#F8F9FA] border-t border-[#DADCE0] pt-12 pb-8 text-[#5F6368] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#DADCE0]">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
                JP
              </div>
              <span className="text-lg font-bold text-[#202124] tracking-tight font-heading">
                Janseva Portal
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#5F6368]">
              One Nation. One Portal. Every Citizen Heard.
              AI-driven national platform ensuring fast, transparent, and verified citizen grievance redressal.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#202124] font-medium pt-1">
              <PhoneCall className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>National Helpline: <strong className="font-bold">1915</strong> (Toll Free)</span>
            </div>
          </div>

          {/* Col 2: Core Portal Modules */}
          <div>
            <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-3">
              Citizen Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('raise-complaint')} className="hover:text-[#2563EB] transition-colors">
                  Raise AI Complaint
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('track-complaint')} className="hover:text-[#2563EB] transition-colors">
                  Track Complaint Status
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('live-map')} className="hover:text-[#2563EB] transition-colors">
                  Live Grievance Map
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('analytics')} className="hover:text-[#2563EB] transition-colors">
                  National Analytics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('citizen-dashboard')} className="hover:text-[#2563EB] transition-colors">
                  Citizen Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Government & Officer Access */}
          <div>
            <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-3">
              Government Officers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('officer-dashboard')} className="hover:text-[#2563EB] transition-colors">
                  Officer Command Center
                </button>
              </li>
              <li>
                <span className="text-[#5F6368]">Department Dispatch Engine</span>
              </li>
              <li>
                <span className="text-[#5F6368]">AI Priority Matrix</span>
              </li>
              <li>
                <span className="text-[#5F6368]">Resolution Inspection Signoff</span>
              </li>
              <li>
                <span className="text-[#5F6368]">Inter-Departmental Escalation</span>
              </li>
            </ul>
          </div>

          {/* Col 4: AI & Security Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
              AI & Governance Technology
            </h4>
            <div className="p-3 rounded-xl bg-white border border-[#DADCE0] text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-[#2563EB] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Google Gemini 3.6 Neural AI</span>
              </div>
              <p className="text-[11px] text-[#5F6368] leading-tight">
                Automated multi-modal image object detection, voice-to-text, priority estimation & geotagged verification.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#5F6368]">
              <Globe className="w-3.5 h-3.5" />
              <span>National Hackathon 2026 Prototype</span>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5F6368] gap-4">
          <p>© 2026 Janseva Portal • Government of India National Citizen Initiative.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Accessibility Statement</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
