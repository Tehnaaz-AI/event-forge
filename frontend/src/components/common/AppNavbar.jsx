import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, Ticket, LayoutDashboard, Shield, Mic, 
  MessageSquare, Settings, LogOut, ArrowRight, Compass, 
  Sparkles, Layers, User, ChevronDown, Plus, ShieldCheck, ShieldAlert, UserCheck
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function AppNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('eventforge_user') || 'null'));
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      setUser(JSON.parse(localStorage.getItem('eventforge_user') || 'null'));
    };
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('eventforge_token');
    localStorage.removeItem('eventforge_user');
    setUser(null);
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
    const common = [
      { label: 'Explore Summits', path: '/explore' },
      { label: 'Platform Features', path: '/features' },
      { label: 'About EventForge', path: '/about' },
      { label: 'VIP Waitlist', path: '/waitlist' },
      { label: 'Contact', path: '/contact' }
    ];

    if (!user) {
      return common;
    }

    if (user.role === 'PLATFORM_ADMIN') {
      return [
        { label: 'Home', path: '/' },
        { label: 'Explore', path: '/explore' },
        { label: 'Admin Console', path: '/dashboard/admin', icon: <ShieldAlert size={14} className="text-rose-600" /> },
        { label: 'Conferences', path: '/dashboard/organizer/events' },
        { label: 'Speakers', path: '/dashboard/organizer/speakers' },
        { label: 'Profile', path: '/profile' }
      ];
    }

    if (user.role === 'ATTENDEE') {
      return [
        { label: 'Home', path: '/' },
        { label: 'Explore Conferences', path: '/explore' },
        { label: 'My Passes & Badges', path: '/dashboard/attendee', icon: <Ticket size={14} className="text-[#B45309]" /> },
        { label: 'My Profile', path: '/profile' }
      ];
    }

    if (user.role === 'STAFF') {
      return [
        { label: 'Home', path: '/' },
        { label: 'Explore Conferences', path: '/explore' },
        { label: 'Door QR Scanner', path: '/dashboard/staff', icon: <Shield size={14} className="text-[#B45309]" /> },
        { label: 'My Profile', path: '/profile' }
      ];
    }

    // ORGANIZER
    return [
      { label: 'Home', path: '/' },
      { label: 'Explore', path: '/explore' },
      { label: 'Dashboard', path: '/dashboard/organizer', icon: <LayoutDashboard size={14} className="text-[#B45309]" /> },
      { label: 'Conferences', path: '/dashboard/organizer/events' },
      { label: 'Speakers', path: '/dashboard/organizer/speakers' },
      { label: 'My Profile', path: '/profile' }
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 pointer-events-none transition-all duration-200">
      <div className="max-w-6xl mx-auto curved-navbar px-6 py-3 flex items-center justify-between pointer-events-auto shadow-md">
        
        {/* Brand Logo with Cursive "event" and Bold "FORGE" */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B45309] to-[#D97706] flex items-center justify-center text-white shadow-sm shadow-[#B45309]/20 group-hover:scale-105 transition-transform">
            <Calendar size={18} className="font-bold" />
          </div>
          <div className="flex items-baseline leading-none">
            <span className="logo-cursive text-3xl font-extrabold text-[#B45309] mr-0.5 tracking-normal">Event</span>
            <span className="font-extrabold text-stone-900 text-xl tracking-tight uppercase">FORGE</span>
          </div>
        </Link>

        {/* Dynamic Role-Based Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-stone-600">
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

        {/* Right Controls (Theme Toggle, Auth & Profile) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <ThemeToggle />
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-2.5 pr-2 rounded-full bg-[#FAF8F5] border border-[#EFE8DA] hover:border-[#B45309]/40 transition-all shadow-xs"
              >
                <div className="text-right hidden sm:block">
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
                        to="/dashboard/organizer/events/new"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-[#B45309]/10 hover:text-[#B45309] rounded-xl transition-colors"
                      >
                        <Plus size={14} /> Create Conference
                      </Link>
                    </>
                  )}

                  {/* Profile Studio for all logged in accounts */}
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-[#B45309]/10 hover:text-[#B45309] rounded-xl transition-colors"
                  >
                    <User size={14} /> Executive Profile &amp; Avatar
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
            <div className="flex items-center gap-2">
              <Link 
                to="/login"
                className="text-xs font-bold text-stone-700 hover:text-[#B45309] px-3.5 py-2 rounded-full hover:bg-stone-100 transition-colors"
              >
                Sign In
              </Link>

              <Link 
                to="/login?tab=register"
                className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm shadow-[#B45309]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
              >
                Get Started <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
