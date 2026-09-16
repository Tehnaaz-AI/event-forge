import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  CalendarDays, DollarSign, Users, TrendingUp, Plus, ArrowRight, 
  Sparkles, MessageSquare, Settings as SettingsIcon, ShieldCheck, 
  Layers, BarChart2, CheckCircle2, Mic 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../../services/api';

export default function OrganizerOverview() {
  const user = JSON.parse(localStorage.getItem('eventforge_user') || '{}');

  const { data: events, isLoading } = useQuery({
    queryKey: ['organizer-events-overview'],
    queryFn: () => api.get('/events/organizer/me')
  });

  const totalEvents = events?.length || 0;
  const activeEvents = events?.filter(e => ['PUBLISHED', 'REGISTRATION_OPEN', 'LIVE'].includes(e.status))?.length || 0;
  const totalCapacity = events?.reduce((acc, e) => acc + (e.capacity || 0), 0) || 0;

  // Aggregate event stats for the chart
  const portfolioChartData = events?.map(e => ({
    name: e.title.length > 20 ? `${e.title.slice(0, 20)}...` : e.title,
    capacity: e.capacity || 100,
    status: e.status
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans">
      
      {/* Welcome Banner in Luxury Beige / Espresso */}
      <div className="bg-[#1C1917] rounded-3xl p-8 text-[#FDFAF5] relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute right-0 top-0 w-96 h-full bg-[#B45309]/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="px-3 py-1 bg-white/10 text-[#C28E27] rounded-full text-xs font-bold uppercase tracking-wider inline-block backdrop-blur-md border border-white/10">
            {user.organization?.name || 'Executive Event Suite'}
          </span>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, {user.name} 👋
          </h1>
          
          <p className="text-stone-300 text-xs md:text-sm leading-relaxed max-w-2xl">
            Monitor real-time attendee velocity, conflict-free multi-track agendas, sponsor deliverables, and door operations across your conference portfolio.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link 
              to="/dashboard/organizer/events/new"
              className="bg-[#B45309] hover:bg-[#92400E] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-[#B45309]/30 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Create Conference
            </Link>
            <Link 
              to="/dashboard/organizer/speakers"
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-xs border border-white/10 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Mic size={16} /> Keynote Speakers
            </Link>
            <Link 
              to="/dashboard/staff"
              className="bg-white/10 hover:bg-white/20 text-[#C28E27] px-5 py-2.5 rounded-xl font-bold text-xs border border-white/10 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <ShieldCheck size={16} /> Door QR Scanner Mode
            </Link>
          </div>
        </div>
      </div>

      {/* High Level KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center font-bold">
              <CalendarDays size={24} />
            </div>
            <span className="text-[10px] font-extrabold bg-[#B45309]/10 text-[#B45309] px-2.5 py-1 rounded-full uppercase tracking-wider">
              {activeEvents} Active
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Total Summits Managed</p>
            <p className="text-3xl font-extrabold text-stone-900">{totalEvents}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Users size={24} />
            </div>
            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Multi-Track
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Total Capacity Target</p>
            <p className="text-3xl font-extrabold text-stone-900">{totalCapacity.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign size={24} />
            </div>
            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Protected
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Conflict-Free Engine</p>
            <p className="text-2xl font-extrabold text-stone-900">Zero Collision</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold">
              <Sparkles size={24} className="text-[#C28E27]" />
            </div>
            <span className="text-[10px] font-extrabold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
              AI Engine
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Content Synthesis</p>
            <p className="text-2xl font-extrabold text-stone-900">Active</p>
          </div>
        </div>
      </div>

      {/* Portfolio Capacity Bar Chart */}
      {portfolioChartData.length > 0 && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#EFE8DA] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                <BarChart2 size={20} className="text-[#B45309]" /> Portfolio Conference Capacity Scale
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Attendee capacity allocated per active event</p>
            </div>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portfolioChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F2EB" />
                <XAxis dataKey="name" stroke="#A8A29E" fontSize={11} tickLine={false} />
                <YAxis stroke="#A8A29E" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1917', borderRadius: '14px', border: '1px solid #332E2A', color: '#FDFAF5' }}
                />
                <Bar dataKey="capacity" fill="#B45309" radius={[8, 8, 0, 0]} name="Max Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/dashboard/organizer/events" 
          className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-sm hover:border-[#B45309] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-stone-900 text-sm group-hover:text-[#B45309] transition-colors">Conferences</h3>
            <p className="text-[11px] text-stone-500 mt-1">Multi-track scheduling &amp; agendas</p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#EFE8DA]">
            <span className="text-[10px] font-bold text-[#B45309]">Open Manager</span>
            <ArrowRight size={14} className="text-stone-300 group-hover:text-[#B45309] group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {events && events.length > 0 ? (
          <Link 
            to={`/dashboard/organizer/events/${events[0]._id}?tab=staff`}
            className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-sm hover:border-[#B45309] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-stone-900 text-sm group-hover:text-[#B45309] transition-colors">Door Staff &amp; Crew</h3>
              <p className="text-[11px] text-stone-500 mt-1">Add check-in staff &amp; scanners</p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#EFE8DA]">
              <span className="text-[10px] font-bold text-[#B45309]">Authorize Staff</span>
              <Users size={14} className="text-stone-300 group-hover:text-[#B45309] transition-all" />
            </div>
          </Link>
        ) : (
          <Link 
            to="/dashboard/staff"
            className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-sm hover:border-[#B45309] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-stone-900 text-sm group-hover:text-[#B45309] transition-colors">Door QR Scanner</h3>
              <p className="text-[11px] text-stone-500 mt-1">Live camera optical verification</p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#EFE8DA]">
              <span className="text-[10px] font-bold text-[#B45309]">Open Scanner</span>
              <ShieldCheck size={14} className="text-stone-300 group-hover:text-[#B45309] transition-all" />
            </div>
          </Link>
        )}

        <Link 
          to="/dashboard/organizer/feedback" 
          className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-sm hover:border-[#B45309] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-stone-900 text-sm group-hover:text-[#B45309] transition-colors">Attendee Reviews</h3>
            <p className="text-[11px] text-stone-500 mt-1">Star ratings &amp; attendee feedback</p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#EFE8DA]">
            <span className="text-[10px] font-bold text-[#B45309]">View Reviews</span>
            <MessageSquare size={14} className="text-stone-300 group-hover:text-[#B45309] transition-all" />
          </div>
        </Link>

        <Link 
          to="/dashboard/organizer/settings" 
          className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-sm hover:border-[#B45309] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-stone-900 text-sm group-hover:text-[#B45309] transition-colors">Org Settings</h3>
            <p className="text-[11px] text-stone-500 mt-1">Company profile &amp; policies</p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#EFE8DA]">
            <span className="text-[10px] font-bold text-[#B45309]">Configure</span>
            <SettingsIcon size={14} className="text-stone-300 group-hover:text-[#B45309] transition-all" />
          </div>
        </Link>
      </div>

      {/* Active Events Overview Table */}
      <div className="bg-white rounded-3xl border border-[#EFE8DA] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#EFE8DA] flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-stone-900">Recent Conferences</h3>
            <p className="text-xs text-stone-500 mt-0.5">Active conferences in your organization</p>
          </div>
          <Link to="/dashboard/organizer/events" className="text-xs font-bold text-[#B45309] hover:underline">
            View All Conferences &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-stone-500 text-center text-xs">Loading conferences...</div>
        ) : (
          <div className="divide-y divide-[#EFE8DA]">
            {events?.slice(0, 5).map(event => (
              <div key={event._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#1C1917] text-[#FDFAF5] flex items-center justify-center font-bold text-base uppercase shrink-0">
                    {event.category?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-base">{event.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                      <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                      <span>📍 {event.venue?.name || 'TBD'}</span>
                      <span>👥 {event.capacity} Capacity</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    event.status === 'LIVE' ? 'bg-emerald-100 text-emerald-800' :
                    event.status === 'REGISTRATION_OPEN' ? 'bg-[#B45309]/10 text-[#B45309]' :
                    'bg-stone-100 text-stone-700'
                  }`}>
                    {event.status.replace('_', ' ')}
                  </span>
                  <Link 
                    to={`/dashboard/organizer/events/${event._id}`}
                    className="px-4 py-2 bg-[#1C1917] hover:bg-[#B45309] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Manage Workspace
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
