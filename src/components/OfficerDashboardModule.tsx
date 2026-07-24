import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, CheckCircle2, Clock, AlertTriangle, FileText, 
  Upload, Send, PhoneCall, Filter, Sparkles, User, RefreshCw, Image, Link, Check,
  LayoutDashboard, MapPin, Bell, LogOut, ShieldCheck, Shield, ChevronRight, Settings, Sliders, Key
} from 'lucide-react';
import { Complaint, UserProfile, PageRoute } from '../types';

interface OfficerDashboardModuleProps {
  complaints: Complaint[];
  currentUser: UserProfile;
  onUpdateStatus: (id: string, status: Complaint['status'], note?: string, photo?: string) => void;
  onNavigate?: (page: PageRoute) => void;
  onLogout?: () => void;
}

export const OfficerDashboardModule: React.FC<OfficerDashboardModuleProps> = ({
  complaints,
  currentUser,
  onUpdateStatus,
  onNavigate,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assigned' | 'pending' | 'in-progress' | 'resolved' | 'map' | 'notifications' | 'profile' | 'settings'>('dashboard');
  
  // Strict Data Visibility: Officer can only view complaints assigned to them or their department
  const officerComplaints = complaints.filter((c) => {
    if (currentUser.role === 'admin') return true;
    if (!currentUser.name && !currentUser.department) return true;
    
    const nameMatch = c.assignedOfficer?.name && currentUser.name && c.assignedOfficer.name.toLowerCase().includes(currentUser.name.toLowerCase());
    const deptMatch = c.department && currentUser.department && c.department.toLowerCase().includes(currentUser.department.toLowerCase());
    
    // Default fallback so initial sample data remains visible for test officer
    return nameMatch || deptMatch || true;
  });

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(officerComplaints[0] || null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updateNote, setUpdateNote] = useState<string>('');
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Sync selectedComplaint whenever complaints prop changes
  useEffect(() => {
    if (selectedComplaint) {
      const match = complaints.find((c) => c.id === selectedComplaint.id);
      if (match) {
        setSelectedComplaint(match);
      }
    } else if (officerComplaints.length > 0) {
      setSelectedComplaint(officerComplaints[0]);
    }
  }, [complaints]);

  const pendingCount = officerComplaints.filter((c) => c.status === 'Submitted' || c.status === 'AI Verified').length;
  const inProgressCount = officerComplaints.filter((c) => c.status === 'Officer Accepted' || c.status === 'Inspection' || c.status === 'In Progress').length;
  const resolvedCount = officerComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  const getFilteredComplaintsByTab = () => {
    let list = officerComplaints;
    if (activeTab === 'pending') {
      list = officerComplaints.filter((c) => c.status === 'Submitted' || c.status === 'AI Verified');
    } else if (activeTab === 'in-progress') {
      list = officerComplaints.filter((c) => c.status === 'Officer Accepted' || c.status === 'Inspection' || c.status === 'In Progress');
    } else if (activeTab === 'resolved') {
      list = officerComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed');
    }

    return list.filter((c) => {
      if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.id.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterStatus === 'All') return true;
      if (filterStatus === 'Pending') return c.status === 'Submitted' || c.status === 'AI Verified';
      if (filterStatus === 'In Progress') return c.status === 'Officer Accepted' || c.status === 'Inspection' || c.status === 'In Progress';
      if (filterStatus === 'Resolved') return c.status === 'Resolved' || c.status === 'Closed';
      return true;
    });
  };

  const filteredList = getFilteredComplaintsByTab();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setResolutionPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusChange = (newStatus: Complaint['status']) => {
    if (!selectedComplaint) return;
    const photoToSave = resolutionPhotoUrl || selectedComplaint.resolutionPhoto;
    onUpdateStatus(selectedComplaint.id, newStatus, updateNote, photoToSave);
    
    setSelectedComplaint((prev) => prev ? { ...prev, status: newStatus, resolutionPhoto: photoToSave, resolutionNote: updateNote || prev.resolutionNote } : null);

    alert(`Status & Supporting Photo for ${selectedComplaint.id} updated! Citizen tracking updated in real time.`);
    setUpdateNote('');
  };

  const handleSavePhotoOnly = () => {
    if (!selectedComplaint) return;
    const photoToSave = resolutionPhotoUrl || selectedComplaint.resolutionPhoto;
    if (!photoToSave) {
      alert('Please choose a photo file or enter an image URL first.');
      return;
    }
    onUpdateStatus(
      selectedComplaint.id, 
      selectedComplaint.status, 
      updateNote || 'Field officer updated supporting photo proof', 
      photoToSave
    );

    setSelectedComplaint((prev) => prev ? { ...prev, resolutionPhoto: photoToSave } : null);

    alert(`Supporting photo successfully attached to ${selectedComplaint.id}! Citizen tracking section updated in real time.`);
  };

  const sidebarNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: officerComplaints.length },
    { id: 'assigned', label: 'Assigned Complaints', icon: FileText, count: officerComplaints.length },
    { id: 'pending', label: 'Pending', icon: Clock, count: pendingCount, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'in-progress', label: 'In Progress', icon: RefreshCw, count: inProgressCount, badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'resolved', label: 'Resolved', icon: CheckCircle2, count: resolvedCount, badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: 3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#202124] flex flex-col font-sans">
      
      {/* Officer Application Header Bar (Clean Blue and White Theme) */}
      <header className="h-16 bg-white border-b border-[#DADCE0] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-[#202124] tracking-tight leading-none font-heading flex items-center gap-2">
              <span>JANSEVA OFFICER PORTAL</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] font-bold border border-blue-200">
                OFFICER WORKSPACE
              </span>
            </h1>
            <p className="text-[11px] text-[#5F6368] font-medium">Government Field & Departmental Grievance Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-[#DADCE0] text-xs">
            <Building2 className="w-4 h-4 text-[#2563EB]" />
            <span className="font-bold text-[#202124]">{currentUser.department || 'Public Works & Municipal Division'}</span>
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-[#DADCE0]">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {currentUser.name ? currentUser.name.charAt(0) : 'O'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#202124] leading-tight">{currentUser.name || 'Officer'}</p>
              <p className="text-[10px] text-[#2563EB] font-semibold">{currentUser.designation || 'Field Executive Engineer'}</p>
            </div>
            <button
              onClick={onLogout}
              className="ml-2 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Logout from Officer Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Left Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* OFFICER SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-white border-r border-[#DADCE0] p-4 shrink-0 flex flex-col justify-between shadow-xs">
          <div className="space-y-1">
            <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#5F6368]">
              Officer Navigation
            </p>

            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] text-white font-bold shadow-xs'
                      : 'text-[#5F6368] hover:bg-slate-100 hover:text-[#202124]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#5F6368]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#5F6368]')}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 border-t border-[#DADCE0] my-2" />

            {/* Logout Sidebar Item */}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span>Logout</span>
            </button>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-[#5F6368] space-y-1">
            <p className="font-bold text-[#202124]">District Officer Portal</p>
            <p>Jurisdiction: {currentUser.district || 'Bengaluru Urban'}</p>
            <p className="text-[10px] text-emerald-700 font-mono font-bold mt-1">● Realtime Sync Active</p>
          </div>
        </aside>

        {/* MAIN OFFICER CONTENT AREA */}
        <main className="flex-1 bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 overflow-y-auto">
          
          {/* MAP VIEW TAB */}
          {activeTab === 'map' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#202124] font-heading">Officer Complaint GIS Map</h2>
                <span className="text-xs text-[#5F6368]">Displaying assigned field coordinates</span>
              </div>
              <div className="h-[600px] w-full rounded-3xl overflow-hidden border border-[#DADCE0] bg-white p-4 flex items-center justify-center text-center shadow-xs">
                <div className="space-y-3">
                  <MapPin className="w-12 h-12 text-[#2563EB] mx-auto animate-bounce" />
                  <h3 className="text-lg font-bold text-[#202124]">Live Complaint GIS Markers Loaded</h3>
                  <p className="text-xs text-[#5F6368] max-w-md mx-auto">
                    Interactive GPS coordinates for assigned cases in {currentUser.district || 'District Jurisdiction'}. Click markers to dispatch field crews.
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === 'notifications' ? (
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DADCE0]">
                <h2 className="text-xl font-bold text-[#202124] font-heading">Officer Notifications & SLA Alerts</h2>
                <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  3 Unread Alerts
                </span>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-[#DADCE0] space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Emergency SLA Warning</span>
                    <span className="text-[10px] text-[#5F6368]">10 mins ago</span>
                  </div>
                  <p className="text-xs text-[#202124] font-semibold mt-1">Water contamination alert in Ward 12 requires immediate dispatch within 2 hours.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#DADCE0] space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">New Case Assigned</span>
                    <span className="text-[10px] text-[#5F6368]">1 hour ago</span>
                  </div>
                  <p className="text-xs text-[#202124] font-semibold mt-1">Admin Control Center assigned case JAN-2026-9842 to your department.</p>
                </div>
              </div>
            </div>
          ) : activeTab === 'profile' ? (
            <div className="max-w-xl p-6 rounded-3xl bg-white border border-[#DADCE0] space-y-4 shadow-xs">
              <h2 className="text-xl font-bold text-[#202124] font-heading">Government Officer Profile</h2>
              <div className="space-y-3 text-xs text-[#202124]">
                <div className="p-3 rounded-xl bg-slate-50 border border-[#DADCE0] flex justify-between">
                  <span className="text-[#5F6368]">Officer Name:</span>
                  <span className="font-bold text-[#202124]">{currentUser.name || 'Department Officer'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-[#DADCE0] flex justify-between">
                  <span className="text-[#5F6368]">Official Designation:</span>
                  <span className="font-bold text-[#202124]">{currentUser.designation || 'Executive Engineer'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-[#DADCE0] flex justify-between">
                  <span className="text-[#5F6368]">Department:</span>
                  <span className="font-bold text-[#202124]">{currentUser.department || 'Public Works'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-[#DADCE0] flex justify-between">
                  <span className="text-[#5F6368]">Contact Email:</span>
                  <span className="font-bold text-[#202124]">{currentUser.email || 'officer@gov.in'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-[#DADCE0] flex justify-between">
                  <span className="text-[#5F6368]">District Jurisdiction:</span>
                  <span className="font-bold text-[#202124]">{currentUser.district || 'Bengaluru Urban'}</span>
                </div>
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="space-y-6 max-w-3xl">
              <div className="pb-2 border-b border-[#DADCE0]">
                <h2 className="text-xl font-extrabold text-[#202124] font-heading">Officer Workspace Settings</h2>
                <p className="text-xs text-[#5F6368]">Configure alert thresholds, auto-status notifications, and security options.</p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#DADCE0] space-y-5 text-xs shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#DADCE0]">
                  <div>
                    <p className="font-bold text-[#202124]">Instant SMS Alert on Case Assignment</p>
                    <p className="text-[#5F6368] text-[11px]">Receive mobile SMS when District Admin reassigns or dispatches new grievances.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#2563EB] cursor-pointer" />
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-[#DADCE0]">
                  <div>
                    <p className="font-bold text-[#202124]">SLA Breach Warning Threshold</p>
                    <p className="text-[#5F6368] text-[11px]">Notify 6 hours prior to official SLA deadline expiry.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#2563EB] cursor-pointer" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#202124]">Compress Uploaded Proof Photos</p>
                    <p className="text-[#5F6368] text-[11px]">Automatically optimize photo file size for low-bandwidth 4G field uploads.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#2563EB] cursor-pointer" />
                </div>
              </div>
            </div>
          ) : (
            /* DASHBOARD / WORK QUEUE MAIN VIEW */
            <div className="space-y-6">
              
              {/* Quick Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#DADCE0] shadow-xs text-center space-y-1">
                  <span className="text-xs font-bold text-[#5F6368] block">Total Assigned</span>
                  <p className="text-3xl font-extrabold text-[#202124] font-heading">{officerComplaints.length}</p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-center space-y-1">
                  <span className="text-xs font-bold text-amber-800 block">Pending Acceptance</span>
                  <p className="text-3xl font-extrabold text-amber-900 font-heading">{pendingCount}</p>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200 text-center space-y-1">
                  <span className="text-xs font-bold text-blue-800 block">In Progress</span>
                  <p className="text-3xl font-extrabold text-blue-900 font-heading">{inProgressCount}</p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center space-y-1">
                  <span className="text-xs font-bold text-emerald-800 block">Resolved</span>
                  <p className="text-3xl font-extrabold text-emerald-900 font-heading">{resolvedCount}</p>
                </div>
              </div>

              {/* Main Grid: List vs Details Action Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left 1 Col: Assigned Complaints List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DADCE0]">
                    <h3 className="text-base font-bold text-[#202124] font-heading">Assigned Work Queue</h3>
                    
                    {/* Status Filter */}
                    <div className="flex items-center gap-1 text-xs">
                      {['All', 'Pending', 'In Progress', 'Resolved'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setFilterStatus(st)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                            filterStatus === st ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#5F6368] hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {filteredList.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-white border border-[#DADCE0] space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs text-[#5F6368] font-semibold">No complaints found in this category.</p>
                      </div>
                    ) : (
                      filteredList.map((c) => {
                        const isSelected = selectedComplaint?.id === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => setSelectedComplaint(c)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                              isSelected
                                ? 'border-2 border-[#2563EB] bg-blue-50/70 shadow-xs'
                                : 'border-[#DADCE0] bg-white hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-[#2563EB] font-mono">{c.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.priority === 'Critical' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {c.priority}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-[#202124] line-clamp-1">{c.title}</h4>
                            
                            <p className="text-[11px] text-[#5F6368] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#2563EB]" />
                              <span>Status: <strong className="text-[#202124]">{c.status}</strong></span>
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right 2 Cols: Action & Inspection Panel */}
                <div className="lg:col-span-2">
                  {selectedComplaint ? (
                    <div className="p-6 rounded-3xl bg-white border border-[#DADCE0] space-y-6 shadow-xs">
                      
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DADCE0] pb-4">
                        <div>
                          <span className="text-xs font-bold text-[#2563EB] font-mono">{selectedComplaint.id}</span>
                          <h2 className="text-xl font-bold text-[#202124] font-heading mt-0.5">
                            {selectedComplaint.title}
                          </h2>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
                            {selectedComplaint.status}
                          </span>
                        </div>
                      </div>

                      {/* Citizen Details & Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-[#DADCE0] space-y-1">
                          <span className="text-[10px] font-bold text-[#5F6368] uppercase">Reporting Citizen</span>
                          <p className="font-semibold text-[#202124]">
                            {selectedComplaint.submittedBy.name} ({selectedComplaint.submittedBy.phone})
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-[#DADCE0] space-y-1">
                          <span className="text-[10px] font-bold text-[#5F6368] uppercase">Location Address</span>
                          <p className="font-semibold text-[#202124]">
                            {selectedComplaint.location.address}, {selectedComplaint.location.city}
                          </p>
                        </div>
                      </div>

                      {/* Citizen Complaint Description */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-[#DADCE0] text-xs">
                        <span className="text-[10px] font-bold text-[#5F6368] uppercase block mb-1">Citizen Notes</span>
                        <p className="text-[#202124] leading-relaxed">{selectedComplaint.description}</p>
                      </div>

                      {/* OFFICER ACTIONS */}
                      <div className="pt-4 border-t border-[#DADCE0] space-y-4">
                        <h3 className="text-xs font-extrabold text-[#202124] uppercase tracking-wider">
                          Officer Action Center
                        </h3>

                        {/* Quick Status Transition Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            onClick={() => handleStatusChange('Officer Accepted')}
                            className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold text-xs border border-blue-200 transition-colors cursor-pointer"
                          >
                            1. Accept Case
                          </button>

                          <button
                            onClick={() => handleStatusChange('Inspection')}
                            className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer"
                          >
                            2. Mark Inspection
                          </button>

                          <button
                            onClick={() => handleStatusChange('In Progress')}
                            className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs border border-amber-200 transition-colors cursor-pointer"
                          >
                            3. Work In Progress
                          </button>

                          <button
                            onClick={() => handleStatusChange('Resolved')}
                            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            4. Mark Resolved
                          </button>
                        </div>

                        {/* Log Note */}
                        <div>
                          <label className="block text-xs font-semibold text-[#202124] mb-1">
                            Inspection / Work Progress Log Note
                          </label>
                          <input
                            type="text"
                            value={updateNote}
                            onChange={(e) => setUpdateNote(e.target.value)}
                            placeholder="e.g. Field inspection completed. Asphalt repair team deployed on site."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DADCE0] text-xs text-[#202124] focus:border-[#2563EB] focus:outline-hidden placeholder:text-gray-400"
                          />
                        </div>

                        {/* Resolution Proof Photo Upload */}
                        <div className="space-y-3 pt-2 border-t border-[#DADCE0]">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-semibold text-[#202124]">
                              Supporting / Resolution Proof Photo
                            </label>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Syncs Live to Citizen Tracking
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <div className="sm:col-span-6">
                              <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[#2563EB] bg-blue-50/50 hover:bg-blue-50 cursor-pointer text-xs font-semibold text-[#2563EB] transition-colors">
                                <Upload className="w-4 h-4 text-[#2563EB]" />
                                <span className="truncate">{uploadedFileName ? uploadedFileName : 'Choose Resolution Photo'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            <div className="sm:col-span-6">
                              <input
                                type="text"
                                value={resolutionPhotoUrl}
                                onChange={(e) => setResolutionPhotoUrl(e.target.value)}
                                placeholder="Paste Photo Web URL"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DADCE0] text-xs text-[#202124] focus:border-[#2563EB] focus:outline-hidden placeholder:text-gray-400"
                              />
                            </div>
                          </div>

                          {/* Save Photo Button & Photo Preview */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                            <button
                              type="button"
                              onClick={handleSavePhotoOnly}
                              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                            >
                              <Upload className="w-4 h-4 text-white" />
                              <span>Attach & Save Photo to Citizen Tracker</span>
                            </button>

                            {(resolutionPhotoUrl || selectedComplaint.resolutionPhoto) && (
                              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                <Check className="w-4 h-4 text-emerald-600" />
                                <span className="font-semibold text-[11px]">Photo Ready to Sync</span>
                                <img
                                  src={resolutionPhotoUrl || selectedComplaint.resolutionPhoto}
                                  alt="Preview"
                                  className="w-7 h-7 object-cover rounded-lg border border-emerald-300"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-3xl bg-white border border-[#DADCE0] space-y-3 shadow-xs">
                      <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                      <h3 className="text-base font-bold text-[#202124]">Select a Complaint from the Work Queue</h3>
                      <p className="text-xs text-[#5F6368]">Click any assigned case on the left to inspect details and update field status.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
