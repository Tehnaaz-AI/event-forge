import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, Lock, Mail, User, Building, ShieldCheck, 
  ArrowRight, Eye, EyeOff, CheckCircle2, UserCheck, Calendar 
} from 'lucide-react';
import { api } from '../services/api';
import AppNavbar from '../components/common/AppNavbar';

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
  const [roleType, setRoleType] = useState('ORGANIZER'); // 'ORGANIZER' | 'ATTENDEE'
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
        
        // Redirect based on role or previous target
        const targetRedirect = location.state?.from
          ? (typeof location.state.from === 'string' 
              ? location.state.from 
              : (location.state.from.pathname + (location.state.from.search || '')))
          : null;

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
        const targetRedirect = location.state?.from
          ? (typeof location.state.from === 'string' 
              ? location.state.from 
              : (location.state.from.pathname + (location.state.from.search || '')))
          : null;

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
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-stone-900 font-sans selection:bg-[#B45309] selection:text-white relative">
      
      {/* Universal Floating Navbar */}
      <AppNavbar />

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
        {/* Ambient Warm Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#B45309]/5 rounded-full blur-[140px] pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10 space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#B45309] to-[#D97706] flex items-center justify-center text-white shadow-md shadow-[#B45309]/20 group-hover:scale-105 transition-transform">
              <Calendar size={22} className="font-bold" />
            </div>
            <div className="flex items-baseline leading-none">
              <span className="logo-cursive text-4xl font-extrabold text-[#B45309] mr-0.5 tracking-normal">Event</span>
              <span className="font-extrabold text-stone-900 text-2xl tracking-tight uppercase">FORGE</span>
            </div>
          </Link>
          <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Executive Portal Access</p>
        </div>

        {/* Main Ivory Card */}
        <div className="bg-white border border-[#EFE8DA] rounded-3xl p-8 max-w-md w-full shadow-xl relative z-10 space-y-6">
          
          {currentUser ? (
            /* Logged in state view */
            <div className="space-y-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-1.5">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  Active Session Authenticated
                </span>
                <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">
                  Welcome Back, {currentUser.name}
                </h3>
                <p className="text-xs text-stone-500">
                  Signed in as <span className="font-bold text-stone-800">{currentUser.email}</span> ({currentUser.role})
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(getDashboardPathForUser(currentUser))}
                  className="w-full bg-[#B45309] hover:bg-[#92400E] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#B45309]/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight size={15} />
                </button>

                <Link
                  to="/profile"
                  className="w-full bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 font-bold py-3 rounded-2xl border border-[#EFE8DA] transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <User size={14} /> View Account Profile
                </Link>

                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="w-full text-stone-400 hover:text-rose-600 text-xs font-bold py-2 transition-colors"
                >
                  Sign Out &amp; Switch Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Toggle Mode Tabs (Sign In vs Register) */}
              <div className="grid grid-cols-2 p-1 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA]">
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(''); }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    !isRegister ? 'bg-[#B45309] text-white shadow-md shadow-[#B45309]/25' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(''); }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isRegister ? 'bg-[#B45309] text-white shadow-md shadow-[#B45309]/25' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold animate-in fade-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Registration specific fields */}
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRoleType('ORGANIZER')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        roleType === 'ORGANIZER' 
                          ? 'bg-[#B45309]/10 border-[#B45309] text-[#B45309]' 
                          : 'border-[#EFE8DA] bg-[#FAF8F5] text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      Event Organizer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleType('ATTENDEE')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        roleType === 'ATTENDEE' 
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800' 
                          : 'border-[#EFE8DA] bg-[#FAF8F5] text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      Attendee
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl pl-10 pr-4 py-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                    />
                  </div>
                </div>

                {roleType === 'ORGANIZER' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Organization / Company Name</label>
                    <div className="relative">
                      <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        required
                        type="text"
                        value={organizationName}
                        onChange={e => setOrganizationName(e.target.value)}
                        placeholder="e.g. Global Tech Guild"
                        className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl pl-10 pr-4 py-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl pl-10 pr-4 py-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#B45309] font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl pl-10 pr-10 py-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#B45309] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B45309] hover:bg-[#92400E] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#B45309]/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Create Account & Continue' : 'Sign In to EventForge'}
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Production Footer Badge */}
          <div className="pt-4 border-t border-[#EFE8DA] text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 font-medium">
              <ShieldCheck size={14} className="text-[#B45309]" />
              <span>Enterprise Security &amp; End-to-End Verification</span>
            </div>
            <p className="text-[10px] text-stone-400">
              {isRegister 
                ? 'Create your organizer or attendee profile to start managing and attending conferences.' 
                : 'Sign in to access your conferences, attendee passes, or admin controls.'}
            </p>
          </div>
        </>
      )}

        </div>
      </div>
    </div>
  );
}
