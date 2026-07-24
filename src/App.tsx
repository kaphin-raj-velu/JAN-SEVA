import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { PageRoute, LanguageCode, UserProfile, Complaint } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeSections } from './components/HomeSections';
import { RaiseComplaintModule } from './components/RaiseComplaintModule';
import { ComplaintTrackingModule } from './components/ComplaintTrackingModule';
import { LiveMapModule } from './components/LiveMapModule';
import { AnalyticsModule } from './components/AnalyticsModule';
import { CitizenDashboardModule } from './components/CitizenDashboardModule';
import { OfficerDashboardModule } from './components/OfficerDashboardModule';
import { AdminDashboardModule } from './components/AdminDashboardModule';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { AuthModal } from './components/AuthModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { GovernmentSchemesModal } from './components/GovernmentSchemesModal';
import { WifiOff, ShieldCheck, Shield, User, Building2, Key, ArrowRight } from 'lucide-react';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>('JAN-2026-9842');

  // Network State
  const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalPortal, setAuthModalPortal] = useState<'citizen' | 'officer' | 'admin'>('citizen');
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState<boolean>(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState<boolean>(false);
  const [isSchemesModalOpen, setIsSchemesModalOpen] = useState<boolean>(false);

  // User session state
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('janseva_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        console.warn('Failed to parse saved user session', e);
      }
    }
    return {
      id: '',
      isLoggedIn: false,
      role: 'citizen',
      name: '',
      phone: '',
    };
  });

  // Complaints State
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem('janseva_user_complaints');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse local complaints state', e);
    }
    return [];
  });

  // Map path to PageRoute for Header
  const getPageRouteFromPath = (pathname: string): PageRoute => {
    if (pathname.startsWith('/officer')) return 'officer-dashboard';
    if (pathname.startsWith('/admin')) return 'admin-dashboard';
    if (pathname === '/citizen/raise-complaint') return 'raise-complaint';
    if (pathname === '/citizen/track-complaint') return 'track-complaint';
    if (pathname === '/citizen/live-map') return 'live-map';
    if (pathname === '/citizen/analytics') return 'analytics';
    if (pathname === '/citizen/about') return 'about';
    if (pathname === '/citizen/contact') return 'contact';
    if (pathname === '/citizen/dashboard') return 'citizen-dashboard';
    return 'home';
  };

  const currentPage = getPageRouteFromPath(location.pathname);

  const handleNavigate = (page: PageRoute) => {
    switch (page) {
      case 'home':
        navigate('/citizen');
        break;
      case 'raise-complaint':
        navigate('/citizen/raise-complaint');
        break;
      case 'track-complaint':
        navigate('/citizen/track-complaint');
        break;
      case 'live-map':
        navigate('/citizen/live-map');
        break;
      case 'analytics':
        navigate('/citizen/analytics');
        break;
      case 'about':
        navigate('/citizen/about');
        break;
      case 'contact':
        navigate('/citizen/contact');
        break;
      case 'citizen-dashboard':
        navigate('/citizen/dashboard');
        break;
      case 'officer-dashboard':
        navigate('/officer');
        break;
      case 'admin-dashboard':
        navigate('/admin');
        break;
      default:
        navigate('/citizen');
        break;
    }
  };

  const handleOpenAuthPortal = (role: 'citizen' | 'officer' | 'admin') => {
    if (role === 'officer') {
      navigate('/officer/login');
    } else if (role === 'admin') {
      navigate('/admin/login');
    } else {
      navigate('/citizen/login');
    }
  };

  // Synchronize URL login routes with AuthModal
  useEffect(() => {
    if (location.pathname === '/citizen/login') {
      setAuthModalPortal('citizen');
      setIsAuthModalOpen(true);
    } else if (location.pathname === '/officer/login') {
      setAuthModalPortal('officer');
      setIsAuthModalOpen(true);
    } else if (location.pathname === '/admin/login') {
      setAuthModalPortal('admin');
      setIsAuthModalOpen(true);
    }
  }, [location.pathname]);

  // Network online/offline event listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch live complaints from Express backend
  useEffect(() => {
    fetch('/api/complaints')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setComplaints(data.data);
        }
      })
      .catch((err) => console.log('Using cached/initial complaints state', err));
  }, []);

  // PWA install prompt timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPWAInstallModalOpen(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Role Protection & Routing Guards
  useEffect(() => {
    const path = location.pathname;
    if (currentUser.isLoggedIn) {
      if (currentUser.role === 'officer' && !path.startsWith('/officer')) {
        navigate('/officer/dashboard', { replace: true });
      } else if (currentUser.role === 'admin' && !path.startsWith('/admin')) {
        navigate('/admin/dashboard', { replace: true });
      } else if (currentUser.role === 'citizen' && (path.startsWith('/officer') || path.startsWith('/admin'))) {
        navigate('/citizen/dashboard', { replace: true });
      }
    }
  }, [currentUser.isLoggedIn, currentUser.role, location.pathname, navigate]);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    if (user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (user.role === 'officer') {
      navigate('/officer/dashboard', { replace: true });
    } else {
      navigate('/citizen/dashboard', { replace: true });
    }
  };

  const handleLogout = () => {
    setCurrentUser({
      id: '',
      isLoggedIn: false,
      role: 'citizen',
      name: '',
      phone: '',
    });
    localStorage.removeItem('janseva_user_profile');
    localStorage.removeItem('janseva_jwt_token');
    navigate('/citizen');
  };

  const handleComplaintCreated = (newComplaint: Complaint) => {
    setComplaints((prev) => {
      const updated = [newComplaint, ...prev];
      try {
        localStorage.setItem('janseva_user_complaints', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save complaint to local storage', e);
      }
      return updated;
    });
    setSelectedComplaintId(newComplaint.id);
  };

  const handleUpdateComplaintStatus = (
    id: string,
    status: Complaint['status'],
    note?: string,
    photo?: string
  ) => {
    setComplaints((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          const nowStr = 'Just now';
          const updatedTimeline = [
            ...c.timeline,
            {
              title: `Status set to ${status}`,
              timestamp: nowStr,
              completed: true,
              actor: currentUser.name || c.assignedOfficer?.name || 'Department Officer',
              note: note || undefined,
            },
          ];
          return {
            ...c,
            status,
            resolutionNote: note || (c as any).resolutionNote,
            resolutionPhoto: photo || c.resolutionPhoto,
            assignedOfficer: {
              name: currentUser.name || c.assignedOfficer?.name || 'Er. Ramesh K. Kumar',
              designation: currentUser.role === 'officer' ? (currentUser.designation || 'Assistant Executive Engineer') : (c.assignedOfficer?.designation || 'Department Officer'),
              department: currentUser.department || c.department || 'Public Works',
              phone: currentUser.phone || c.assignedOfficer?.phone || '+91 98450 12345',
              avatar: currentUser.avatar || c.assignedOfficer?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            },
            updatedAt: new Date().toISOString(),
            timeline: updatedTimeline,
          };
        }
        return c;
      });
      try {
        localStorage.setItem('janseva_user_complaints', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save updated complaints', e);
      }
      return updated;
    });

    // Send backend PATCH sync to express server
    fetch(`/api/complaints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        note,
        resolutionPhoto: photo,
        officerName: currentUser.name || 'Department Officer',
      }),
    }).catch((err) => console.warn('Server status sync warning:', err));
  };

  const handleReassignOfficer = (complaintId: string, officerName: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            assignedOfficer: {
              name: officerName,
              designation: 'Assigned Senior Officer',
              department: c.department,
              phone: '+91 98450 99999',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            },
            timeline: [
              ...c.timeline,
              {
                title: `Officer Reassigned to ${officerName}`,
                timestamp: 'Just now',
                completed: true,
                actor: 'Admin Control Center',
              }
            ]
          };
        }
        return c;
      })
    );
  };

  const isOfficerRoute = location.pathname.startsWith('/officer');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCitizenRoute = !isOfficerRoute && !isAdminRoute;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#202124] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Sticky Navigation Header ONLY for Citizen Portal */}
      {isCitizenRoute && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          currentUser={currentUser}
          onOpenAuth={() => handleOpenAuthPortal('citizen')}
          onOpenAuthPortal={handleOpenAuthPortal}
          onLogout={handleLogout}
          onTriggerInstall={() => setIsPWAInstallModalOpen(true)}
        />
      )}

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 text-center sticky top-[80px] z-40 shadow-xs">
          <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            You are offline. Previously loaded complaints are still available. New complaints will automatically sync once your connection is restored.
          </span>
        </div>
      )}

      {/* Main Page Render router */}
      <main className="flex-1 w-full">
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/citizen" replace />} />

          {/* CITIZEN PORTAL ROUTES */}
          <Route
            path="/citizen"
            element={
              <HomeSections
                onNavigate={handleNavigate}
                recentComplaints={complaints}
                onSelectComplaint={(id) => {
                  setSelectedComplaintId(id);
                  navigate('/citizen/track-complaint');
                }}
                onOpenSOSModal={() => setIsSOSModalOpen(true)}
                onOpenSchemesModal={() => setIsSchemesModalOpen(true)}
                currentLanguage={currentLanguage}
              />
            }
          />
          <Route
            path="/citizen/raise-complaint"
            element={
              <RaiseComplaintModule
                currentLanguage={currentLanguage}
                currentUser={currentUser}
                onComplaintCreated={handleComplaintCreated}
                onNavigateToTracking={(id) => {
                  setSelectedComplaintId(id);
                  navigate('/citizen/track-complaint');
                }}
              />
            }
          />
          <Route
            path="/citizen/track-complaint"
            element={
              <ComplaintTrackingModule
                currentLanguage={currentLanguage}
                complaints={complaints}
                currentUser={currentUser}
                selectedId={selectedComplaintId}
                onSelectComplaint={setSelectedComplaintId}
              />
            }
          />
          <Route
            path="/citizen/live-map"
            element={
              <LiveMapModule
                currentLanguage={currentLanguage}
                complaints={complaints}
                onSelectComplaint={setSelectedComplaintId}
                onNavigateToTracking={(id) => {
                  setSelectedComplaintId(id);
                  navigate('/citizen/track-complaint');
                }}
              />
            }
          />
          <Route path="/citizen/analytics" element={<AnalyticsModule currentLanguage={currentLanguage} />} />
          <Route path="/citizen/about" element={<AboutPage onNavigate={handleNavigate} currentLanguage={currentLanguage} />} />
          <Route path="/citizen/contact" element={<ContactPage onNavigate={handleNavigate} />} />
          <Route
            path="/citizen/dashboard"
            element={
              currentUser.isLoggedIn ? (
                <CitizenDashboardModule
                  currentLanguage={currentLanguage}
                  complaints={complaints}
                  currentUser={currentUser}
                  onNavigate={handleNavigate}
                  onSelectComplaint={setSelectedComplaintId}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/citizen/login" replace />
              )
            }
          />
          <Route
            path="/citizen/login"
            element={
              <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-white border border-[#DADCE0] text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-[#202124]">Citizen Portal Login</h2>
                <p className="text-xs text-[#5F6368]">Log in or create a citizen account to track your submitted grievances.</p>
                <button
                  onClick={() => { setAuthModalPortal('citizen'); setIsAuthModalOpen(true); }}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Open Citizen Login Window
                </button>
              </div>
            }
          />

          {/* OFFICER PORTAL ROUTES (Isolated Workspace Layout) */}
          <Route path="/officer" element={<Navigate to="/officer/dashboard" replace />} />
          <Route
            path="/officer/dashboard"
            element={
              currentUser.isLoggedIn && (currentUser.role === 'officer' || currentUser.role === 'admin') ? (
                <OfficerDashboardModule
                  currentLanguage={currentLanguage}
                  complaints={complaints}
                  currentUser={currentUser}
                  onUpdateStatus={handleUpdateComplaintStatus}
                  onNavigate={handleNavigate}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/officer/login" replace />
              )
            }
          />
          <Route
            path="/officer/login"
            element={
              <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-white border border-[#DADCE0] text-[#202124] text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 bg-blue-50 text-[#2563EB] border border-blue-200 rounded-2xl flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-[#202124]">Department Officer Login</h2>
                <p className="text-xs text-[#5F6368]">Authorized workspace for field engineers and departmental officers.</p>
                <button
                  onClick={() => { setAuthModalPortal('officer'); setIsAuthModalOpen(true); }}
                  className="px-6 py-3 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                >
                  Open Officer Credentials Window
                </button>
              </div>
            }
          />

          {/* ADMIN PORTAL ROUTES (Isolated Control Center Layout) */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              currentUser.isLoggedIn && currentUser.role === 'admin' ? (
                <AdminDashboardModule
                  complaints={complaints}
                  currentUser={currentUser}
                  currentLanguage={currentLanguage}
                  onUpdateComplaintStatus={handleUpdateComplaintStatus}
                  onReassignOfficer={handleReassignOfficer}
                  onNavigate={handleNavigate}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            }
          />
          <Route
            path="/admin/login"
            element={
              <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 text-center space-y-4 shadow-xl">
                <div className="w-12 h-12 bg-purple-950 text-purple-400 border border-purple-800 rounded-2xl flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white">District Administrator Login</h2>
                <p className="text-xs text-slate-400">Secure portal for District Magistrate & Municipal Control Center.</p>
                <button
                  onClick={() => { setAuthModalPortal('admin'); setIsAuthModalOpen(true); }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 transition-colors cursor-pointer"
                >
                  Open Administrator Credentials Window
                </button>
              </div>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/citizen" replace />} />
        </Routes>
      </main>

      {/* Footer ONLY for Citizen Portal */}
      {isCitizenRoute && <Footer onNavigate={handleNavigate} currentLanguage={currentLanguage} />}

      {/* Dialog Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          if (location.pathname.endsWith('/login')) {
            if (location.pathname.startsWith('/officer')) navigate('/officer');
            else if (location.pathname.startsWith('/admin')) navigate('/admin');
            else navigate('/citizen');
          }
        }}
        onLoginSuccess={handleLoginSuccess}
        initialPortal={authModalPortal}
      />

      <PWAInstallModal
        isOpen={isPWAInstallModalOpen}
        onClose={() => setIsPWAInstallModalOpen(false)}
        onInstalled={() => {
          localStorage.setItem('janseva_pwa_installed', 'true');
        }}
      />

      <EmergencySOSModal
        isOpen={isSOSModalOpen}
        currentLanguage={currentLanguage}
        onClose={() => setIsSOSModalOpen(false)}
      />

      <GovernmentSchemesModal
        isOpen={isSchemesModalOpen}
        currentLanguage={currentLanguage}
        onClose={() => setIsSchemesModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

