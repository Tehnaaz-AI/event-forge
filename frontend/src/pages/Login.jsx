import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, Lock, Mail, User, Building, ShieldCheck, 
  ArrowRight, Eye, EyeOff, CheckCircle2, UserCheck, Calendar,
  Ticket, Check, Star, Zap
} from 'lucide-react';
import { api } from '../services/api';
import AppNavbar from '../components/common/AppNavbar';
import AppFooter from '../components/common/AppFooter';
import BrandLogo from '../components/common/BrandLogo';

export default function Login() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(searchParams.get('tab') === 'register');
  const navigate = useNavigate();

  // Existing logged-in user state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('eventforge_user') || 'null');
    } catch {
      return null;
    }
  });

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [roleType, setRoleType] = useState('ATTENDEE'); // Default to Attendee for delegate convenience
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getDashboardPathForUser = (u) => {
    if (!u) return '/dashboard/attendee';
    if (u.role === 'PLATFORM_ADMIN') return '/dashboard/admin';
    if (u.role === 'ATTENDEE') return '/dashboard/attendee';
    if (u.role === 'STAFF') return '/dashboard/staff';
    return '/dashboard/organizer';
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setIsRegister(true);
    } else {
      setIsRegister(false);
    }
  }, [searchParams]);

  const handleSwitchAccount = () => {
    localStorage.removeItem('eventforge_token');
    localStorage.removeItem('eventforge_user');
    setCurrentUser(null);
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setIsRegister(false);
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email: quickEmail, password: quickPassword });
      localStorage.setItem('eventforge_token', res.token);
      localStorage.setItem('eventforge_user', JSON.stringify(res.user));

      if (res.user?.role === 'PLATFORM_ADMIN') {
        navigate('/dashboard/admin');
      } else if (res.user?.role === 'ATTENDEE') {
        navigate('/dashboard/attendee');
      } else if (res.user?.role === 'STAFF') {
        navigate('/dashboard/staff');
      } else {
        navigate('/dashboard/organizer');
      }
    } catch (err) {
      setError(err.message || 'Quick login failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        // Registration Flow
        const payload = {
          name,
          email,
          password,
          role: roleType,
          ...(roleType === 'ORGANIZER' && organizationName ? { organizationName } : {})
        };
        const res = await api.post('/auth/register', payload);
        localStorage.setItem('eventforge_token', res.token);
        localStorage.setItem('eventforge_user', JSON.stringify(res.user));
        
        // Redirect based on query param, state, or role
        const targetRedirect = searchParams.get('from') || (location.state?.from
          ? (typeof location.state.from === 'string' 
              ? location.state.from 
              : (location.state.from.pathname + (location.state.from.search || '')))
          : null);

        if (targetRedirect) {
          navigate(targetRedirect, { replace: true });
        } else if (res.user?.role === 'ATTENDEE') {
          navigate('/dashboard/attendee');
        } else if (res.user?.role === 'STAFF') {
          navigate('/dashboard/staff');
        } else if (res.user?.role === 'PLATFORM_ADMIN') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard/organizer');
        }
      } else {
        // Login Flow
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('eventforge_token', res.token);
        localStorage.setItem('eventforge_user', JSON.stringify(res.user));
        
        // Role based routing or previous target
        const targetRedirect = searchParams.get('from') || (location.state?.from
          ? (typeof location.state.from === 'string' 
              ? location.state.from 
              : (location.state.from.pathname + (location.state.from.search || '')))
          : null);

        if (targetRedirect) {
          navigate(targetRedirect, { replace: true });
        } else if (res.user?.role === 'ATTENDEE') {
          navigate('/dashboard/attendee');
        } else if (res.user?.role === 'STAFF') {
          navigate('/dashboard/staff');
        } else if (res.user?.role === 'PLATFORM_ADMIN') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard/organizer');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0C0A09] flex flex-col text-stone-900 dark:text-stone-100 font-sans selection:bg-[#B45309] selection:text-white relative transition-colors duration-300">
      
      {/* Universal Floating Navbar */}
      <AppNavbar />

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Ambient Warm Golden Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-[#B45309]/10 dark:bg-[#B45309]/15 rounded-full blur-[140px] pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10 space-y-2 flex flex-col items-center">
          <BrandLogo to="/" size="hero" />
          <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-widest font-bold">
            {isRegister ? 'New Member Registration' : 'Executive Portal Access'}
          </p>
        </div>

        {/* Main Ivory / Slate Card */}
        <div className="bg-white dark:bg-[#1C1917] border border-[#EFE8DA] dark:border-stone-800 rounded-3xl p-7 sm:p-9 max-w-lg w-full shadow-2xl shadow-stone-900/5 dark:shadow-black/80 relative z-10 space-y-6">
          
          {currentUser ? (
            /* Logged in state view */
            <div className="space-y-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-[#B45309]/10 dark:bg-amber-950/40 text-[#B45309] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-1.5">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                  Active Session Authenticated
                </span>
                <h3 className="text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                  Welcome Back, {currentUser.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Signed in as <span className="font-bold text-stone-800 dark:text-stone-200">{currentUser.email}</span> ({currentUser.role})
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(getDashboardPathForUser(currentUser))}
                  className="w-full bg-[#B45309] hover:bg-[#92400E] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#B45309]/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight size={15} />
                </button>

                <Link
                  to="/profile"
                  className="w-full bg-[#FAF8F5] dark:bg-[#292524] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold py-3 rounded-2xl border border-[#EFE8DA] dark:border-stone-700 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <User size={14} /> View Account Profile
                </Link>

                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="w-full text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold py-2 transition-colors cursor-pointer"
                >
                  Sign Out &amp; Switch Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Form Title with Identical Brand Logo */}
              <div className="text-center space-y-2 pb-1 flex flex-col items-center">
                <div className="flex items-center justify-center gap-2 flex-wrap text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                  <span>{isRegister ? 'Join' : 'Welcome to'}</span>
                  <BrandLogo to="/" size="default" showIcon={false} asSpan={true} />
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  {isRegister 
                    ? 'Join verified attendees and organizers worldwide for executive conferences & summits.' 
                    : 'Enter your credentials to access your multi-track workspace and passes.'}
                </p>
              </div>

              {/* Mode Switcher Tabs (Sign In vs Register) */}
              <div className="grid grid-cols-2 p-1.5 bg-stone-100 dark:bg-[#292524] rounded-2xl border border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(''); }}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    !isRegister 
                      ? 'bg-white dark:bg-[#1C1917] text-[#B45309] dark:text-amber-400 shadow-sm border border-stone-200 dark:border-stone-700' 
                      : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(''); }}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isRegister 
                      ? 'bg-white dark:bg-[#1C1917] text-[#B45309] dark:text-amber-400 shadow-sm border border-stone-200 dark:border-stone-700' 
                      : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* One-Click Role Quick Fill Demo Section (In Sign-In mode) */}
              {!isRegister && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#B45309]" /> One-Click Demo Access
                    </span>
                    <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">Pass: Password123!</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Super Admin */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('admin@eventforge.com', 'Password123!')}
                      className="p-3 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-extrabold text-rose-800 dark:text-rose-400 uppercase tracking-wider">Super Admin</span>
                        <span className="text-[9px] bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-200 px-1.5 py-0.5 rounded-md font-bold">1-Click</span>
                      </div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white truncate mt-1">Platform Admin</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono truncate">admin@eventforge.com</p>
                    </button>

                    {/* Organizer */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('organizer@eventforge.com', 'Password123!')}
                      className="p-3 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-extrabold text-[#B45309] dark:text-amber-400 uppercase tracking-wider">Organizer</span>
                        <span className="text-[9px] bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded-md font-bold">1-Click</span>
                      </div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white truncate mt-1">Elena Rostova</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono truncate">organizer@eventforge.com</p>
                    </button>

                    {/* Door Staff */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('staff@eventforge.com', 'Password123!')}
                      className="p-3 rounded-2xl border border-orange-200 dark:border-orange-900/40 bg-orange-50/60 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-extrabold text-orange-800 dark:text-orange-400 uppercase tracking-wider">Door Staff</span>
                        <span className="text-[9px] bg-orange-200/80 dark:bg-orange-900 text-orange-900 dark:text-orange-200 px-1.5 py-0.5 rounded-md font-bold">1-Click</span>
                      </div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white truncate mt-1">David Miller</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono truncate">staff@eventforge.com</p>
                    </button>

                    {/* Verified Attendee */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('attendee@eventforge.com', 'Password123!')}
                      className="p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Attendee Pass</span>
                        <span className="text-[9px] bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.5 rounded-md font-bold">1-Click</span>
                      </div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white truncate mt-1">Marcus Vance</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono truncate">attendee@eventforge.com</p>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-[#EFE8DA] dark:border-stone-800"></div>
                    <span className="shrink-0 mx-3 text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">Or Sign In Manually</span>
                    <div className="flex-grow border-t border-[#EFE8DA] dark:border-stone-800"></div>
                  </div>
                </div>
              )}

              {/* Registration Benefits Badge Bar (In Sign-Up mode) */}
              {isRegister && (
                <div className="bg-[#FAF8F5] dark:bg-[#292524] p-3.5 rounded-2xl border border-[#EFE8DA] dark:border-stone-800 flex items-center justify-around text-[11px] text-stone-700 dark:text-stone-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <Check size={13} className="text-emerald-600" /> Instant QR Passes
                  </span>
                  <span className="flex items-center gap-1">
                    <Check size={13} className="text-emerald-600" /> AI Matchmaker
                  </span>
                  <span className="flex items-center gap-1">
                    <Check size={13} className="text-emerald-600" /> Free Registration
                  </span>
                </div>
              )}

              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 rounded-2xl text-xs font-semibold animate-in fade-in flex items-center gap-2">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Registration: Select Account Role */}
                {isRegister && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                      Select Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Attendee Option */}
                      <button
                        type="button"
                        onClick={() => setRoleType('ATTENDEE')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                          roleType === 'ATTENDEE' 
                            ? 'bg-amber-50/80 dark:bg-amber-950/40 border-[#B45309] dark:border-amber-500 ring-2 ring-[#B45309]/20 shadow-sm' 
                            : 'border-[#EFE8DA] dark:border-stone-800 bg-[#FAF8F5] dark:bg-[#292524] hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Ticket size={16} className={roleType === 'ATTENDEE' ? 'text-[#B45309]' : 'text-stone-400'} />
                          {roleType === 'ATTENDEE' && (
                            <span className="w-2 h-2 rounded-full bg-[#B45309]"></span>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-extrabold text-stone-900 dark:text-white">Attendee / VIP</p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400">Book passes &amp; network</p>
                        </div>
                      </button>

                      {/* Organizer Option */}
                      <button
                        type="button"
                        onClick={() => setRoleType('ORGANIZER')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                          roleType === 'ORGANIZER' 
                            ? 'bg-amber-50/80 dark:bg-amber-950/40 border-[#B45309] dark:border-amber-500 ring-2 ring-[#B45309]/20 shadow-sm' 
                            : 'border-[#EFE8DA] dark:border-stone-800 bg-[#FAF8F5] dark:bg-[#292524] hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Building size={16} className={roleType === 'ORGANIZER' ? 'text-[#B45309]' : 'text-stone-400'} />
                          {roleType === 'ORGANIZER' && (
                            <span className="w-2 h-2 rounded-full bg-[#B45309]"></span>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-extrabold text-stone-900 dark:text-white">Event Organizer</p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400">Host &amp; curate summits</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Full Name (Sign Up only) */}
                {isRegister && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Eleanor Vance"
                        className="w-full bg-[#FAF8F5] dark:bg-[#292524] hover:bg-white dark:hover:bg-[#1C1917] focus:bg-white dark:focus:bg-[#1C1917] border border-[#EFE8DA] dark:border-stone-800 rounded-xl pl-10 pr-4 py-3 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#B45309]/25 focus:border-[#B45309] transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Organization Name (If Organizer role selected in Sign Up) */}
                {isRegister && roleType === 'ORGANIZER' && (
                  <div className="space-y-1 animate-in fade-in">
                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                      Organization / Company Name
                    </label>
                    <div className="relative">
                      <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        required
                        type="text"
                        value={organizationName}
                        onChange={e => setOrganizationName(e.target.value)}
                        placeholder="e.g. Global Tech Summit Guild"
                        className="w-full bg-[#FAF8F5] dark:bg-[#292524] hover:bg-white dark:hover:bg-[#1C1917] focus:bg-white dark:focus:bg-[#1C1917] border border-[#EFE8DA] dark:border-stone-800 rounded-xl pl-10 pr-4 py-3 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#B45309]/25 focus:border-[#B45309] transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-[#FAF8F5] dark:bg-[#292524] hover:bg-white dark:hover:bg-[#1C1917] focus:bg-white dark:focus:bg-[#1C1917] border border-[#EFE8DA] dark:border-stone-800 rounded-xl pl-10 pr-4 py-3 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#B45309]/25 focus:border-[#B45309] transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF8F5] dark:bg-[#292524] hover:bg-white dark:hover:bg-[#1C1917] focus:bg-white dark:focus:bg-[#1C1917] border border-[#EFE8DA] dark:border-stone-800 rounded-xl pl-10 pr-10 py-3 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#B45309]/25 focus:border-[#B45309] transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#B45309] hover:bg-[#92400E] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#B45309]/25 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Authenticating...' : isRegister ? 'Create Account & Continue' : 'Sign In to EventForge'}
                  <ArrowRight size={15} />
                </button>
              </form>

              {/* Security Footer Badge */}
              <div className="pt-4 border-t border-[#EFE8DA] dark:border-stone-800 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                  <ShieldCheck size={14} className="text-[#B45309]" />
                  <span>Enterprise Security &amp; End-to-End Verification</span>
                </div>
                <p className="text-[10px] text-stone-400 dark:text-stone-500">
                  {isRegister 
                    ? 'By registering, you agree to EventForge Terms of Service and Privacy Policy.' 
                    : 'Sign in to access your conferences, attendee passes, or operator controls.'}
                </p>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Universal Enterprise Luxury Footer */}
      <AppFooter />
    </div>
  );
}
