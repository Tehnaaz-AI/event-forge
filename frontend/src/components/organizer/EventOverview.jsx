import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, Ticket, Users, TrendingUp, BarChart3, PieChart as PieChartIcon, 
  CheckCircle2, Clock, Award, ShieldCheck, ArrowUpRight,
  ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend 
} from 'recharts';
import { api } from '../../services/api';

const LUXURY_COLORS = ['#B45309', '#C28E27', '#854D0E', '#D97706', '#78716C'];

export default function EventOverview({ eventId }) {
  const [chartZoom, setChartZoom] = useState(1);
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
                <TrendingUp size={20} className="text-[#B45309]" /> Registration &amp; Sales Velocity
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Real-time pace of attendee registrations and cumulative pass volume</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live DB Telemetry
              </span>

              {/* Zoom Controls */}
              <div className="inline-flex items-center gap-1 bg-[#FAF8F5] dark:bg-stone-900 border border-[#EFE8DA] dark:border-stone-800 p-1 rounded-xl shadow-xs">
                <button
                  type="button"
                  title="Zoom Out"
                  disabled={chartZoom <= 0.8}
                  onClick={() => setChartZoom(prev => Math.max(0.75, Number((prev - 0.25).toFixed(2))))}
                  className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 disabled:opacity-40 transition-colors"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-[11px] font-mono font-bold text-stone-700 dark:text-stone-300 px-1.5 min-w-[42px] text-center">
                  {Math.round(chartZoom * 100)}%
                </span>
                <button
                  type="button"
                  title="Zoom In"
                  disabled={chartZoom >= 2.5}
                  onClick={() => setChartZoom(prev => Math.min(2.5, Number((prev + 0.25).toFixed(2))))}
                  className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 disabled:opacity-40 transition-colors"
                >
                  <ZoomIn size={14} />
                </button>
                {chartZoom !== 1 && (
                  <button
                    type="button"
                    title="Reset Zoom"
                    onClick={() => setChartZoom(1)}
                    className="p-1 rounded-lg hover:bg-[#B45309]/10 text-[#B45309] transition-colors ml-0.5"
                  >
                    <RotateCcw size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto overflow-y-auto max-h-[380px] sm:max-h-[440px] pt-2 pb-3 rounded-2xl border border-[#EFE8DA]/60 dark:border-stone-800/60 bg-[#FAF8F5]/50 dark:bg-[#141210] scrollbar-custom">
            <div 
              style={{ 
                minWidth: `${Math.round(1100 * chartZoom)}px`, 
                height: `${Math.round(460 * chartZoom)}px`,
                transition: 'min-width 0.2s ease, height 0.2s ease'
              }} 
              className="px-3"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 15, right: 30, left: 0, bottom: 25 }}>
                  <defs>
                    <linearGradient id="colorBeigeReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B45309" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#B45309" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorGoldRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E2A24" strokeOpacity={0.12} vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#78716C" 
                    fontSize={11} 
                    fontWeight={700} 
                    tickLine={true} 
                    tickMargin={10}
                    height={40}
                    dy={6}
                    axisLine={{ stroke: '#2E2A24', strokeOpacity: 0.15 }}
                    interval={0}
                  />
                  <YAxis 
                    yAxisId="regAxis"
                    stroke="#B45309" 
                    fontSize={11} 
                    fontWeight={700} 
                    tickLine={false} 
                    tickMargin={6}
                    axisLine={false}
                    allowDecimals={false}
                    width={40}
                  />
                  <YAxis 
                    yAxisId="revAxis"
                    orientation="right"
                    stroke="#10B981" 
                    fontSize={11} 
                    fontWeight={700} 
                    tickLine={false} 
                    tickMargin={6}
                    axisLine={false}
                    allowDecimals={false}
                    width={50}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#1C1917] text-[#FDFAF5] p-3.5 rounded-2xl shadow-xl border border-stone-800 space-y-1.5 text-xs font-sans min-w-[170px]">
                            <p className="font-extrabold text-[#F59E0B] text-xs border-b border-stone-800 pb-1">{label || d.day}</p>
                            <div className="space-y-1 text-stone-300 font-mono text-[11px]">
                              <p className="flex justify-between"><span>Registrations:</span> <strong className="text-amber-400 font-bold">{d.registrations || 0} passes</strong></p>
                              <p className="flex justify-between"><span>Day Revenue:</span> <strong className="text-emerald-400 font-bold">${(d.revenue || 0).toLocaleString()}</strong></p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    yAxisId="regAxis"
                    type="monotone" 
                    dataKey="registrations" 
                    stroke="#B45309" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorBeigeReg)" 
                    name="Daily Registrations" 
                  />
                  <Area 
                    yAxisId="revAxis"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorGoldRevenue)" 
                    name="Revenue ($)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Ticket Tier Distribution Donut */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#EFE8DA] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
                <PieChartIcon size={20} className="text-[#B45309]" /> Tier Share
              </h3>
              <span className="text-[10px] font-bold text-stone-400 font-mono">
                {categoryData.reduce((acc, c) => acc + c.value, 0)} Total
              </span>
            </div>
            <p className="text-xs text-stone-500">Breakdown of confirmed passes across pricing tiers</p>

            {categoryData.length > 0 && categoryData.some(c => c.value > 0) ? (
              <>
                <div className="h-48 w-full relative flex items-center justify-center my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={LUXURY_COLORS[index % LUXURY_COLORS.length]} 
                            stroke="#FFFFFF"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#1C1917] text-[#FDFAF5] p-2.5 rounded-xl shadow-lg border border-stone-800 text-xs">
                                <p className="font-bold text-[#C28E27]">{data.name}</p>
                                <p className="text-stone-300">{data.value} delegates (${(data.revenue || 0).toLocaleString()})</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#EFE8DA]">
                  {categoryData.map((cat, idx) => {
                    const totalTierSold = categoryData.reduce((acc, c) => acc + c.value, 0) || 1;
                    const pct = Math.round((cat.value / totalTierSold) * 100);
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: LUXURY_COLORS[idx % LUXURY_COLORS.length] }}></div>
                          <span className="font-medium text-stone-700 truncate max-w-[130px]">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900">{cat.value}</span>
                          <span className="text-[10px] text-stone-400 font-bold bg-[#FAF8F5] px-1.5 py-0.5 rounded-md border border-[#EFE8DA]">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#EFE8DA] my-3">
                <PieChartIcon size={32} className="text-stone-300 mb-2" />
                <p className="text-xs font-bold text-stone-700">No Pass Allocations Yet</p>
                <p className="text-[10px] text-stone-500 max-w-[180px]">
                  Passes booked by attendees will dynamically populate tier share.
                </p>
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
          {stats?.rooms && stats.rooms.length > 0 ? (
            stats.rooms.map((room, idx) => {
              const occRate = room.occupancyRate || 0;
              const barColor = occRate >= 90 ? 'bg-rose-600' : occRate >= 70 ? 'bg-[#B45309]' : 'bg-emerald-600';
              const badgeBg = occRate >= 90 ? 'bg-rose-100 text-rose-800' : occRate >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';

              return (
                <div key={room.id || idx} className="p-5 rounded-2xl border border-[#EFE8DA] bg-[#FAF8F5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#B45309] bg-[#B45309]/10 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                      {room.track || `Track ${idx + 1}`}
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-700">
                      {room.occupancy || 0} / {room.capacity || 100} Seats
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-stone-900 truncate">{room.name}</h4>
                    {room.activeSession && (
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">{room.activeSession}</p>
                    )}
                  </div>
                  
                  {/* Occupancy bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-stone-500 font-medium">
                      <span>Occupancy</span>
                      <span className="font-bold text-stone-900">{occRate}%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`${barColor} h-2 rounded-full transition-all duration-500`} 
                        style={{ width: `${Math.min(100, occRate)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EFE8DA] text-[10px] text-stone-500">
                    <span>Status: <strong className={`px-1.5 py-0.5 rounded-sm font-semibold ${badgeBg}`}>{room.status || 'Active'}</strong></span>
                    <span>AV Feed: <strong className="text-stone-700">{room.avStatus || '4K Stream'}</strong></span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 p-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#EFE8DA]">
              <p className="text-xs font-bold text-stone-600">No rooms or stages configured for this event yet.</p>
            </div>
          )}
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
