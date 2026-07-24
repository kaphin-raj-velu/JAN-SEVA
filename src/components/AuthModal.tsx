import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, Lock, ShieldCheck, CheckCircle2, 
  Building2, ArrowRight, Settings, User, MapPin, Key, 
  Camera, Mic, Activity, Bell, AlertCircle, Shield,
  Eye, EyeOff
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialPortal?: 'citizen' | 'officer' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, initialPortal }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Role switcher for Login
  const [loginRole, setLoginRole] = useState<'citizen' | 'officer' | 'admin'>('citizen');

  useEffect(() => {
    if (isOpen) {
      if (initialPortal) {
        setLoginRole(initialPortal);
      }
      setActiveTab('login');
      setIdentifier('');
      setPassword('');
      setLoginError(null);
      setIsSuccess(false);
    }
  }, [isOpen, initialPortal]);

  const handleRoleChange = (role: 'citizen' | 'officer' | 'admin') => {
    setLoginRole(role);
    if (role === 'officer') {
      setRegRole('officer');
      setRegForm(prev => ({ ...prev, role: 'officer', department: 'Roads & Infrastructure', designation: 'Assistant Municipal Engineer' }));
    } else if (role === 'citizen') {
      setRegRole('citizen');
      setRegForm(prev => ({ ...prev, role: 'citizen' }));
    }
    setIdentifier('');
    setPassword('');
    setLoginError(null);
  };

  // Role switcher for Registration (Only Citizen & Officer can create accounts)
  const [regRole, setRegRole] = useState<'citizen' | 'officer'>('citizen');

  // Form states for Login
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [department, setDepartment] = useState<string>('Roads & Infrastructure');
  const [district, setDistrict] = useState<string>('Bengaluru District');
  
  // Password Visibility State
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState<boolean>(false);

  // Feedback states
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Register Multi-Step State
  const initialRegForm = {
    name: '',
    email: '',
    phone: '',
    role: 'citizen' as 'citizen' | 'officer',
    department: '',
    designation: '',
    employeeId: '',
    address: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    password: '',
    confirmPassword: '',
  };

  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4>(1);
  const [regForm, setRegForm] = useState(initialRegForm);

  useEffect(() => {
    if (isOpen) {
      if (initialPortal) {
        setLoginRole(initialPortal);
        if (initialPortal === 'officer') {
          setRegRole('officer');
          setRegForm({ ...initialRegForm, role: 'officer', department: 'Roads & Infrastructure', designation: 'Assistant Municipal Engineer' });
        } else {
          setRegRole('citizen');
          setRegForm({ ...initialRegForm, role: 'citizen' });
        }
      }
      setActiveTab('login');
      setIdentifier('');
      setPassword('');
      setRegStep(1);
      setLoginError(null);
      setIsSuccess(false);
    }
  }, [isOpen, initialPortal]);

  if (!isOpen) return null;

  // Store JWT session locally
  const storeJwtSession = (user: UserProfile, tokenStr?: string) => {
    const token = tokenStr || `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: user.id, role: user.role, iat: Date.now() }))}.janseva_sig`;
    localStorage.setItem('janseva_jwt_token', token);
    localStorage.setItem('janseva_user_profile', JSON.stringify(user));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!identifier.trim()) {
      setLoginError('Please enter your email, mobile number or ID.');
      return;
    }

    if (!password.trim()) {
      setLoginError('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role: loginRole }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.message || 'Authentication failed. Please verify your credentials.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);

      storeJwtSession(data.user, data.token);

      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 600);
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError('Server network connection error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRegisterNext = async () => {
    setLoginError(null);
    if (regStep === 1) {
      if (!regForm.name || (!regForm.email && !regForm.phone)) {
        setLoginError('Please enter your full name and at least an email or mobile number.');
        return;
      }
      if (regRole === 'officer' && !regForm.department) {
        setLoginError('Please select your official government department.');
        return;
      }
      setRegStep(2);
    } else if (regStep === 2) {
      if (!regForm.city || !regForm.state) {
        setLoginError('Please enter your city and state.');
        return;
      }
      setRegStep(3);
    } else if (regStep === 3) {
      if (!regForm.password || regForm.password.length < 4) {
        setLoginError('Password must be at least 4 characters long.');
        return;
      }
      if (regForm.password !== regForm.confirmPassword) {
        setLoginError('Passwords do not match.');
        return;
      }
      setIsLoading(true);

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...regForm, role: regRole }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setLoginError(data.message || 'Registration failed. Please verify details.');
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
        setRegStep(4);
        storeJwtSession(data.user, data.token);
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 1000);
      } catch (err) {
        console.error('API register error:', err);
        setLoginError('Server network connection error during registration.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="w-full max-w-4xl bg-[#FFFFFF] border border-[#DADCE0] rounded-3xl shadow-2xl overflow-hidden relative my-auto grid grid-cols-1 lg:grid-cols-12 min-h-[580px]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Visual Branding Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-blue-900 font-extrabold text-xl flex items-center justify-center shadow-md">
                JP
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-heading">
                Janseva Portal
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                One Nation.<br />One Portal.<br />Every Citizen Heard.
              </h2>
              <p className="text-xs text-blue-200 mt-2 leading-relaxed">
                Seamless digital governance portal with separate portal authorization for Citizens, Department Officers, and Municipal Administrators.
              </p>
            </div>
          </div>

          {/* Core Features */}
          <div className="relative z-10 my-6 space-y-3 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block mb-1">
              Portal Governance Matrix
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-emerald-300" />
                <span className="font-semibold text-slate-100">Citizen Grievance Submission</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-indigo-300" />
                <span className="font-semibold text-slate-100">Officer Task Action & Proof Upload</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-purple-300" />
                <span className="font-semibold text-slate-100">Admin Control & Reassignment Center</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-[11px] text-blue-200/80 pt-2 border-t border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Government 256-bit Encrypted Portal Auth</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          
          {/* Main Tab Switcher (Sign In vs Create Account) */}
          <div className="flex items-center gap-2 p-1 bg-[#F8F9FA] rounded-2xl border border-[#DADCE0] mb-6 w-fit">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setLoginError(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'login' ? 'bg-white text-blue-600 shadow-2xs' : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { 
                setActiveTab('register'); 
                setRegStep(1); 
                const targetRole = loginRole === 'officer' ? 'officer' : 'citizen';
                setRegRole(targetRole);
                setRegForm({
                  ...initialRegForm,
                  role: targetRole,
                  department: targetRole === 'officer' ? 'Roads & Infrastructure' : '',
                  designation: targetRole === 'officer' ? 'Assistant Municipal Engineer' : '',
                });
                setLoginError(null); 
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register' ? 'bg-white text-blue-600 shadow-2xs' : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback error alert */}
          {loginError && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Separate Login Role Selector */}
              <div>
                <label className="block text-[11px] font-bold text-[#5F6368] uppercase mb-1.5">
                  Select Portal Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('citizen')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      loginRole === 'citizen'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Citizen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('officer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      loginRole === 'officer'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-xs'
                        : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Officer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      loginRole === 'admin'
                        ? 'border-purple-600 bg-purple-50 text-purple-800 shadow-xs'
                        : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Quick Demo Officer Credentials Option */}
              {loginRole === 'officer' && (
                <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-[#202124]">
                    <span className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      Quick Demo Officer Login
                    </span>
                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">1-Click Login</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIdentifier('officer@janseva.gov.in');
                        setPassword('Officer@2026');
                        setDepartment('Roads & Infrastructure');
                      }}
                      className="p-2 rounded-xl bg-white border border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left cursor-pointer transition-all shadow-2xs group"
                    >
                      <div className="text-xs font-bold text-indigo-900 group-hover:text-indigo-600 flex items-center justify-between">
                        <span>Er. Rajesh Varma</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">Roads & Infrastructure</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIdentifier('priya.water@gov.in');
                        setPassword('Officer@2026');
                        setDepartment('Water Supply & Sewage');
                      }}
                      className="p-2 rounded-xl bg-white border border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left cursor-pointer transition-all shadow-2xs group"
                    >
                      <div className="text-xs font-bold text-indigo-900 group-hover:text-indigo-600 flex items-center justify-between">
                        <span>Officer Priya</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">Water Supply & Sewage</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Department Selector for Officer Login */}
              {loginRole === 'officer' && (
                <div>
                  <label className="block text-xs font-semibold text-[#5F6368] mb-1">
                    Government Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DADCE0] text-xs sm:text-sm font-medium focus:border-[#2563EB] focus:outline-hidden"
                  >
                    <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                    <option value="Water Supply & Sewage">Water Supply & Sewage</option>
                    <option value="Municipality Sanitation">Municipality Sanitation</option>
                    <option value="Electricity Board">Electricity Board</option>
                    <option value="Public Safety & Police">Public Safety & Police</option>
                  </select>
                </div>
              )}

              {/* District for Admin Login */}
              {loginRole === 'admin' && (
                <div>
                  <label className="block text-xs font-semibold text-[#5F6368] mb-1">
                    Administrative Jurisdiction District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Bengaluru Urban District"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DADCE0] text-xs sm:text-sm font-medium focus:border-[#2563EB] focus:outline-hidden"
                  />
                </div>
              )}

              {/* Identifier */}
              <div>
                <label className="block text-xs font-semibold text-[#5F6368] mb-1">
                  {loginRole === 'officer' ? 'Official Govt Email / Employee ID' : loginRole === 'admin' ? 'Admin Official Email' : 'Email Address or Mobile Number'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-[#5F6368]" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={loginRole === 'officer' ? 'officer.name@gov.in' : loginRole === 'admin' ? 'admin.district@gov.in' : 'user@example.com or +91 98765 43210'}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#DADCE0] focus:border-[#2563EB] focus:outline-hidden text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              {/* Password with Eye Toggle Symbol */}
              <div>
                <label className="block text-xs font-semibold text-[#5F6368] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#5F6368]" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#DADCE0] focus:border-[#2563EB] focus:outline-hidden text-xs sm:text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3 text-[#5F6368] hover:text-[#202124] cursor-pointer"
                    title={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl text-white font-semibold text-xs sm:text-sm transition-transform active:scale-[0.99] shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    loginRole === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : loginRole === 'officer' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-[#2563EB] hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Authenticated! Redirecting...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In as {loginRole.toUpperCase()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Account Requirement Info */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">
                  {loginRole === 'admin' ? 'Administrator Access' : loginRole === 'officer' ? 'Official Officer Portal' : 'Citizen Portal'}
                </div>
                <p className="text-[11px] text-slate-500">
                  {loginRole === 'admin' && 'Access restricted to authorized administrators. Default admin accounts cannot be publicly registered.'}
                  {loginRole === 'officer' && 'Registered officers must sign in using their registered credentials or Employee ID.'}
                  {loginRole === 'citizen' && 'Citizens must sign in with their registered Email/Phone and Password. Click "Create Account" if you do not have an account.'}
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: MULTI-STEP REGISTER (OFFICER & CITIZEN ACCOUNT CREATION) */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              
              {/* Role Selector for Account Creation (Citizen & Officer) */}
              <div>
                <label className="block text-[11px] font-bold text-[#5F6368] uppercase mb-1.5">
                  Register Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setRegRole('citizen'); setRegForm({ ...initialRegForm, role: 'citizen' }); setRegStep(1); setLoginError(null); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      regRole === 'citizen'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Citizen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setRegRole('officer'); setRegForm({ ...initialRegForm, role: 'officer' }); setRegStep(1); setLoginError(null); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      regRole === 'officer'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-xs'
                        : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Officer</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-[#DADCE0] pb-2">
                <span className="font-bold text-[#202124]">{regRole.toUpperCase()} Account Creation</span>
                <span className="font-semibold text-blue-600">Step {regStep} of 4</span>
              </div>

              {regStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#5F6368] mb-1">
                      {regRole === 'officer' ? 'Full Officer Name' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder={regRole === 'officer' ? 'e.g. Officer Rajesh Varma' : 'e.g. Aarav Sharma'}
                      className="w-full px-3 py-2 rounded-xl border border-[#DADCE0] text-xs focus:border-blue-600 focus:outline-hidden font-medium"
                    />
                  </div>

                  {regRole === 'officer' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-[#5F6368] mb-1">Assigned Department</label>
                        <select
                          value={regForm.department}
                          onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#DADCE0] text-xs focus:border-blue-600 focus:outline-hidden font-medium"
                        >
                          <option value="" disabled>Select Assigned Department...</option>
                          <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                          <option value="Water Supply & Sewage">Water Supply & Sewage</option>
                          <option value="Municipality Sanitation">Municipality Sanitation</option>
                          <option value="Electricity Board">Electricity Board</option>
                          <option value="Public Safety & Police">Public Safety & Police</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-[#5F6368] mb-1">Designation</label>
                          <input
                            type="text"
                            value={regForm.designation}
                            onChange={(e) => setRegForm({ ...regForm, designation: e.target.value })}
                            placeholder="e.g. Executive Engineer"
                            className="w-full px-3 py-2 rounded-xl border border-[#DADCE0] text-xs focus:border-blue-600 focus:outline-hidden font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#5F6368] mb-1">Employee ID</label>
                          <input
                            type="text"
                            value={regForm.employeeId}
                            onChange={(e) => setRegForm({ ...regForm, employeeId: e.target.value })}
                            placeholder="e.g. GOV-8821"
                            className="w-full px-3 py-2 rounded-xl border border-[#DADCE0] text-xs focus:border-blue-600 focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#5F6368] mb-1">
                      {regRole === 'officer' ? 'Official Govt Email Address' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder={regRole === 'officer' ? 'officer.name@gov.in' : 'user@example.com'}
                      className="w-full px-3 py-2 rounded-xl border border-[#DADCE0] text-xs focus:border-blue-600 focus:outline-hidden font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5F6368] mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl border border-[#DADCE0] text-xs focus:border-blue-600 focus:outline-hidden font-medium"
                    />
                  </div>
                </motion.div>
              )}

              {regStep === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#5F6368] mb-1">Address / Jurisdiction Headquarters</label>
                    <input
                      type="text"
                      value={regForm.address}
                      onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                      placeholder="Street, Office Location or Municipal Ward"
                      className="w-full px-3 py-2 rounded-xl border border-[#DADCE0] text-xs focus:border-blue-600 focus:outline-hidden font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#5F6368] mb-1">State</label>
                      <input
                        type="text"
                        value={regForm.state}
                        onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
                        placeholder="e.g. Karnataka"
                        className="w-full px-3 py-2 rounded-xl border border-[#DADCE0] text-xs focus:border-blue-600 focus:outline-hidden font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#5F6368] mb-1">City / District</label>
                      <input
                        type="text"
                        value={regForm.city}
                        onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                        placeholder="e.g. Bengaluru"
                        className="w-full px-3 py-2 rounded-xl border border-[#DADCE0] text-xs focus:border-blue-600 focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {regStep === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#5F6368] mb-1">Create Password</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-3 pr-10 py-2 rounded-xl border border-[#DADCE0] text-xs focus:border-blue-600 focus:outline-hidden font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-2.5 text-[#5F6368] hover:text-[#202124] cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5F6368] mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-3 pr-10 py-2 rounded-xl border border-[#DADCE0] text-xs focus:border-blue-600 focus:outline-hidden font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3 top-2.5 text-[#5F6368] hover:text-[#202124] cursor-pointer"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {regStep === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
                  <h4 className="text-lg font-bold text-[#202124]">{regRole.toUpperCase()} Account Created!</h4>
                  <p className="text-xs text-[#5F6368]">
                    Welcome {regForm.name}. Your account is created and logged in with Janseva Portal. Redirecting...
                  </p>
                </motion.div>
              )}

              {regStep < 4 && (
                <div className="flex items-center justify-between pt-2 border-t border-[#DADCE0]">
                  <button
                    type="button"
                    onClick={() => {
                      if (regStep > 1) setRegStep((regStep - 1) as any);
                      else setActiveTab('login');
                    }}
                    className="text-xs font-semibold text-[#5F6368] hover:underline cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleRegisterNext}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {isLoading ? 'Creating...' : regStep === 3 ? 'Complete Registration' : 'Next Step'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
