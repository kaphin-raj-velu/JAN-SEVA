import React from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, Search, MapPin, BarChart3, Mic, Image as ImageIcon, 
  Sparkles, ShieldCheck, Building2, Layers, AlertTriangle, ArrowRight,
  FileText, Bell, User, CheckCircle2, Phone, BookOpen, Clock, Zap, Heart
} from 'lucide-react';
import { PageRoute, Complaint, LanguageCode } from '../types';
import { GOVERNMENT_DEPARTMENTS } from '../data/departments';
import { getTranslation } from '../data/translations';

interface HomeSectionsProps {
  onNavigate: (page: PageRoute) => void;
  recentComplaints: Complaint[];
  onSelectComplaint: (id: string) => void;
  onOpenSOSModal: () => void;
  onOpenSchemesModal: () => void;
  currentLanguage?: LanguageCode;
}

export const HomeSections: React.FC<HomeSectionsProps> = ({
  onNavigate,
  recentComplaints,
  onSelectComplaint,
  onOpenSOSModal,
  onOpenSchemesModal,
  currentLanguage = 'en',
}) => {
  const activeLang: LanguageCode = (currentLanguage as LanguageCode) || 'en';
  const t = (key: string, def?: string) => getTranslation(activeLang, key, def);

  return (
    <div className="space-y-16 py-8">
      
      {/* SECTION 1: HERO & AI LIVE PREVIEW GRID */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col justify-center py-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-semibold uppercase tracking-wider w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
                <span>{t('aiGovernanceBadge', 'AI-Powered Governance')}</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] leading-[1.15] font-bold text-[#202124] tracking-tight">
                {t('heroTitle', 'Your Voice Drives Better Governance.')}
              </h1>

              {/* Subheadline */}
              <p className="text-[16px] sm:text-[18px] leading-relaxed text-[#5F6368] max-w-xl">
                {t('heroSub', 'Janseva Portal enables citizens to report civic issues using AI-powered image, voice, and location data. Ensuring transparent tracking and rapid government response.')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('raise-complaint')}
                  className="px-7 py-3.5 bg-[#2563EB] text-white rounded-full font-semibold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm shadow-blue-200 active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>{t('fileComplaintNow', 'Raise a Complaint')}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => onNavigate('track-complaint')}
                  className="px-7 py-3.5 border border-[#DADCE0] text-[#202124] rounded-full font-semibold text-sm hover:bg-[#F8F9FA] transition-all active:scale-95 flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-[#5F6368]" />
                  <span>{t('trackExistingGrievance', 'Track Status')}</span>
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-[#DADCE0] pt-8 mt-8">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#202124]">{t('statsComplaints', '5M+')}</div>
                  <div className="text-xs text-[#5F6368] font-medium uppercase tracking-wide mt-0.5">{t('statsComplaintsLabel', 'Complaints')}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#202124]">{t('statsDepts', '150+')}</div>
                  <div className="text-xs text-[#5F6368] font-medium uppercase tracking-wide mt-0.5">{t('statsDeptsLabel', 'Departments')}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#16A34A]">{t('statsSat', '98%')}</div>
                  <div className="text-xs text-[#5F6368] font-medium uppercase tracking-wide mt-0.5">{t('statsSatLabel', 'Success Rate')}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#2563EB]">{t('statsAi', '24/7')}</div>
                  <div className="text-xs text-[#5F6368] font-medium uppercase tracking-wide mt-0.5">{t('statsAiLabel', 'AI Support')}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Content: Interactive Cards & AI Preview Showcase */}
          <div className="lg:col-span-5 bg-[#F8F9FA] p-6 sm:p-8 rounded-3xl border border-[#DADCE0] flex flex-col gap-5 justify-between">
            
            {/* Card 1: AI Processing Engine Box */}
            <div className="bg-white rounded-2xl p-5 border border-[#DADCE0] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">AI Processing Engine</span>
                <span className="flex items-center gap-1.5 text-[#16A34A] text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                  LIVE ANALYSIS
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#2563EB] shrink-0">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2563EB] w-4/5 rounded-full animate-pulse" />
                  </div>
                  <span className="text-xs font-bold text-[#202124]">Voice NLP</span>
                </div>

                <div className="p-3.5 bg-[#F8F9FA] rounded-xl border-l-4 border-[#2563EB]">
                  <p className="text-xs italic text-[#5F6368] leading-relaxed">
                    "Heavy water main leakage detected near Sector 4 entrance. Road surface is eroding rapidly..."
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 Grid: Location & Image Recognition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => onNavigate('live-map')}
                className="bg-white p-4 rounded-2xl border border-[#DADCE0] hover:border-[#2563EB] cursor-pointer transition-all group"
              >
                <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#202124] mb-0.5">Location Detection</h3>
                <p className="text-xs text-[#5F6368]">Geo-tagged GPS pin within 3m accuracy.</p>
              </div>

              <div 
                onClick={() => onNavigate('raise-complaint')}
                className="bg-white p-4 rounded-2xl border border-[#DADCE0] hover:border-[#2563EB] cursor-pointer transition-all group"
              >
                <div className="w-9 h-9 bg-red-50 text-[#DC2626] rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#202124] mb-0.5">Image Analysis</h3>
                <p className="text-xs text-[#5F6368]">Automated pothole and water leak detection.</p>
              </div>
            </div>

            {/* Card 3: Dark Accent Recent Resolution Box */}
            <div className="bg-[#202124] text-white p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-white">Latest Resolution</h3>
                <span className="px-2 py-0.5 bg-[#16A34A] text-white text-[10px] rounded uppercase font-bold tracking-wider">
                  Resolved
                </span>
              </div>
              <p className="text-xs text-gray-300 font-medium mb-3">JAN-2026-7210 • Dadar West Sanitation</p>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  SP
                </div>
                <span className="text-xs text-gray-300 italic line-clamp-1">
                  "Dumpster cleared, area disinfected & extra bin installed by BMC crew."
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 2: LATEST PUBLIC COMPLAINTS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-[#DADCE0]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Transparent Public Feed</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] font-heading tracking-tight mt-1">
              Latest Public Complaints
            </h2>
          </div>
          <button
            onClick={() => onNavigate('live-map')}
            className="text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>View All Live on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Editorial list format */}
        <div className="bg-[#FFFFFF] border border-[#DADCE0] rounded-2xl divide-y divide-[#DADCE0] overflow-hidden shadow-xs">
          {recentComplaints.slice(0, 5).map((item) => {
            const statusBg =
              item.status === 'Resolved'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : item.status === 'In Progress'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-blue-50 text-blue-700 border-blue-200';

            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectComplaint(item.id);
                  onNavigate('track-complaint');
                }}
                className="p-4 sm:p-5 hover:bg-[#F8F9FA] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {item.category.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#202124] font-mono">{item.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBg}`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-[#5F6368] font-medium">• {item.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#202124] group-hover:text-[#2563EB] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#5F6368] mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 text-xs text-[#5F6368] border-t sm:border-t-0 pt-2 sm:pt-0 border-[#DADCE0]/60">
                  <div className="flex items-center gap-1 font-medium text-[#202124]">
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{item.location.address}, {item.location.city}</span>
                  </div>
                  <span className="text-[11px] text-[#5F6368] mt-0.5">
                    Dept: <strong className="text-[#202124] font-semibold">{item.department}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: CITIZEN SERVICES */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6 pb-3 border-b border-[#DADCE0]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Core Ecosystem</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] font-heading tracking-tight mt-1">
            Citizen Services
          </h2>
        </div>

        {/* 8 Premium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div
            onClick={() => onNavigate('raise-complaint')}
            className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DADCE0] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124] group-hover:text-[#2563EB] transition-colors">Raise Complaint</h3>
            <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
              Report civic issues using AI camera scanner, voice recording and GPS pin.
            </p>
          </div>

          <div
            onClick={() => onNavigate('track-complaint')}
            className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DADCE0] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124] group-hover:text-[#2563EB] transition-colors">Track Complaint</h3>
            <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
              Real-time timeline tracking from AI verification to officer photo signoff.
            </p>
          </div>

          <div
            onClick={() => onNavigate('citizen-dashboard')}
            className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DADCE0] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124] group-hover:text-[#2563EB] transition-colors">Complaint History</h3>
            <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
              Access all your past submitted complaints, status updates and feedback.
            </p>
          </div>

          <div
            onClick={() => onNavigate('live-map')}
            className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DADCE0] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124] group-hover:text-[#2563EB] transition-colors">Nearby Complaints</h3>
            <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
              Explore geotagged complaints in your neighborhood ward and upvote.
            </p>
          </div>

          <div
            onClick={onOpenSOSModal}
            className="p-5 rounded-2xl bg-[#FFFFFF] border border-red-200 hover:border-red-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#DC2626]">Emergency SOS</h3>
            <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
              Instant 1-click dispatch for electrical fire, main break or public hazard.
            </p>
          </div>

          <div
            onClick={onOpenSchemesModal}
            className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DADCE0] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124] group-hover:text-[#2563EB] transition-colors">Government Schemes</h3>
            <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
              Explore national welfare benefits, Swachh Bharat and PMAY urban grants.
            </p>
          </div>

          <div
            onClick={() => onNavigate('citizen-dashboard')}
            className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DADCE0] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] text-[#5F6368] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Bell className="w-5 h-5 text-[#2563EB]" />
            </div>
            <h3 className="text-base font-bold text-[#202124] group-hover:text-[#2563EB] transition-colors">Notifications</h3>
            <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
              Real-time SMS and push alerts when an officer accepts or resolves your complaint.
            </p>
          </div>

          <div
            onClick={() => onNavigate('citizen-dashboard')}
            className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DADCE0] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124] group-hover:text-[#2563EB] transition-colors">Citizen Profile</h3>
            <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
              Manage your address details, municipal ward, and notification settings.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 4: AI INNOVATION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#F8F9FA] py-12 rounded-3xl border border-[#DADCE0]/80">
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Google Gemini Neural Engine</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] font-heading tracking-tight mt-1">
            AI Innovation in Grievance Management
          </h2>
          <p className="text-sm text-[#5F6368] mt-2 leading-relaxed">
            Eliminating human latency with server-side AI processing. Complaints are analyzed in seconds with 98% departmental accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <div className="p-5 rounded-2xl bg-white border border-[#DADCE0] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">Voice Complaint</h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Citizens can speak in any regional language. Web Speech API + Gemini AI transcribe and convert dialect into formal civic complaints.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#DADCE0] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">Image Recognition</h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Computer vision scans photo uploads to detect potholes, water leakage, trash piles, and dangling wires automatically.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#DADCE0] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">AI Complaint Summary</h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Generates concise 2-sentence executive summaries for government officers to digest and prioritize instantly.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#DADCE0] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">Automatic Department Assignment</h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Routes the case straight to the exact municipal division (e.g. BBMP Roads or Delhi Jal Board) without manual triage delays.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#DADCE0] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">Priority Detection</h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Identifies hazards (e.g. live wire near school) and escalates to 'Critical' status with immediate SMS alerts to officers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#DADCE0] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">Duplicate Complaint Detection</h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Geospatial proximity matching aggregates multiple citizen reports for the same issue to prevent duplicate officer work orders.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 5: GOVERNMENT DEPARTMENTS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6 pb-3 border-b border-[#DADCE0]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">National Network</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] font-heading tracking-tight mt-1">
            Integrated Government Departments
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {GOVERNMENT_DEPARTMENTS.map((dept) => (
            <div
              key={dept.id}
              className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DADCE0] hover:border-blue-300 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2563EB] px-2 py-0.5 rounded-full bg-blue-50">
                  {dept.avgResolutionHours} avg
                </span>
                <span className="text-[10px] text-[#5F6368] font-medium">{dept.satisfaction} sat</span>
              </div>
              <h3 className="text-sm font-bold text-[#202124] leading-snug">{dept.name}</h3>
              <p className="text-[11px] text-[#5F6368] line-clamp-2">{dept.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: ABOUT JANSEVA */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10 border-t border-[#DADCE0]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#202124] font-heading">Mission & Vision</h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              To empower every citizen in India with a transparent, AI-backed digital channel to report civic grievances directly to responsible government officers with guaranteed response times.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#202124] font-heading">Transparency & Accountability</h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Public tracking timelines and geotagged resolution photo proofs eliminate hidden delays. Every complaint status update is logged with officer identity and timestamp.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#202124] font-heading">Citizen-First AI Governance</h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Built following Google Research and modern SaaS design principles. Accessible across desktop, mobile and offline PWA environments with zero friction.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
