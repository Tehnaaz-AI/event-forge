import AppNavbar from '../components/common/AppNavbar';
import CookieConsent from '../components/common/CookieConsent';
import useSiteAnalytics from '../components/common/useSiteAnalytics';
import ScrollProgressBar from '../components/common/ScrollProgressBar';
import FloatingJourneyDock from '../components/common/FloatingJourneyDock';
import { Calendar, CheckCircle2, LayoutDashboard, Ticket, Shield, ShieldAlert, User, LogOut } from 'lucide-react';

export default function PublicLayout() {
  useSiteAnalytics();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('eventforge_user') || 'null'));
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-[#B45309] selection:text-white relative">
      
      {/* Scroll Physics Progress Bar */}
      <ScrollProgressBar />

      {/* Floating Curved Navbar */}
      <AppNavbar />

      {/* Main Page Canvas */}
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>

      {/* Interactive Floating Dock */}
      <FloatingJourneyDock />

      {/* Cookie Consent Banner */}
      <CookieConsent />

      {/* Enterprise Luxury Footer */}
      <footer className="bg-[#1C1917] border-t border-white/10 text-stone-400 pt-16 pb-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-baseline leading-none">
              <span className="logo-cursive text-3xl font-extrabold text-[#C28E27] mr-0.5">Event</span>
              <span className="font-extrabold text-white text-xl tracking-tight uppercase">FORGE</span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              The AI-enabled corporate event operating system. Transactional registrations, conflict-free multi-track agendas, sponsor deliverables, and instant door validation.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> All Systems Operational
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/explore" className="hover:text-white transition-colors">Explore Summits</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About EventForge</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Platform Features</Link></li>
              <li><Link to="/waitlist" className="hover:text-white transition-colors">VIP Waitlist</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact &amp; Helpdesk</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              {user ? 'My Account & Hub' : 'Portals'}
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
                  <li><Link to="/login" className="hover:text-white transition-colors">Sign In / Portal Access</Link></li>
                  <li><Link to="/login?tab=register" className="hover:text-white transition-colors">Create Free Account</Link></li>
                  <li><Link to="/explore" className="hover:text-white transition-colors">Explore Public Summits</Link></li>
                  <li><Link to="/waitlist" className="hover:text-white transition-colors">Priority Pass Waitlist</Link></li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Security &amp; Trust</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#C28E27]" /> SOC2 Certified</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#C28E27]" /> GDPR Compliant</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#C28E27]" /> Atomic Booking Lock</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#C28E27]" /> 256-Bit SSL Encryption</li>
            </ul>
          </div>

        </div>

        <div className="max-w-6xl mx-auto px-6 pt-12 mt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} EventForge Inc. Enterprise Conference Operating System.</p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/waitlist" className="hover:text-white transition-colors">Waitlist</Link>
            <Link to="/explore" className="hover:text-white transition-colors">Summits</Link>
            {user ? (
              <Link to={getUserDashboardPath()} className="text-[#C28E27] hover:text-white font-bold transition-colors">
                My Dashboard ({user.name?.split(' ')[0]})
              </Link>
            ) : (
              <Link to="/login" className="hover:text-white transition-colors">Authentication</Link>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
