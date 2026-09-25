import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, LayoutDashboard, User, LogOut, ShieldCheck, 
  Mail, ArrowUpRight, Sparkles 
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function AppFooter() {
  const user = JSON.parse(localStorage.getItem('eventforge_user') || 'null');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('eventforge_token');
    localStorage.removeItem('eventforge_user');
    navigate('/');
    window.location.reload();
  };

  const getUserDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'PLATFORM_ADMIN') return '/dashboard/admin';
    if (user.role === 'ATTENDEE') return '/dashboard/attendee';
    if (user.role === 'STAFF') return '/dashboard/staff';
    return '/dashboard/organizer';
  };

  const getDashboardLabel = () => {
    if (!user) return 'Sign In / Portal Access';
    if (user.role === 'PLATFORM_ADMIN') return 'Platform Admin Console';
    if (user.role === 'ATTENDEE') return 'My Attendee Passes';
    if (user.role === 'STAFF') return 'Door Staff Scanner';
    return 'Organizer Dashboard';
  };

  return (
    <footer className="bg-[#1C1917] border-t border-[#EFE8DA] text-stone-400 pt-14 pb-10 mt-auto relative z-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <BrandLogo to="/" size="large" variant="onDark" />
          <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
            The AI-enabled corporate event operating system. Transactional registrations, conflict-free multi-track agendas, sponsor deliverables, and instant door validation.
          </p>
          <div className="pt-1 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> All Systems Operational
            </span>
            <span className="text-[10px] text-stone-500 font-mono">v2.4 Enterprise</span>
          </div>
        </div>

        {/* Essential Navigation Links */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/explore" className="hover:text-white transition-colors">Explore Summits</Link></li>
            <li><Link to="/features" className="hover:text-white transition-colors">Platform Features</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About EventForge</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact &amp; Helpdesk</Link></li>
          </ul>
        </div>

        {/* Portal / Account Management */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">
            {user ? 'My Workspace' : 'Account & Access'}
          </h4>
          <ul className="space-y-2 text-xs">
            {user ? (
              <>
                <li>
                  <Link to={getUserDashboardPath()} className="text-[#C28E27] font-bold hover:text-white transition-colors flex items-center gap-1.5">
                    <LayoutDashboard size={13} /> {getDashboardLabel()}
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <User size={13} /> Profile Settings
                  </Link>
                </li>
                {user.role === 'ORGANIZER' && (
                  <li>
                    <Link to="/dashboard/organizer/events/new" className="hover:text-white transition-colors">
                      + Create New Conference
                    </Link>
                  </li>
                )}
                {user.role === 'STAFF' && (
                  <li>
                    <Link to="/dashboard/staff" className="hover:text-white transition-colors">
                      Door Entrance Scanner
                    </Link>
                  </li>
                )}
                <li>
                  <button 
                    onClick={handleLogout} 
                    className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 text-xs"
                  >
                    <LogOut size={12} /> Sign Out ({user.name?.split(' ')[0] || 'User'})
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/login?tab=register" className="hover:text-white transition-colors">Create Free Account</Link></li>
                <li><Link to="/explore" className="hover:text-white transition-colors">Public Event Registry</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Support Helpdesk</Link></li>
              </>
            )}
          </ul>
        </div>

      </div>

      {/* Sub-Footer Legal & Security Bar */}
      <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
        <p>© {new Date().getFullYear()} EventForge Enterprise Technologies. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/contact" className="hover:text-stone-300 transition-colors">Help Center</Link>
          <span>•</span>
          <span className="text-stone-400">Enterprise SLA Protected</span>
          <span>•</span>
          <Link to="/about" className="hover:text-stone-300 transition-colors">Architecture</Link>
        </div>
      </div>
    </footer>
  );
}
