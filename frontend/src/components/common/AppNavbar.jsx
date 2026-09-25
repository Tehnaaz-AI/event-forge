import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Ticket, LayoutDashboard, Shield, Mic, 
  MessageSquare, Settings, LogOut, ArrowRight, Compass, 
  Sparkles, Layers, User, ChevronDown, Plus, ShieldCheck, ShieldAlert, UserCheck,
  Menu, X
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import BrandLogo from './BrandLogo';

export default function AppNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('eventforge_user') || 'null'));
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      setUser(JSON.parse(localStorage.getItem('eventforge_user') || 'null'));
    };
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('eventforge_token');
    localStorage.removeItem('eventforge_user');
    setUser(null);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const roleBadges = {
    PLATFORM_ADMIN: { label: 'Platform Admin', color: 'bg-rose-100 text-rose-800 border-rose-200' },
    ORGANIZER: { label: 'Event Organizer', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    STAFF: { label: 'Door Staff', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    ATTENDEE: { label: 'Attendee Pass', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
  };

  // Build role-differentiated navigation links
  const getNavLinks = () => {
    if (!user) {
      return [
        { label: 'Explore Summits', path: '/explore' },
        { label: 'Platform Features', path: '/features' },
        { label: 'About EventForge', path: '/about' },
        { label: 'VIP Waitlist', path: '/waitlist' },
        { label: 'Contact', path: '/contact' }
      ];
    }

    if (user.role === 'PLATFORM_ADMIN') {
      return [
        { label: 'Explore', path: '/explore' },
        { label: 'Admin Console', path: '/dashboard/admin', icon: <ShieldAlert size={14} className="text-rose-600" /> },
        { label: 'Conferences', path: '/dashboard/organizer/events' },
        { label: 'Speakers', path: '/dashboard/organizer/speakers' },
        { label: 'Inbound Inquiries', path: '/dashboard/admin/inquiries', icon: <MessageSquare size={14} className="text-[#B45309]" /> }
      ];
    }

    if (user.role === 'ATTENDEE') {
      return [
        { label: 'Explore Summits', path: '/explore' },
        { label: 'My Passes & Badges', path: '/dashboard/attendee', icon: <Ticket size={14} className="text-[#B45309]" /> },
        { label: 'VIP Waitlist', path: '/waitlist' },
        { label: 'Contact', path: '/contact' }
      ];
    }

    if (user.role === 'STAFF') {
      return [
        { label: 'Explore Summits', path: '/explore' },
        { label: 'Door QR Scanner', path: '/dashboard/staff', icon: <Shield size={14} className="text-[#B45309]" /> },
        { label: 'Contact', path: '/contact' }
      ];
    }

    // ORGANIZER
    return [
      { label: 'Explore', path: '/explore' },
      { label: 'Executive Suite', path: '/dashboard/organizer', icon: <LayoutDashboard size={14} className="text-[#B45309]" /> },
      { label: 'Conferences', path: '/dashboard/organizer/events' },
      { label: 'Speakers', path: '/dashboard/organizer/speakers' },
      { label: 'Contact', path: '/contact' }
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-3 sm:top-4 z-50 w-full px-3 sm:px-6 pointer-events-none transition-all duration-200">
      <div className="max-w-6xl mx-auto curved-navbar px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between pointer-events-auto shadow-md">
        
        {/* Brand Logo with Cursive "Event" and Bold "FORGE" - Clean Typography without icon */}
        <BrandLogo to="/" size="default" showIcon={false} />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-stone-600">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 transition-colors py-1.5 px-3 rounded-full ${
                  isActive 
                    ? 'text-[#B45309] bg-[#B45309]/10 font-extrabold' 
                    : 'hover:text-[#B45309] hover:bg-stone-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls (Theme Toggle, Profile, Mobile Menu Button) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <ThemeToggle />

          {/* Desktop User Profile Button */}
          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-2.5 pr-2 rounded-full bg-[#FAF8F5] border border-[#EFE8DA] hover:border-[#B45309]/40 transition-all shadow-xs"
              >
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-stone-900 truncate max-w-[110px] leading-tight">{user.name}</p>
                  <span className="text-[9px] font-bold text-[#B45309] uppercase tracking-wider block">
                    {roleBadges[user.role]?.label || user.role}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#1C1917] text-[#FDFAF5] flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <ChevronDown size={14} className="text-stone-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white border border-[#EFE8DA] rounded-2xl p-2 shadow-xl space-y-1 z-50 animate-in fade-in"
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#EFE8DA] mb-1">
                    <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-stone-500 truncate">{user.email}</p>
                  </div>

                  {user.role === 'PLATFORM_ADMIN' && (
                    <Link
                      to="/dashboard/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                    >
                      <ShieldAlert size={14} className="text-rose-600" /> Platform Master Console
                    </Link>
                  )}

                  {user.role === 'ATTENDEE' && (
                    <Link
                      to="/dashboard/attendee"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-[#B45309]/10 hover:text-[#B45309] rounded-xl transition-colors"
                    >
                      <Ticket size={14} /> My Passes &amp; QR Badges
                    </Link>
                  )}

                  {user.role === 'STAFF' && (
                    <Link
                      to="/dashboard/staff"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-[#B45309]/10 hover:text-[#B45309] rounded-xl transition-colors"
                    >
                      <Shield size={14} /> Door Optical Scanner
                    </Link>
                  )}

                  {['ORGANIZER', 'PLATFORM_ADMIN'].includes(user.role) && (
                    <>
                      <Link
                        to="/dashboard/organizer"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-[#B45309]/10 hover:text-[#B45309] rounded-xl transition-colors"
                      >
                        <LayoutDashboard size={14} /> Executive Dashboard
                      </Link>
                      <Link
                        to="/dashboard/attendee"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-[#B45309]/10 hover:text-[#B45309] rounded-xl transition-colors"
                      >
                        <Ticket size={14} /> My Secured Passes &amp; Badges
                      </Link>
                      <Link
                        to="/dashboard/organizer/events/new"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-[#B45309]/10 hover:text-[#B45309] rounded-xl transition-colors"
                      >
                        <Plus size={14} /> Create Conference
                      </Link>
                    </>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-[#B45309]/10 hover:text-[#B45309] rounded-xl transition-colors"
                  >
                    <User size={14} /> Profile &amp; Avatar
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors pt-2 border-t border-[#EFE8DA]"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link 
                to="/login"
                className="text-xs font-bold text-stone-700 hover:text-[#B45309] px-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors"
              >
                Sign In
              </Link>

              <Link 
                to="/login?tab=register"
                className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm shadow-[#B45309]/20 transition-all flex items-center gap-1"
              >
                Get Started <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {/* Mobile & Tablet Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#EFE8DA] text-stone-700 hover:text-[#B45309] flex items-center justify-center transition-colors shadow-xs"
            aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* 📱 MOBILE & TABLET SLIDE-DOWN DRAWER 📱 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden max-w-6xl mx-auto mt-2 pointer-events-auto"
          >
            <div className="bg-white/95 backdrop-blur-2xl border border-[#EFE8DA] rounded-3xl p-5 shadow-2xl space-y-4">
              
              {/* User Account Info on Mobile */}
              {user ? (
                <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#1C1917] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
                      <span className="text-[9px] font-bold text-[#B45309] uppercase">
                        {roleBadges[user.role]?.label || user.role}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-bold text-[#B45309] hover:underline px-2 py-1"
                  >
                    Profile
                  </Link>
                </div>
              ) : null}

              {/* Navigation Links Grid on Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {navLinks.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#B45309] text-white shadow-xs'
                          : 'bg-[#FAF8F5] text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Action Buttons & Logout on Mobile */}
              <div className="pt-2 border-t border-[#EFE8DA] flex flex-col gap-2">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-bold transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out ({user.name?.split(' ')[0]})</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-3 bg-[#FAF8F5] text-stone-800 text-center rounded-2xl text-xs font-bold border border-[#EFE8DA] hover:bg-stone-100"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/login?tab=register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-3 bg-[#B45309] text-white text-center rounded-2xl text-xs font-bold shadow-md hover:bg-[#92400E]"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
