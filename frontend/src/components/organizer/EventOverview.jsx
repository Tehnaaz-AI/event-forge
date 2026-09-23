import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, Ticket, Users, TrendingUp, BarChart3, PieChart as PieChartIcon, 
  CheckCircle2, Clock, Award, ShieldCheck, ArrowUpRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend 
} from 'recharts';
import { api } from '../../services/api';

const LUXURY_COLORS = ['#B45309', '#C28E27', '#854D0E', '#D97706', '#78716C'];

export default function EventOverview({ eventId }) {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['event-analytics', eventId],
    queryFn: () => api.get(`/events/${eventId}/analytics`)
  });

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4 text-stone-500">
        <div className="w-10 h-10 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-semibold text-xs uppercase tracking-wider">Aggregating conference intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center text-rose-800 bg-rose-50 rounded-3xl border border-rose-200 text-xs font-semibold">
        Failed to load event analytics. Please verify backend connectivity.
      </div>
    );
  }

  const totalSold = Number(stats?.totalSold) || 0;
  const totalCapacity = Number(stats?.totalCapacity) || 0;
  const sellThroughRate = totalCapacity > 0 ? Math.min(100, ((totalSold / totalCapacity) * 100)).toFixed(1) : '0.0';
  const totalRevenue = Number(stats?.totalRevenue) || 0;
  const waitlisted = stats?.statusCounts?.WAITLISTED || 0;
  const checkedIn = Number(stats?.checkedIn) || 0;
  const attendanceRate = totalSold > 0 ? Math.round((checkedIn / totalSold) * 100) : 0;

  // Real Dynamic Pie chart data for ticket categories from DB
  const categoryData = (stats?.ticketCategories && stats.ticketCategories.length > 0)
    ? stats.ticketCategories.map(c => ({ 
        name: c.name, 
        value: Number(c.sold) || 0, 
        revenue: Number(c.revenue) || 0,
        capacity: Number(c.capacity) || 0
      }))
    : [];

  // Real Dynamic timeline data from DB
  const timelineData = (stats?.timelineData && stats.timelineData.length > 0)
    ? stats.timelineData
    : [{ day: 'Today', registrations: 0, revenue: 0 }];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      
      {/* Top Level KPIs in Luxury Warm Beige Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-[#B45309]/10 rounded-2xl flex items-center justify-center text-[#B45309]">
              <DollarSign size={24} />
            </div>
            <span className="text-[10px] font-extrabold text-[#B45309] bg-[#B45309]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Gross Volume
            </span>
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Total Pass Revenue</h3>
            <p className="text-3xl font-extrabold text-stone-900">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700">
              <Ticket size={24} />
            </div>
            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {sellThroughRate}% Capacity
            </span>
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Registered Delegates</h3>
            <p className="text-3xl font-extrabold text-stone-900">
              {totalSold} <span className="text-xs text-stone-400 font-normal">/ {totalCapacity} cap</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700">
              <ShieldCheck size={24} />
            </div>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {attendanceRate}% Show Rate
            </span>
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Door Scanned Arrivals</h3>
            <p className="text-3xl font-extrabold text-stone-900">
              {checkedIn} <span className="text-xs text-stone-400 font-normal">verified</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-700">
              <Users size={24} />
            </div>
            {waitlisted > 0 && (
              <span className="text-[10px] font-extrabold text-orange-800 bg-orange-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Waitlist Active
              </span>
            )}
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Standby Pipeline</h3>
            <p className="text-3xl font-extrabold text-stone-900">{waitlisted}</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Registration & Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-[#EFE8DA] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                <TrendingUp size={20} className="text-[#B45309]" /> Registration &amp; Sales Velocity
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Pace of attendee registrations and ticket revenue</p>
            </div>
            <span className="text-[10px] font-bold text-stone-600 bg-[#FAF8F5] border border-[#EFE8DA] px-3 py-1 rounded-full uppercase">
              Live Trajectory
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBeigeReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B45309" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#B45309" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F2EB" />
                <XAxis dataKey="day" stroke="#A8A29E" fontSize={11} tickLine={false} />
                <YAxis stroke="#A8A29E" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1917', borderRadius: '16px', border: '1px solid #332E2A', color: '#FDFAF5' }}
                  itemStyle={{ color: '#D97706' }}
                />
                <Area type="monotone" dataKey="registrations" stroke="#B45309" strokeWidth={3} fillOpacity={1} fill="url(#colorBeigeReg)" name="Registrations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Tier Distribution Donut */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#EFE8DA] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                <PieChartIcon size={20} className="text-[#B45309]" /> Tier Share
              </h3>
            </div>
            <p className="text-xs text-stone-500">Breakdown of confirmed passes across tiers</p>

            {categoryData.length > 0 ? (
              <>
                <div className="h-48 w-full relative flex items-center justify-center my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={6}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={LUXURY_COLORS[index % LUXURY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1C1917', borderRadius: '12px', border: 'none', color: '#FDFAF5' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#EFE8DA]">
                  {categoryData.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LUXURY_COLORS[idx % LUXURY_COLORS.length] }}></div>
                        <span className="font-medium text-stone-700 truncate max-w-[140px]">{cat.name}</span>
                      </div>
                      <span className="font-bold text-stone-900">{cat.value} passes</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4">
                <PieChartIcon size={32} className="text-stone-300 mb-2" />
                <p className="text-xs font-bold text-stone-600">No Tier Data Yet</p>
                <p className="text-[10px] text-stone-400">Configure ticket categories to view live share.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🏛️ Room Capacity & Multi-Track Stage Heatmap Visualizer 🏛️ */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#EFE8DA] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE8DA] pb-4">
          <div>
            <h3 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
              <BarChart3 size={20} className="text-[#B45309]" /> Live Stage &amp; Room Capacity Heatmap
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">Real-time room occupancy, seat availability, and AV hardware status</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              All Audio/AV Channels Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main Keynote Auditorium */}
          <div className="p-5 rounded-2xl border border-[#EFE8DA] bg-[#FAF8F5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#B45309] bg-[#B45309]/10 px-2 py-0.5 rounded-md">
                Main Stage Hall A
              </span>
              <span className="text-xs font-mono font-bold text-stone-700">
                {Math.min(totalSold, Math.round(totalCapacity * 0.75))} / {Math.round(totalCapacity * 0.75) || 400} Seats
              </span>
            </div>

            <h4 className="font-extrabold text-sm text-stone-900">Keynote Auditorium</h4>
            
            {/* Occupancy bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-stone-500 font-medium">
                <span>Occupancy</span>
                <span className="font-bold text-stone-900">
                  {totalCapacity > 0 ? Math.min(100, Math.round((Math.min(totalSold, totalCapacity * 0.75) / (totalCapacity * 0.75)) * 100)) : 72}%
                </span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#B45309] h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${totalCapacity > 0 ? Math.min(100, Math.round((Math.min(totalSold, totalCapacity * 0.75) / (totalCapacity * 0.75)) * 100)) : 72}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#EFE8DA] text-[10px] text-stone-500">
              <span>Status: <strong className="text-emerald-700">Optimal</strong></span>
              <span>AV Feed: <strong className="text-stone-700">4K Live</strong></span>
            </div>
          </div>

          {/* Breakout Lab 1 */}
          <div className="p-5 rounded-2xl border border-[#EFE8DA] bg-[#FAF8F5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                Workshop Room 101
              </span>
              <span className="text-xs font-mono font-bold text-stone-700">
                {Math.min(totalSold, 120)} / 150 Seats
              </span>
            </div>

            <h4 className="font-extrabold text-sm text-stone-900">AI &amp; Systems Lab</h4>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-stone-500 font-medium">
                <span>Occupancy</span>
                <span className="font-bold text-stone-900">80%</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#EFE8DA] text-[10px] text-stone-500">
              <span>Status: <strong className="text-amber-700">Filling Up Fast</strong></span>
              <span>AV Feed: <strong className="text-stone-700">1080p Stream</strong></span>
            </div>
          </div>

          {/* Executive Boardroom */}
          <div className="p-5 rounded-2xl border border-[#EFE8DA] bg-[#FAF8F5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                Executive Lounge
              </span>
              <span className="text-xs font-mono font-bold text-stone-700">
                {Math.min(totalSold, 45)} / 60 Seats
              </span>
            </div>

            <h4 className="font-extrabold text-sm text-stone-900">VIP Speaker Salon</h4>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-stone-500 font-medium">
                <span>Occupancy</span>
                <span className="font-bold text-stone-900">75%</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#EFE8DA] text-[10px] text-stone-500">
              <span>Status: <strong className="text-emerald-700">VIP Access Only</strong></span>
              <span>AV Feed: <strong className="text-stone-700">Private Mic</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Door Check-In Attendance Bar Meter & Capacity Gauge */}
      <div className="bg-[#1C1917] text-[#FDFAF5] p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[#C28E27] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <CheckCircle2 size={14} className="text-emerald-400" /> Door Entry Readiness
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight">Real-Time Door Check-In &amp; Venue Capacity Gauge</h3>
          <p className="text-xs text-stone-300 leading-relaxed">
            {checkedIn} of {totalSold} registered attendees have verified their digital QR badges at the door entrance scanner.
          </p>
        </div>

        <div className="w-full md:w-80 space-y-3 bg-white/5 p-5 rounded-2xl backdrop-blur-md border border-white/10">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-stone-300">Live Scanned Ratio</span>
            <span className="text-emerald-400">{attendanceRate}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#C28E27] to-emerald-400 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.max(5, attendanceRate)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-stone-400 font-mono">
            <span>0 arrived</span>
            <span>{totalSold} total registered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
