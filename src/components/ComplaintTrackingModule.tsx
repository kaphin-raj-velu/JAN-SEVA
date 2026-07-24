import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, CheckCircle2, Clock, MapPin, User, ShieldCheck, 
  PhoneCall, ThumbsUp, Sparkles, Building2, ChevronRight, FileText, Share2, Lock, X, ZoomIn
} from 'lucide-react';
import { Complaint, UserProfile } from '../types';

interface ComplaintTrackingModuleProps {
  complaints: Complaint[];
  currentUser?: UserProfile;
  selectedId?: string;
  onSelectComplaint: (id: string) => void;
}

export const ComplaintTrackingModule: React.FC<ComplaintTrackingModuleProps> = ({
  complaints,
  currentUser,
  selectedId,
  onSelectComplaint,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(selectedId || '');
  const [activePhotoModal, setActivePhotoModal] = useState<{ url: string; title: string } | null>(null);

  // User matching helper for privacy constraint
  const isUserMatch = (c: Complaint) => {
    if (!currentUser || !currentUser.isLoggedIn) return true; // public portal allows search by explicit ID
    if (currentUser.role === 'admin' || currentUser.role === 'officer') return true;

    const sub = c.submittedBy;
    const matchesUserId = (c as any).userId === currentUser.id || (sub as any)?.userId === currentUser.id;
    const matchesEmail = Boolean(currentUser.email && (sub as any)?.email && currentUser.email.toLowerCase() === (sub as any).email.toLowerCase());
    const matchesPhone = Boolean(currentUser.phone && sub?.phone && currentUser.phone.replace(/\D/g, '') === sub.phone.replace(/\D/g, ''));
    const matchesName = Boolean(currentUser.name && sub?.name && currentUser.name.trim().toLowerCase() === sub.name.trim().toLowerCase());

    return matchesUserId || matchesEmail || matchesPhone || matchesName;
  };

  const visibleComplaints = currentUser?.isLoggedIn && currentUser.role === 'citizen'
    ? complaints.filter(isUserMatch)
    : complaints;

  // Search finding
  const searchedComplaint = complaints.find((c) => c.id.toUpperCase() === searchQuery.trim().toUpperCase());
  const isSearchRestricted = searchedComplaint && currentUser?.isLoggedIn && currentUser.role === 'citizen' && !isUserMatch(searchedComplaint);

  const currentComplaint = isSearchRestricted
    ? null
    : (searchedComplaint ||
       visibleComplaints.find((c) => c.id === selectedId) ||
       visibleComplaints[0] ||
       complaints.find((c) => c.id === selectedId) ||
       complaints[0]);

  const handleUpvote = () => {
    if (currentComplaint) {
      currentComplaint.upvotes += 1;
      alert(`Upvoted complaint ${currentComplaint.id}! Current upvotes: ${currentComplaint.upvotes}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Search & Filter Bar */}
      <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-[#DADCE0] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Transparent Public Ledger
            </span>
            <h2 className="text-2xl font-extrabold text-[#202124] font-heading tracking-tight mt-0.5">
              Track Complaint Status
            </h2>
            {currentUser?.isLoggedIn && currentUser.role === 'citizen' && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Showing grievance records registered for <span className="font-bold text-slate-800">{currentUser.name}</span>
              </p>
            )}
          </div>

          {/* Quick complaint switcher pill selection */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[#5F6368] font-medium text-[11px] shrink-0">Quick IDs:</span>
            {visibleComplaints.length === 0 ? (
              <span className="text-xs text-amber-600 font-semibold italic">No complaints filed under this account</span>
            ) : (
              visibleComplaints.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSearchQuery(c.id);
                    onSelectComplaint(c.id);
                  }}
                  className={`px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold transition-colors ${
                    currentComplaint?.id === c.id
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-white text-[#202124] border-[#DADCE0] hover:bg-blue-50'
                  }`}
                >
                  {c.id}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Input search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-[#5F6368]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Complaint ID e.g. JAN-2026-9842"
            className="w-full pl-11 pr-28 py-3 rounded-2xl bg-white border border-[#DADCE0] focus:border-[#2563EB] focus:outline-hidden text-sm font-semibold tracking-wide uppercase font-mono"
          />
          <button
            onClick={() => {
              if (searchQuery.trim()) {
                onSelectComplaint(searchQuery.trim());
              }
            }}
            className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
          >
            Track
          </button>
        </div>
      </div>

      {isSearchRestricted ? (
        <div className="p-10 rounded-3xl bg-amber-50 border border-amber-200 text-center space-y-3">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-amber-900 font-heading">Privacy Protected Record</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            This complaint (<span className="font-mono font-bold">{searchQuery}</span>) is associated with another citizen profile. Each user can only view complaints registered under their own verified account.
          </p>
        </div>
      ) : currentComplaint ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Timeline & Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header summary card */}
            <div className="p-6 rounded-3xl bg-white border border-[#DADCE0] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DADCE0] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-[#202124] font-mono">
                    {currentComplaint.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      currentComplaint.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : currentComplaint.status === 'In Progress'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {currentComplaint.status}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200">
                    {currentComplaint.priority} Priority
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleUpvote}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] hover:bg-blue-100 text-xs font-bold transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{currentComplaint.upvotes} Upvotes</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert(`Complaint link copied for ${currentComplaint.id}`);
                    }}
                    className="p-1.5 rounded-full hover:bg-[#F8F9FA] text-[#5F6368]"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-xl font-bold text-[#202124] font-heading">
                {currentComplaint.title}
              </h1>

              <p className="text-xs text-[#5F6368] leading-relaxed">
                {currentComplaint.description}
              </p>

              {/* Photos */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div 
                  onClick={() => setActivePhotoModal({ url: currentComplaint.image, title: 'Citizen Field Photo Proof' })}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#DADCE0]"
                >
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block mb-1">Citizen Photo Proof</span>
                  <div className="relative">
                    <img
                      src={currentComplaint.image}
                      alt="Citizen Upload"
                      className="h-36 w-full object-cover rounded-xl transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold rounded-xl">
                      <ZoomIn className="w-4 h-4" />
                      <span>Click to Enlarge</span>
                    </div>
                  </div>
                </div>

                {currentComplaint.resolutionPhoto ? (
                  <div 
                    onClick={() => setActivePhotoModal({ url: currentComplaint.resolutionPhoto!, title: 'Officer Field & Resolution Photo Proof' })}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-emerald-500 bg-emerald-50/40 p-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between px-1 mb-1">
                      <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Officer Field Photo Proof</span>
                      <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full">Verified Proof</span>
                    </div>
                    <div className="relative">
                      <img
                        src={currentComplaint.resolutionPhoto}
                        alt="Officer Resolution"
                        className="h-32 w-full object-cover rounded-lg transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-emerald-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold rounded-lg backdrop-blur-xs">
                        <ZoomIn className="w-4 h-4" />
                        <span>Enlarge Officer Photo</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-36 rounded-xl border border-dashed border-[#DADCE0] bg-[#F8F9FA] flex flex-col items-center justify-center text-center p-3">
                    <span className="text-xs font-bold text-slate-500">Awaiting Officer Field Photo</span>
                    <span className="text-[11px] text-[#5F6368] mt-1">Officer resolution photo will appear here once uploaded by the field engineer.</span>
                  </div>
                )}
              </div>

            </div>

            {/* TIMELINE SECTION */}
            <div className="p-6 rounded-3xl bg-white border border-[#DADCE0] space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-[#DADCE0]">
                <h3 className="text-base font-extrabold text-[#202124] font-heading flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2563EB]" />
                  <span>Live Grievance Tracking Timeline</span>
                </h3>
                <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Current Status: {currentComplaint.status}
                </span>
              </div>

              <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DADCE0]">
                {(() => {
                  const status = currentComplaint.status;
                  const officerName = currentComplaint.assignedOfficer?.name || 'Department Officer';
                  const citizenName = currentComplaint.submittedBy?.name || 'Citizen';

                  const isAccepted = ['Officer Accepted', 'Inspection', 'In Progress', 'Resolved', 'Closed'].includes(status);
                  const isInspected = ['Inspection', 'In Progress', 'Resolved', 'Closed'].includes(status);
                  const isInProgress = ['In Progress', 'Resolved', 'Closed'].includes(status);
                  const isResolved = ['Resolved', 'Closed'].includes(status);

                  const customAccepted = currentComplaint.timeline.find(t => t.title.toLowerCase().includes('accept') || t.title.toLowerCase().includes('assign'));
                  const customInspection = currentComplaint.timeline.find(t => t.title.toLowerCase().includes('inspect'));
                  const customProgress = currentComplaint.timeline.find(t => t.title.toLowerCase().includes('progress') || t.title.toLowerCase().includes('work'));
                  const customResolved = currentComplaint.timeline.find(t => t.title.toLowerCase().includes('resolv') || t.title.toLowerCase().includes('signoff'));

                  const steps = [
                    {
                      num: 1,
                      title: 'Complaint Registered & AI Verified',
                      completed: true,
                      active: false,
                      statusBadge: 'Completed',
                      actor: citizenName,
                      timestamp: currentComplaint.timeline[0]?.timestamp || '08:30 AM',
                      note: 'Logged in portal and analyzed by Gemini Vision AI',
                    },
                    {
                      num: 2,
                      title: 'Department Auto-Assigned',
                      completed: true,
                      active: false,
                      statusBadge: 'Completed',
                      actor: 'Janseva Dispatch System',
                      timestamp: currentComplaint.timeline[1]?.timestamp || currentComplaint.timeline[0]?.timestamp || '08:31 AM',
                      note: `Automated route to ${currentComplaint.department}`,
                    },
                    {
                      num: 3,
                      title: 'Assigned to Ward Engineer',
                      completed: isAccepted,
                      active: !isAccepted && (status === 'Submitted' || status === 'AI Verified'),
                      statusBadge: isAccepted ? 'Completed' : 'Pending',
                      actor: isAccepted ? (customAccepted?.actor || officerName) : undefined,
                      timestamp: isAccepted ? (customAccepted?.timestamp || 'Updated') : 'Pending',
                      note: customAccepted?.note || (isAccepted ? 'Work order accepted by ward engineer.' : undefined),
                    },
                    {
                      num: 4,
                      title: 'Officer Field Inspection',
                      completed: isInspected,
                      active: status === 'Officer Accepted' || status === 'Inspection',
                      statusBadge: isInspected ? 'Completed' : (status === 'Officer Accepted' ? 'In Progress' : 'Pending'),
                      actor: isInspected || status === 'Officer Accepted' ? (customInspection?.actor || officerName) : undefined,
                      timestamp: isInspected ? (customInspection?.timestamp || 'Updated') : 'Pending',
                      note: customInspection?.note || (status === 'Inspection' ? 'On-site field inspection conducted.' : undefined),
                    },
                    {
                      num: 5,
                      title: 'Work In Progress',
                      completed: isInProgress,
                      active: status === 'In Progress',
                      statusBadge: isInProgress ? 'Completed' : (status === 'Inspection' ? 'In Progress' : 'Pending'),
                      actor: isInProgress || status === 'In Progress' ? (customProgress?.actor || officerName) : undefined,
                      timestamp: isInProgress ? (customProgress?.timestamp || 'Updated') : 'Pending',
                      note: customProgress?.note || (status === 'In Progress' ? 'Maintenance crew deployed at site.' : undefined),
                    },
                    {
                      num: 6,
                      title: 'Resolution & Signoff',
                      completed: isResolved,
                      active: status === 'In Progress',
                      statusBadge: isResolved ? 'Completed' : 'Pending',
                      actor: isResolved ? (customResolved?.actor || officerName) : undefined,
                      timestamp: isResolved ? (customResolved?.timestamp || 'Just now') : 'Pending',
                      note: currentComplaint.resolutionNote || customResolved?.note || (isResolved ? 'Issue verified and resolved with proof photo.' : undefined),
                    },
                  ];

                  return steps.map((step, idx) => (
                    <motion.div
                      key={step.num}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative flex items-center justify-between gap-4"
                    >
                      {/* Circle Node with Number */}
                      <div
                        className={`absolute -left-7.5 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                          step.completed
                            ? 'bg-[#16A34A] text-white ring-4 ring-emerald-50'
                            : step.active
                            ? 'bg-[#2563EB] text-white ring-4 ring-blue-100 animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {step.completed ? '✓' : step.num}
                      </div>

                      <div className="space-y-0.5 flex-1 pr-2">
                        <p className={`text-xs font-bold ${step.completed || step.active ? 'text-[#202124]' : 'text-slate-400'}`}>
                          {step.num}. {step.title}
                        </p>
                        {step.actor && (
                          <p className="text-[11px] text-[#2563EB] font-medium">
                            Officer: {step.actor}
                          </p>
                        )}
                        {step.note && (
                          <p className="text-[11px] text-[#5F6368] italic">
                            "{step.note}"
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          step.statusBadge === 'Completed'
                            ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                            : step.statusBadge === 'In Progress'
                            ? 'bg-blue-50 text-[#2563EB] border-blue-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          {step.statusBadge}
                        </span>
                        <span className="text-[10px] font-medium text-[#5F6368]">
                          {step.timestamp}
                        </span>
                      </div>
                    </motion.div>
                  ));
                })()}
              </div>
            </div>

          </div>

          {/* Right Col: AI Summary & Officer Contact */}
          <div className="space-y-6">
            
            {/* AI Summary Card */}
            <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#2563EB]" />
                  Janseva AI Summary
                </span>
                <span className="text-[10px] font-bold text-[#2563EB] bg-white px-2 py-0.5 rounded-full border border-blue-200">
                  {currentComplaint.confidenceScore}% Score
                </span>
              </div>

              <p className="text-xs text-[#202124] font-medium leading-relaxed">
                {currentComplaint.aiSummary}
              </p>

              <div className="pt-2 border-t border-blue-200/80 text-[11px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#5F6368]">Assigned Dept:</span>
                  <strong className="text-[#202124]">{currentComplaint.department}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5F6368]">Est. Resolution:</span>
                  <strong className="text-[#16A34A]">{currentComplaint.estimatedResolution}</strong>
                </div>
              </div>
            </div>

            {/* Assigned Officer Card */}
            {currentComplaint.assignedOfficer && (
              <div className="p-5 rounded-3xl bg-white border border-[#DADCE0] space-y-4">
                <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider block">
                  Assigned Municipal Officer
                </span>

                <div className="flex items-center gap-3">
                  <img
                    src={currentComplaint.assignedOfficer.avatar}
                    alt={currentComplaint.assignedOfficer.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#DADCE0]"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#202124]">
                      {currentComplaint.assignedOfficer.name}
                    </h4>
                    <p className="text-[11px] text-[#5F6368]">
                      {currentComplaint.assignedOfficer.designation}
                    </p>
                    <p className="text-[10px] text-[#2563EB] font-semibold">
                      {currentComplaint.assignedOfficer.department}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${currentComplaint.assignedOfficer.phone}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#DADCE0] hover:bg-blue-50 text-[#2563EB] font-semibold text-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Officer ({currentComplaint.assignedOfficer.phone})</span>
                </a>
              </div>
            )}

            {/* Location & Citizen Card */}
            <div className="p-5 rounded-3xl bg-white border border-[#DADCE0] text-xs space-y-3">
              <div>
                <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Location Geotag</span>
                <p className="text-[#202124] font-semibold mt-0.5">
                  {currentComplaint.location.address}, {currentComplaint.location.city}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Submitted By</span>
                <p className="text-[#202124] font-semibold mt-0.5">
                  {currentComplaint.submittedBy.anonymous ? 'Anonymous Citizen' : currentComplaint.submittedBy.name}
                </p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white border border-[#DADCE0] text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#202124]">No Complaint Selected</h3>
          <p className="text-xs text-[#5F6368] max-w-md mx-auto">
            Enter a valid Complaint ID in the search box above or raise a new complaint to track real-time resolution status, assigned officers, and AI geotag analysis.
          </p>
        </div>
      )}

      {/* Enlarge Photo Modal */}
      <AnimatePresence>
        {activePhotoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative border border-slate-200"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h4 className="font-bold text-sm text-slate-800">{activePhotoModal.title}</h4>
                <button
                  onClick={() => setActivePhotoModal(null)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-slate-900 flex items-center justify-center min-h-[300px]">
                <img
                  src={activePhotoModal.url}
                  alt={activePhotoModal.title}
                  className="max-h-[75vh] w-auto object-contain rounded-xl shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
