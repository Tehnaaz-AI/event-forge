import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  CalendarDays, Users, LayoutDashboard, Settings, LogOut, 
  MessageSquare, Ticket, ShieldCheck, Compass, Sparkles, 
  ChevronDown, RefreshCw, UserCheck, Plus, Bell, Shield, 
  Mic, Award, ArrowRight 
} from 'lucide-react';
import AppNavbar from '../components/common/AppNavbar';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('eventforge_user') || 'null');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Dynamic Header Title & Breadcrumb mapping based on location.pathname
  const getHeaderContext = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/organizer/events/new')) return { title: 'Create New Conference', section: 'Event Management' };
    if (path.includes('/dashboard/organizer/events/')) return { title: 'Conference Workspace & Sessions', section: 'Event Management' };
    if (path.includes('/dashboard/organizer/events')) return { title: 'All Managed Conferences', section: 'Event Management' };
    if (path.includes('/dashboard/organizer/speakers')) return { title: 'Speaker Directory & Rosters', section: 'Talent & Keynotes' };
    if (path.includes('/dashboard/organizer/feedback')) return { title: 'Attendee Feedback & Reviews', section: 'Analytics' };
    if (path.includes('/dashboard/organizer/settings')) return { title: 'Organization Settings', section: 'Administration' };
    if (path.includes('/dashboard/organizer')) return { title: 'Executive Portfolio Overview', section: 'Dashboard' };
    if (path.includes('/dashboard/attendee')) return { title: 'My Passes & Digital Badges', section: 'Attendee Hub' };
    if (path.includes('/dashboard/staff')) return { title: 'Door Entrance QR Scanner', section: 'Live Operations' };
    return { title: 'Dashboard Workspace', section: 'Workspace' };
  };

  const headerContext = getHeaderContext();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-[#B45309] selection:text-white">
      
      {/* Curved Floating Navbar with Role-Differentiated Links */}
      <AppNavbar />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        
        {/* Sub-Header Context Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE8DA] pb-4">
          <div>
            <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider block">
              {headerContext.section}
            </span>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {headerContext.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {['ORGANIZER', 'PLATFORM_ADMIN'].includes(user.role) && (
              <Link
                to="/dashboard/organizer/events/new"
                className="inline-flex items-center gap-1.5 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all"
              >
                <Plus size={14} /> New Event
              </Link>
            )}

            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 bg-white border border-[#EFE8DA] hover:bg-stone-50 text-stone-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-xs"
            >
              <Compass size={14} /> Explore Conferences
            </Link>
          </div>
        </div>

        {/* Dynamic Nested Route Content */}
        <Outlet />
      </main>

    </div>
  );
}
