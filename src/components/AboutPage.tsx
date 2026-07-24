import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Building2, Globe, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageRoute } from '../types';

interface AboutPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold border border-blue-200">
          Government of India National Citizen Initiative
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#202124] font-heading tracking-tight">
          About Janseva Portal
        </h1>
        <p className="text-base text-[#5F6368] leading-relaxed">
          Janseva Portal is a next-generation AI-powered grievance management platform bridging the gap between Indian citizens and municipal government departments with zero friction and 100% transparent tracking.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-[#DADCE0] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#202124] font-heading">AI Neural Matrix</h3>
          <p className="text-xs text-[#5F6368] leading-relaxed">
            Powered by Google Gemini 3.6 Flash. Complaints are multi-modally processed with image defect recognition, voice transcription, and automated priority routing.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#DADCE0] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#202124] font-heading">100% Public Transparency</h3>
          <p className="text-xs text-[#5F6368] leading-relaxed">
            Immutable timestamps, officer photo signoffs, and public upvoting ensure accountability. Every citizen can inspect the resolution progress on the live map.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#DADCE0] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#202124] font-heading">Multilingual Accessibility</h3>
          <p className="text-xs text-[#5F6368] leading-relaxed">
            Supporting English, Hindi, Marathi, Tamil, Telugu, Bengali, and Gujarati. Speech-to-Text enables citizens across rural and urban wards to raise complaints effortlessly.
          </p>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="p-8 rounded-3xl bg-[#F8F9FA] border border-[#DADCE0] space-y-6">
        <h2 className="text-2xl font-extrabold text-[#202124] font-heading">
          Technical Architecture & Standards
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#5F6368]">
          <div className="space-y-2">
            <h4 className="font-bold text-[#202124] text-sm">Server-Side Security & AI API</h4>
            <p className="leading-relaxed">
              All Gemini API keys are securely proxied via Node.js Express server endpoints, preventing any client-side credential exposure and ensuring WCAG compliance.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#202124] text-sm">Progressive Web Application (PWA)</h4>
            <p className="leading-relaxed">
              Equipped with Service Worker offline caching, manifest file, and desktop/mobile home screen installation popup for instant 24/7 availability.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <button
            onClick={() => onNavigate('raise-complaint')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs"
          >
            <span>Experience the Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
