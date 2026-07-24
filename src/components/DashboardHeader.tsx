import React, { useState } from 'react';
import { 
  ShieldCheck, Search, Bell, Moon, Sun, User, LogOut, CheckCircle2, ChevronDown, Sliders
} from 'lucide-react';
import { UserProfile, PageRoute } from '../types';

interface DashboardHeaderProps {
  currentUser: UserProfile;
  roleLabel: string; // e.g. 'Citizen Dashboard' | 'Officer Dashboard' | 'Administrator Dashboard'
  onNavigate?: (page: PageRoute) => void;
  onLogout?: () => void;
  onSearchChange?: (term: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  roleLabel,
  onNavigate,
  onLogout,
  onSearchChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationsList = [
    { id: '1', title: 'New Complaint Verification', time: '5m ago', unread: true },
    { id: '2', title: 'Officer Field Inspection Completed', time: '1h ago', unread: true },
    { id: '3', title: 'SLA Milestone Achieved', time: '3h ago', unread: false },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Visual indicator toast or class toggling if needed
    if (!isDarkMode) {
      document.documentElement.classList.add('dark-mode-preview');
    } else {
      document.documentElement.classList.remove('dark-mode-preview');
    }
  };

  return (
    <div className="w-full bg-white border border-[#DADCE0] rounded-3xl p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Branding Block: Janseva Portal Logo + Same Title + Role Subtitle */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onNavigate && onNavigate('home')}
            className="w-11 h-11 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105 shrink-0"
          >
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-[#202124] tracking-tight font-heading">
                Janseva Portal
              </span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" title="System Operational" />
            </div>
            <p className="text-xs font-bold text-[#2563EB] tracking-wide uppercase">
              {roleLabel}
            </p>
          </div>
        </div>

        {/* Center: Search Input */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F6368]" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder={`Search ${roleLabel.toLowerCase()}, complaints, officers or IDs...`}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] border border-[#DADCE0] rounded-full text-xs text-[#202124] placeholder-[#5F6368] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
          />
        </div>

        {/* Right Action Icons: Notification Icon, Profile Avatar, Dark Mode Toggle */}
        <div className="flex items-center gap-3 justify-between md:justify-end shrink-0">
          
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-2.5 rounded-full border border-[#DADCE0] hover:bg-[#F8F9FA] text-[#5F6368] hover:text-[#202124] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-[#202124]" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#DADCE0] rounded-2xl shadow-2xl p-3 z-50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#DADCE0]">
                  <span className="text-xs font-bold text-[#202124]">Live System Notifications</span>
                  <span className="text-[10px] bg-blue-50 text-[#2563EB] font-bold px-2 py-0.5 rounded-full">3 New</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {notificationsList.map((n) => (
                    <div key={n.id} className="p-2 rounded-xl bg-[#F8F9FA] hover:bg-blue-50/50 text-xs transition-colors">
                      <p className="font-bold text-[#202124]">{n.title}</p>
                      <span className="text-[10px] text-[#5F6368]">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full border border-[#DADCE0] hover:bg-[#F8F9FA] text-[#5F6368] hover:text-[#202124] transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-[#5F6368]" />
            )}
          </button>

          {/* User Profile Avatar / Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#F8F9FA] border border-[#DADCE0] hover:bg-white text-xs font-semibold transition-all shadow-2xs"
            >
              <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name ? currentUser.name.charAt(0) : <User className="w-4 h-4" />}
              </div>
              <span className="hidden sm:inline font-bold text-[#202124] max-w-[100px] truncate">
                {currentUser.name || 'User'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5F6368]" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#DADCE0] rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-[#DADCE0]">
                  <p className="text-xs font-bold text-[#202124] truncate">{currentUser.name || 'Janseva User'}</p>
                  <p className="text-[10px] text-[#5F6368] uppercase font-semibold">{currentUser.role}</p>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onNavigate) onNavigate('home');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-[#202124] hover:bg-[#F8F9FA] flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                  <span>Janseva Home</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-[#DADCE0] mt-1 pt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
