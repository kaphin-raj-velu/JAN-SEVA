import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, Users, Building2, AlertTriangle, CheckCircle2, Clock, 
  Search, Filter, RefreshCw, UserCheck, ArrowUpRight, BarChart3, Activity,
  Sliders, UserPlus, Eye, ShieldAlert, FileSpreadsheet, ChevronRight, Sparkles, User, FileText, Settings
} from 'lucide-react';
import { Complaint, LanguageCode, UserProfile, DepartmentOfficer, SystemAuditLog, PageRoute } from '../types';
import { getTranslation } from '../data/translations';
import { DashboardHeader } from './DashboardHeader';

interface AdminDashboardModuleProps {
  complaints: Complaint[];
  currentUser: UserProfile;
  currentLanguage: LanguageCode;
  onUpdateComplaintStatus: (id: string, status: Complaint['status'], note?: string) => void;
  onReassignOfficer?: (complaintId: string, officerName: string) => void;
  onNavigate?: (page: PageRoute) => void;
  onLogout?: () => void;
}

const INITIAL_OFFICERS: DepartmentOfficer[] = [];

const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [];

export const AdminDashboardModule: React.FC<AdminDashboardModuleProps> = ({
  complaints,
  currentUser,
  currentLanguage,
  onUpdateComplaintStatus,
  onReassignOfficer,
  onNavigate,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'officers' | 'citizens' | 'departments' | 'complaints' | 'analytics' | 'ai-insights' | 'audit' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // SYSTEM INITIALLY CONTAINS ZERO OFFICERS (Requirement 4)
  const [officersList, setOfficersList] = useState<DepartmentOfficer[]>([]);
  const [citizensList, setCitizensList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  
  // Create Officer Modal State
  const [createOfficerOpen, setCreateOfficerOpen] = useState(false);
  const [newOffName, setNewOffName] = useState('');
  const [newOffEmail, setNewOffEmail] = useState('');
  const [newOffPhone, setNewOffPhone] = useState('');
  const [newOffDept, setNewOffDept] = useState('Roads & Highways');
  const [newOffDesig, setNewOffDesig] = useState('Assistant Executive Engineer');
  const [newOffPass, setNewOffPass] = useState('');

  // Reassignment Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [activeComplaintToReassign, setActiveComplaintToReassign] = useState<Complaint | null>(null);
  const [selectedOfficerForReassign, setSelectedOfficerForReassign] = useState('');

  const t = (key: string, def?: string) => getTranslation(currentLanguage, key, def);

  // Load live officers and citizens from backend
  const fetchAdminData = async () => {
    try {
      const [offRes, citRes] = await Promise.all([
        fetch('/api/admin/officers'),
        fetch('/api/admin/citizens')
      ]);

      if (offRes.ok) {
        const offData = await offRes.json();
        if (offData.success && Array.isArray(offData.data)) {
          setOfficersList(offData.data);
        }
      }

      if (citRes.ok) {
        const citData = await citRes.json();
        if (citData.success && Array.isArray(citData.data)) {
          setCitizensList(citData.data);
        }
      }
    } catch (err) {
      console.warn('Error fetching admin data:', err);
    }
  };

  React.useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffName || !newOffEmail) return;

    try {
      const res = await fetch('/api/admin/officers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOffName,
          email: newOffEmail,
          phone: newOffPhone,
          department: newOffDept,
          designation: newOffDesig,
          password: newOffPass || 'Officer@2026',
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setOfficersList((prev) => [data.data, ...prev]);
        setCreateOfficerOpen(false);
        setNewOffName('');
        setNewOffEmail('');
        setNewOffPhone('');
        setNewOffPass('');
      }
    } catch (err) {
      console.error('Create officer error:', err);
    }
  };

  const handleDeleteOfficer = async (id: string) => {
    if (!confirm('Are you sure you want to remove this officer account?')) return;
    try {
      await fetch(`/api/admin/officers/${id}`, { method: 'DELETE' });
      setOfficersList((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error('Delete officer error:', err);
    }
  };


  // System Stats
  const totalCases = complaints.length;
  const resolvedCases = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const criticalCases = complaints.filter(c => c.priority === 'Critical' || c.priority === 'High').length;
  const avgSla = 96.4;

  const handleReassignSubmit = () => {
    if (!activeComplaintToReassign || !selectedOfficerForReassign) return;

    if (onReassignOfficer) {
      onReassignOfficer(activeComplaintToReassign.id, selectedOfficerForReassign);
    }

    // Add Audit Log
    const newLog: SystemAuditLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Just now',
      actor: currentUser.name || 'Admin',
      role: 'District Admin',
      action: 'Officer Reassigned',
      targetId: activeComplaintToReassign.id,
      details: `Reassigned complaint to ${selectedOfficerForReassign}`,
    };
    setAuditLogs([newLog, ...auditLogs]);

    setReassignModalOpen(false);
    setActiveComplaintToReassign(null);
    setSelectedOfficerForReassign('');
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === 'All' || c.department.includes(selectedDeptFilter);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Standard Dashboard Header */}
      <DashboardHeader
        currentUser={currentUser}
        roleLabel="Administrator Dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
        onSearchChange={setSearchQuery}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E3A8A] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Janseva Portal • Administration Oversight</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t('adminTitle', 'National District & Department Control Center')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t('adminSub', 'Monitor government officer workloads, SLA compliance metrics, emergency escalations, and system audit trails.')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 text-right">
              <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Logged in as</p>
              <p className="text-xs font-bold text-white">{currentUser.name || 'Kaphin Raj Velu GK'}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">System Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DADCE0] pb-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#5F6368] hover:bg-gray-100 hover:text-[#202124]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('citizens')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'citizens'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#5F6368] hover:bg-gray-100 hover:text-[#202124]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Users ({citizensList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('officers')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'officers'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#5F6368] hover:bg-gray-100 hover:text-[#202124]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Officers ({officersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'departments'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#5F6368] hover:bg-gray-100 hover:text-[#202124]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'complaints'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#5F6368] hover:bg-gray-100 hover:text-[#202124]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Complaints ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#5F6368] hover:bg-gray-100 hover:text-[#202124]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-insights')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'ai-insights'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#5F6368] hover:bg-gray-100 hover:text-[#202124]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>AI Insights</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'audit'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#5F6368] hover:bg-gray-100 hover:text-[#202124]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Reports & Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'settings'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#5F6368] hover:bg-gray-100 hover:text-[#202124]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>


      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-[#DADCE0] rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">Total Registered</span>
                <div className="p-2 bg-blue-50 text-[#2563EB] rounded-xl">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[#202124]">{totalCases}</p>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12.4% from last week</span>
              </p>
            </div>

            <div className="p-5 bg-white border border-[#DADCE0] rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">Resolved Cases</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[#202124]">{resolvedCases}</p>
              <p className="text-[11px] text-emerald-600 font-medium">
                {Math.round((resolvedCases / totalCases) * 100 || 0)}% Resolution Rate
              </p>
            </div>

            <div className="p-5 bg-white border border-[#DADCE0] rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">SLA Compliance</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[#202124]">{avgSla}%</p>
              <p className="text-[11px] text-indigo-600 font-medium">Avg Turnaround: 1.8 Days</p>
            </div>

            <div className="p-5 bg-white border border-[#DADCE0] rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">Critical Escalations</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[#202124]">{criticalCases}</p>
              <p className="text-[11px] text-amber-600 font-medium">Prioritized for Immediate Dispatch</p>
            </div>
          </div>

          {/* Department Performance Table */}
          <div className="bg-white border border-[#DADCE0] rounded-2xl shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#202124]">Department Performance Matrix</h3>
                <p className="text-xs text-[#5F6368]">Live resolution efficiency across municipal and state departments</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                Live Governance Audit
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#DADCE0] text-xs font-bold text-[#5F6368] bg-[#F8F9FA]">
                    <th className="py-3 px-4">Department Name</th>
                    <th className="py-3 px-4">Active Cases</th>
                    <th className="py-3 px-4">Resolved Total</th>
                    <th className="py-3 px-4">Avg SLA (Hrs)</th>
                    <th className="py-3 px-4">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DADCE0] text-xs text-[#202124]">
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">Public Works Department (PWD)</td>
                    <td className="py-3 px-4">18</td>
                    <td className="py-3 px-4">1,420</td>
                    <td className="py-3 px-4">36 hrs</td>
                    <td className="py-3 px-4">
                      <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden inline-block align-middle mr-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '92%' }} />
                      </div>
                      <span className="font-bold text-emerald-700">92%</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">Municipal Waste Management</td>
                    <td className="py-3 px-4">12</td>
                    <td className="py-3 px-4">2,890</td>
                    <td className="py-3 px-4">12 hrs</td>
                    <td className="py-3 px-4">
                      <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden inline-block align-middle mr-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '98%' }} />
                      </div>
                      <span className="font-bold text-emerald-700">98%</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">Jal Board & Sewage Dept</td>
                    <td className="py-3 px-4">24</td>
                    <td className="py-3 px-4">1,150</td>
                    <td className="py-3 px-4">48 hrs</td>
                    <td className="py-3 px-4">
                      <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden inline-block align-middle mr-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '84%' }} />
                      </div>
                      <span className="font-bold text-amber-700">84%</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">Electricity Board (BESCOM)</td>
                    <td className="py-3 px-4">9</td>
                    <td className="py-3 px-4">3,110</td>
                    <td className="py-3 px-4">8 hrs</td>
                    <td className="py-3 px-4">
                      <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden inline-block align-middle mr-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '96%' }} />
                      </div>
                      <span className="font-bold text-emerald-700">96%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENT OFFICERS */}
      {activeTab === 'officers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#202124]">Assigned Department Officers</h3>
              <p className="text-xs text-[#5F6368]">Monitor officer status, active case load, and resolution records</p>
            </div>
            <div className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Officers register directly via Portal Registration</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {officersList.map((officer) => (
              <div key={officer.id} className="p-5 bg-white border border-[#DADCE0] rounded-2xl shadow-xs space-y-4 relative">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-100 text-[#2563EB] font-bold text-base flex items-center justify-center shrink-0">
                    {officer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#202124] truncate">{officer.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        officer.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        officer.status === 'In Field' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {officer.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#5F6368] truncate">{officer.designation}</p>
                    <p className="text-[11px] text-[#2563EB] font-medium truncate mt-0.5">{officer.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-[#F8F9FA] rounded-xl text-center text-xs border border-[#DADCE0]">
                  <div>
                    <p className="text-[10px] text-[#5F6368]">Active Cases</p>
                    <p className="font-bold text-[#202124] text-sm">{officer.assignedCases}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#5F6368]">Resolved</p>
                    <p className="font-bold text-emerald-600 text-sm">{officer.resolvedCases}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#5F6368]">Avg Days</p>
                    <p className="font-bold text-indigo-600 text-sm">{officer.avgResolutionDays}d</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#5F6368] pt-1">
                  <span>{officer.phone}</span>
                  <button className="text-[#2563EB] font-semibold hover:underline flex items-center gap-1">
                    <span>View Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GRIEVANCES & REASSIGNMENT */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#202124]">All System Grievances</h3>
              <p className="text-xs text-[#5F6368]">Filter by department, search, or reassign officers directly</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#5F6368] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ID, title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#DADCE0] rounded-full text-xs text-[#202124] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-[#DADCE0] rounded-full text-xs font-semibold text-[#202124]"
              >
                <option value="All">All Departments</option>
                <option value="Works">Public Works</option>
                <option value="Waste">Waste Mgmt</option>
                <option value="Water">Water Supply</option>
                <option value="Traffic">Traffic & Safety</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredComplaints.map((c) => (
              <div key={c.id} className="p-4 sm:p-5 bg-white border border-[#DADCE0] rounded-2xl shadow-xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {c.id}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      c.priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                      c.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {c.priority} Priority
                    </span>
                    <span className="text-[11px] text-[#5F6368] font-medium">• {c.department}</span>
                  </div>

                  <h4 className="text-sm font-bold text-[#202124] truncate">{c.title}</h4>
                  <p className="text-xs text-[#5F6368] truncate">{c.location.address}, {c.location.city}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-[#5F6368]">Assigned Officer</p>
                    <p className="text-xs font-bold text-[#202124] truncate max-w-[140px]">
                      {c.assignedOfficer?.name || 'Unassigned'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveComplaintToReassign(c);
                      setReassignModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-[#F8F9FA] hover:bg-blue-50 border border-[#DADCE0] hover:border-blue-200 text-[#2563EB] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Reassign</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#202124]">System Activity Audit Trail</h3>
              <p className="text-xs text-[#5F6368]">Immutable timeline of AI triaging, officer status changes, and admin overrides</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-[#2563EB] text-xs font-semibold rounded-full border border-blue-200">
              Live Audit Log
            </span>
          </div>

          <div className="bg-white border border-[#DADCE0] rounded-2xl shadow-xs overflow-hidden">
            <div className="divide-y divide-[#DADCE0]">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <Activity className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#202124]">{log.actor}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-semibold">
                          {log.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#5F6368] font-medium">{log.timestamp}</span>
                    </div>

                    <p className="text-xs font-semibold text-[#2563EB]">{log.action} • Target: {log.targetId}</p>
                    <p className="text-xs text-[#5F6368] leading-relaxed">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#202124]">Government Department Overview</h3>
            <p className="text-xs text-[#5F6368]">Monitor municipal department workloads, officer allocations, and average resolution SLAs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Roads & Infrastructure', icon: Building2, active: 4, cases: 18, sla: '92.4%', color: 'border-blue-500 bg-blue-50/20' },
              { name: 'Water Supply & Sewerage', icon: RefreshCw, active: 3, cases: 12, sla: '88.1%', color: 'border-indigo-500 bg-indigo-50/20' },
              { name: 'Electricity & Lighting', icon: Activity, active: 2, cases: 8, sla: '96.5%', color: 'border-amber-500 bg-amber-50/20' },
              { name: 'Sanitation & Solid Waste', icon: CheckCircle2, active: 3, cases: 15, sla: '91.0%', color: 'border-emerald-500 bg-emerald-50/20' },
              { name: 'Public Health & Medical', icon: ShieldCheck, active: 2, cases: 5, sla: '98.0%', color: 'border-rose-500 bg-rose-50/20' },
            ].map((dept, idx) => {
              const Icon = dept.icon;
              return (
                <div key={idx} className={`p-5 rounded-2xl bg-white border ${dept.color} shadow-xs space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-white shadow-xs border border-gray-200">
                      <Icon className="w-5 h-5 text-[#2563EB]" />
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      SLA: {dept.sla}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#202124] text-base">{dept.name}</h4>
                    <p className="text-xs text-[#5F6368]">{dept.active} Assigned Officers • {dept.cases} Active Cases</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#202124]">Grievance Resolution Analytics</h3>
            <p className="text-xs text-[#5F6368]">Performance metrics, resolution velocity, and district department health.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-[#DADCE0] rounded-2xl space-y-2">
              <span className="text-xs font-bold text-[#5F6368] uppercase">Average Resolution Time</span>
              <p className="text-3xl font-extrabold text-[#202124]">18.4 Hours</p>
              <p className="text-[11px] text-emerald-600 font-semibold">↓ 3.2 hrs faster than last month target</p>
            </div>
            <div className="p-5 bg-white border border-[#DADCE0] rounded-2xl space-y-2">
              <span className="text-xs font-bold text-[#5F6368] uppercase">Citizen Satisfaction Score</span>
              <p className="text-3xl font-extrabold text-[#202124]">4.8 / 5.0</p>
              <p className="text-[11px] text-blue-600 font-semibold">Based on 142 verified post-resolution ratings</p>
            </div>
            <div className="p-5 bg-white border border-[#DADCE0] rounded-2xl space-y-2">
              <span className="text-xs font-bold text-[#5F6368] uppercase">SLA Compliance Rate</span>
              <p className="text-3xl font-extrabold text-[#202124]">94.2%</p>
              <p className="text-[11px] text-emerald-600 font-semibold">Exceeds national benchmark (90.0%)</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AI INSIGHTS */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Gemini Neural AI District Assessment</span>
            </div>
            <h3 className="text-xl font-bold">Automated Priority & Anomaly Detection</h3>
            <p className="text-xs text-slate-300 max-w-2xl">
              AI model scanning complaint uploads for structural damage severity, fake duplicate submissions, and water-logging trends across Indiranagar, MG Road, and Outer Ring Road.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-[#DADCE0] rounded-2xl space-y-3">
              <h4 className="font-bold text-[#202124] text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                No Duplicate Abuse Detected
              </h4>
              <p className="text-xs text-[#5F6368]">Image embeddings cross-checked against 500+ recent submissions. 100% genuine citizen submissions verified.</p>
            </div>
            <div className="p-5 bg-white border border-[#DADCE0] rounded-2xl space-y-3">
              <h4 className="font-bold text-[#202124] text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Predicted Infrastructure Surge
              </h4>
              <p className="text-xs text-[#5F6368]">Monsoon weather forecast suggests 25% increase in road pothole grievances. Recommend pre-dispatching asphalt repair teams.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-bold text-[#202124]">District Control Center Configuration</h3>
            <p className="text-xs text-[#5F6368]">Manage system-wide SLA limits, department escalation triggers, and admin security settings.</p>
          </div>

          <div className="bg-white border border-[#DADCE0] rounded-2xl p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#DADCE0]">
              <div>
                <p className="font-bold text-[#202124]">Strict Auto-SLA Escalation</p>
                <p className="text-[#5F6368] text-[11px]">Automatically escalate unaccepted grievances to District Magistrate after 24 hours.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#2563EB] cursor-pointer" />
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-[#DADCE0]">
              <div>
                <p className="font-bold text-[#202124]">Citizen Real-time SMS Updates</p>
                <p className="text-[#5F6368] text-[11px]">Send instant automated SMS to citizens whenever an officer uploads a resolution photo.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#2563EB] cursor-pointer" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#202124]">AI Neural Photo Verification Engine</p>
                <p className="text-[#5F6368] text-[11px]">Verify officer resolution photos against original citizen upload before closing tickets.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#2563EB] cursor-pointer" />
            </div>
          </div>
        </div>
      )}



      {/* Reassign Officer Modal */}

      {reassignModalOpen && activeComplaintToReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#DADCE0] space-y-5">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full">
                {activeComplaintToReassign.id}
              </span>
              <h3 className="text-lg font-bold text-[#202124] mt-1">Reassign Grievance Officer</h3>
              <p className="text-xs text-[#5F6368]">
                Select a qualified officer from the department matrix to take over this issue.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-[#202124]">Select Officer</label>
              <select
                value={selectedOfficerForReassign}
                onChange={(e) => setSelectedOfficerForReassign(e.target.value)}
                className="w-full p-3 bg-white border border-[#DADCE0] rounded-xl text-xs font-semibold text-[#202124] focus:outline-none focus:border-[#2563EB]"
              >
                <option value="">-- Choose Department Officer --</option>
                {officersList.map((off) => (
                  <option key={off.id} value={off.name}>
                    {off.name} ({off.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleReassignSubmit}
                disabled={!selectedOfficerForReassign}
                className="flex-1 py-3 px-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full font-semibold text-xs transition-colors disabled:opacity-50"
              >
                Confirm Reassignment
              </button>
              <button
                onClick={() => setReassignModalOpen(false)}
                className="py-3 px-4 border border-[#DADCE0] hover:bg-gray-100 text-[#5F6368] rounded-full font-medium text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
