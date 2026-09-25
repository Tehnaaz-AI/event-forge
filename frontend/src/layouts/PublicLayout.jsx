import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import AppNavbar from '../components/common/AppNavbar';
import CookieConsent from '../components/common/CookieConsent';
import useSiteAnalytics from '../components/common/useSiteAnalytics';
import ScrollProgressBar from '../components/common/ScrollProgressBar';
import FloatingJourneyDock from '../components/common/FloatingJourneyDock';
import AppFooter from '../components/common/AppFooter';
import AmbientLiveBackground from '../components/common/AmbientLiveBackground';
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
    <div className="min-h-screen bg-transparent text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-[#B45309] selection:text-white relative transition-colors duration-300">
      
      {/* Live Moving Ambient Dynamic Background */}
      <AmbientLiveBackground />

      {/* Scroll Physics Progress Bar */}
      <ScrollProgressBar />

      {/* Floating Curved Navbar */}
      <AppNavbar />

      {/* Main Page Canvas */}
      <main className="flex-1 w-full relative z-10">
        <Outlet />
      </main>

      {/* Interactive Floating Dock */}
      <FloatingJourneyDock />

      {/* Cookie Consent Banner */}
      <CookieConsent />

      {/* Unified Enterprise Luxury Footer */}
      <AppFooter />

    </div>
  );
}
