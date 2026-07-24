import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PageRoute, LanguageCode, UserProfile } from '../types';
import { LANGUAGES, getTranslation } from '../data/translations';
import { 
  Globe, User, LogOut, LayoutDashboard, ShieldCheck, 
  ChevronDown, Shield, Settings, Menu, X, Home, 
  FileText, MapPin, BarChart3, Info, PhoneCall, Key
} from 'lucide-react';

interface HeaderProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentUser: UserProfile;
  onOpenAuth: () => void;
  onOpenAuthPortal?: (role: 'citizen' | 'officer' | 'admin') => void;
  onLogout: () => void;
  onTriggerInstall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  currentLanguage,
  onLanguageChange,
  currentUser,
  onOpenAuth,
  onOpenAuthPortal,
  onLogout,
}) => {
  const [langDropdown, setLangDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const t = (key: string, def?: string) => getTranslation(currentLanguage, key, def);

  const navItems: { id: PageRoute; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: t('home', 'Home'), icon: Home },
    { id: 'raise-complaint', label: t('raiseComplaint', 'Raise Complaint'), icon: FileText },
    { id: 'track-complaint', label: t('trackComplaint', 'Track Complaint'), icon: Shield },
    { id: 'live-map', label: t('liveMap', 'Live Map'), icon: MapPin },
    { id: 'analytics', label: t('analytics', 'Analytics'), icon: BarChart3 },
    { id: 'about', label: t('about', 'About'), icon: Info },
    { id: 'contact', label: t('contact', 'Contact'), icon: PhoneCall },
  ];

  const handleNavClick = (id: PageRoute, portalLoginRole?: 'citizen' | 'officer' | 'admin') => {
    setIsDrawerOpen(false);
    setLangDropdown(false);
    setProfileDropdown(false);

    if (portalLoginRole) {
      if (onOpenAuthPortal) {
        onOpenAuthPortal(portalLoginRole);
      } else {
        onOpenAuth();
      }
      return;
    }

    onNavigate(id);
  };

  const getRoleBadgeClass = (role: UserProfile['role']) => {
    if (role === 'admin') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (role === 'officer') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <header className="sticky top-0 z-50 h-[80px] w-full bg-[#FFFFFF]/98 backdrop-blur-md border-b border-[#DADCE0] shadow-2xs">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 shrink-0">
            <ShieldCheck className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-[#202124] leading-none font-heading">
              {t('portalName', 'Janseva Portal')}
            </span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse shrink-0" title="System Operational" />
          </div>
        </div>


        {/* Right Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdown(!langDropdown);
                setProfileDropdown(false);
              }}
              className="h-9 px-2.5 sm:px-3 flex items-center gap-1.5 rounded-full border border-[#DADCE0] hover:bg-[#F8F9FA] text-[#5F6368] hover:text-[#202124] transition-colors text-xs font-semibold shrink-0 cursor-pointer"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span className="text-xs text-[#202124] font-semibold hidden sm:inline">
                {LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName || 'English'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#5F6368] shrink-0" />
            </button>

            {langDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#FFFFFF] border border-[#DADCE0] rounded-2xl shadow-2xl py-2 z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setLangDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-[#F8F9FA] flex items-center justify-between cursor-pointer ${
                      currentLanguage === lang.code ? 'text-[#2563EB] font-bold bg-blue-50/60' : 'text-[#202124]'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-[#5F6368]">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Sign In Button */}
          {currentUser.isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdown(!profileDropdown);
                  setLangDropdown(false);
                }}
                className="h-9 px-3.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full text-xs font-semibold transition-all active:scale-95 shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-white" />
                <span className="max-w-[100px] truncate font-bold hidden sm:inline">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3 h-3 text-blue-200 shrink-0" />
              </button>

              {profileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-[#FFFFFF] border border-[#DADCE0] rounded-2xl shadow-2xl py-2 z-50 divide-y divide-gray-100">
                  <div className="px-4 py-2.5">
                    <p className="text-xs font-bold text-[#202124] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-[#5F6368] truncate">{currentUser.phone || currentUser.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${getRoleBadgeClass(currentUser.role)}`}>
                        {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {currentUser.role === 'citizen' && (
                      <button
                        onClick={() => { setProfileDropdown(false); onNavigate('citizen-dashboard'); }}
                        className="w-full text-left px-4 py-2 text-xs text-[#202124] hover:bg-[#F8F9FA] flex items-center gap-2.5 font-medium cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#2563EB]" />
                        <span>Citizen Dashboard</span>
                      </button>
                    )}

                    {currentUser.role === 'officer' && (
                      <button
                        onClick={() => { setProfileDropdown(false); onNavigate('officer-dashboard'); }}
                        className="w-full text-left px-4 py-2 text-xs text-[#202124] hover:bg-[#F8F9FA] flex items-center gap-2.5 font-medium cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-indigo-600" />
                        <span>Officer Dashboard</span>
                      </button>
                    )}

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => { setProfileDropdown(false); onNavigate('admin-dashboard'); }}
                        className="w-full text-left px-4 py-2 text-xs text-[#202124] hover:bg-[#F8F9FA] flex items-center gap-2.5 font-medium cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-purple-600" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('home', 'citizen')}
              className="h-9 px-3.5 bg-[#2563EB] text-white rounded-full text-xs font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-white" />
              <span>Sign In</span>
            </button>
          )}

          {/* HAMBURGER MENU BUTTON (Always Visible across all screen sizes) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="h-10 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-md active:scale-95 border border-slate-700"
            aria-label="Open Navigation Menu"
            title="Open Menu Drawer"
          >
            <Menu className="w-5 h-5 text-white" />
            <span className="text-xs font-bold hidden sm:inline">Menu</span>
          </button>
        </div>

      </div>

      {/* RIGHT SIDE SLIDING NAVIGATION DRAWER (Portal to document.body to prevent clipping inside header CSS context) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              {/* Backdrop Overlay (Dark Transparent + Blur) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] cursor-pointer"
              />

              {/* Slide-in Right Side Drawer Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed top-0 right-0 bottom-0 h-full w-[320px] max-w-[85vw] bg-white z-[10000] shadow-2xl flex flex-col justify-between overflow-hidden border-l border-slate-200"
              >
                {/* Top Section: Logo & Close Button */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold shadow-xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">Janseva Portal</h3>
                      <p className="text-[10px] text-slate-500 font-medium">National Grievance Platform</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Close Menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Navigation Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  
                  {/* Section 1: Navigation Menu */}
                  <div className="space-y-1">
                    <p className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      Navigation
                    </p>

                    <motion.div
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: { staggerChildren: 0.05 }
                        }
                      }}
                      className="space-y-1"
                    >
                      {navItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                          <motion.button
                            key={item.id}
                            variants={{
                              hidden: { opacity: 0, y: 10 },
                              show: { opacity: 1, y: 0 }
                            }}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <IconComponent className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                            <span>{item.label}</span>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </div>

                  <div className="border-t border-slate-100" />

                  {/* Section 2: Authentication Access Portals */}
                  <div className="space-y-2">
                    <p className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      Authentication
                    </p>

                    <button
                      onClick={() => handleNavClick('home', 'citizen')}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 transition-all border border-emerald-200/80 cursor-pointer shadow-2xs"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Citizen Login</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('home', 'officer')}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 transition-all border border-indigo-200/80 cursor-pointer shadow-2xs"
                    >
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span>Officer Login</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('home', 'admin')}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-purple-700 bg-purple-50/80 hover:bg-purple-100 transition-all border border-purple-200/80 cursor-pointer shadow-2xs"
                    >
                      <Key className="w-4 h-4 text-purple-600" />
                      <span>Admin Login</span>
                    </button>
                  </div>

                  {/* Section 3: Language Selector inside Drawer */}
                  <div className="pt-2">
                    <p className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                      Select Language
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            onLanguageChange(lang.code);
                            setIsDrawerOpen(false);
                          }}
                          className={`px-2.5 py-2 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
                            currentLanguage === lang.code
                              ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {lang.nativeName}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Drawer Bottom Footer */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-500 shrink-0 space-y-2">
                  {currentUser.isLoggedIn && (
                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2.5 px-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout ({currentUser.role})</span>
                    </button>
                  )}

                  <div className="space-y-0.5 pt-1">
                    <p className="font-semibold text-slate-700 text-xs">Version 1.0</p>
                    <p className="text-[11px] text-slate-400 font-medium">© Janseva Portal</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
};
