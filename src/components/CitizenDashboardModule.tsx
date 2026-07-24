import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, Search, FileText, Bell, CheckCircle2, Clock, 
  ChevronRight, User, ShieldCheck, MapPin, Sparkles, AlertTriangle
} from 'lucide-react';
import { Complaint, UserProfile, PageRoute } from '../types';
import { DashboardHeader } from './DashboardHeader';

interface CitizenDashboardModuleProps {
  complaints: Complaint[];
  currentUser: UserProfile;
  onNavigate: (page: PageRoute) => void;
  onSelectComplaint: (id: string) => void;
  onLogout?: () => void;
}

export const CitizenDashboardModule: React.FC<CitizenDashboardModuleProps> = ({
  complaints,
  currentUser,
  onNavigate,
  onSelectComplaint,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'my-complaints' | 'notifications'>('my-complaints');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Filter complaints strictly for the current logged-in user
  const myComplaints = complaints.filter((c) => {
    if (filterSearch && !c.title.toLowerCase().includes(filterSearch.toLowerCase()) && !c.id.toLowerCase().includes(filterSearch.toLowerCase())) {
      return false;
    }
    if (!currentUser || !currentUser.isLoggedIn) return false;

    const sub = c.submittedBy;
    const matchesUserId = (c as any).userId === currentUser.id || (sub as any)?.userId === currentUser.id;
    const matchesEmail = Boolean(currentUser.email && (sub as any)?.email && currentUser.email.toLowerCase() === (sub as any).email.toLowerCase());
    const matchesPhone = Boolean(currentUser.phone && sub?.phone && currentUser.phone.replace(/\D/g, '') === sub.phone.replace(/\D/g, ''));
    const matchesName = Boolean(currentUser.name && sub?.name && currentUser.name.trim().toLowerCase() === sub.name.trim().toLowerCase());

    return matchesUserId || matchesEmail || matchesPhone || matchesName;
  });
  const inProgressCount = myComplaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const resolvedCount = myComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  // Build notifications from user's complaints timeline
  const notifications = myComplaints.flatMap((c) =>
    c.timeline
      .filter((t) => t.completed)
      .slice(-2)
      .map((t, idx) => ({
        id: `${c.id}-notif-${idx}`,
        title: `Update on ${c.id}: ${t.title}`,
        time: t.timestamp || 'Recently',
        desc: t.note || `Officer status: ${c.status}. Location: ${c.location.city}`,
        type: c.status === 'Resolved' ? 'resolved' : 'update',
      }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Standard Dashboard Header */}
      <DashboardHeader
        currentUser={currentUser}
        roleLabel="Citizen Dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
        onSearchChange={setFilterSearch}
      />
      
      {/* Profile Welcome Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[#DADCE0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            {currentUser.name ? currentUser.name.charAt(0) : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[#202124] font-heading">
                {currentUser.name || 'Citizen User'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-bold">
                Verified Citizen
              </span>
            </div>
            <p className="text-xs text-[#5F6368] mt-0.5">
              Phone: {currentUser.phone || 'Not provided'} • District: {currentUser.district || 'Municipal Jurisdiction'}
            </p>
          </div>
        </div>

        {/* Quick Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('raise-complaint')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-transform active:scale-95 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Raise Complaint</span>
          </button>

          <button
            onClick={() => onNavigate('track-complaint')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DADCE0] hover:bg-[#F8F9FA] text-[#202124] font-bold text-xs"
          >
            <Search className="w-4 h-4 text-[#5F6368]" />
            <span>Track Status</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0] text-center">
          <span className="text-xs font-bold text-[#5F6368] block">Total Complaints</span>
          <p className="text-3xl font-extrabold text-[#202124] font-heading mt-1">{myComplaints.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200 text-center">
          <span className="text-xs font-bold text-blue-900 block">In Progress</span>
          <p className="text-3xl font-extrabold text-[#2563EB] font-heading mt-1">{inProgressCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center">
          <span className="text-xs font-bold text-emerald-900 block">Resolved</span>
          <p className="text-3xl font-extrabold text-[#16A34A] font-heading mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Main Content Area: My Complaints vs Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: My Complaints List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DADCE0] pb-2">
            <h3 className="text-base font-extrabold text-[#202124] font-heading">
              My Grievance History
            </h3>
            <span className="text-xs text-[#5F6368] font-medium">
              {myComplaints.length} Records Found
            </span>
          </div>

          <div className="space-y-3">
            {myComplaints.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[#DADCE0] text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#202124]">No Complaints Raised Yet</h4>
                  <p className="text-xs text-[#5F6368] mt-1 max-w-sm mx-auto">
                    You have not registered any civic grievances. Report a pothole, water leak, garbage accumulation, or streetlight issue now.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('raise-complaint')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-transform active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Raise Your First Complaint</span>
                </button>
              </div>
            ) : (
              myComplaints.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectComplaint(item.id);
                    onNavigate('track-complaint');
                  }}
                  className="p-4 rounded-2xl bg-white border border-[#DADCE0] hover:border-blue-300 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#202124] font-mono">{item.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#5F6368] font-medium">{item.category}</span>
                  </div>

                  <h4 className="text-sm font-bold text-[#202124] leading-snug">{item.title}</h4>
                  <p className="text-xs text-[#5F6368] line-clamp-1">{item.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#DADCE0]/60 text-xs text-[#5F6368]">
                    <span className="flex items-center gap-1 font-medium text-[#202124]">
                      <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                      {item.location.address}
                    </span>
                    <span className="text-[#2563EB] font-bold flex items-center gap-0.5">
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Notifications & Activity Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#DADCE0] pb-2">
            <h3 className="text-base font-extrabold text-[#202124] font-heading flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#2563EB]" />
              <span>Notifications</span>
            </h3>
            <span className="text-[10px] font-bold text-white bg-[#2563EB] px-2 py-0.5 rounded-full">
              Live Alerts
            </span>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-4 rounded-2xl bg-white border border-[#DADCE0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#202124]">{notif.title}</span>
                  <span className="text-[10px] text-[#5F6368]">{notif.time}</span>
                </div>
                <p className="text-xs text-[#5F6368] leading-relaxed">{notif.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
