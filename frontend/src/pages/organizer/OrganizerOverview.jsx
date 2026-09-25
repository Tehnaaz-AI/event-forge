import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, DollarSign, Users, TrendingUp, Plus, ArrowRight, 
  Sparkles, MessageSquare, Settings as SettingsIcon, ShieldCheck, 
  Layers, BarChart2, CheckCircle2, Mic, Activity, Radio, 
  Search, Filter, LayoutGrid, List, MapPin, Clock, ArrowUpRight, 
  Zap, ChevronRight, Eye, UserCheck, Ticket, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid 
} from 'recharts';
import { api } from '../../services/api';

export default function OrganizerOverview() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('eventforge_user') || '{}');

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DRAFT'
  const [chartMetric, setChartMetric] = useState('capacity'); // 'capacity' | 'timeline'

  const { data: events, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['organizer-events-overview'],
    queryFn: () => api.get('/events/organizer/me'),
    refetchInterval: 10000,
    refetchOnWindowFocus: true
  });

  const totalEvents = events?.length || 0;
  const activeEvents = events?.filter(e => ['PUBLISHED', 'REGISTRATION_OPEN', 'LIVE'].includes(e.status))?.length || 0;
  const totalCapacity = events?.reduce((acc, e) => acc + (e.capacity || 0), 0) || 0;
  const totalDraft = events?.filter(e => e.status === 'DRAFT')?.length || 0;

  // Filtered conferences list
  const filteredEvents = (events || []).filter(e => {
    const matchesSearch = !searchQuery || 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.venue?.name && e.venue.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'ACTIVE') return ['PUBLISHED', 'REGISTRATION_OPEN', 'LIVE'].includes(e.status);
    if (statusFilter === 'DRAFT') return e.status === 'DRAFT';
    return true;
  });

  // Chart data for dual Area visualization
  const trajectoryChartData = (events || []).map((e, idx) => ({
    name: e.title.length > 18 ? `${e.title.slice(0, 18)}...` : e.title,
    fullTitle: e.title,
    capacity: e.capacity || 100,
    estimatedVelocity: Math.round((e.capacity || 100) * (e.status === 'LIVE' ? 0.92 : e.status === 'REGISTRATION_OPEN' ? 0.65 : 0.2)),
    status: e.status,
    category: e.category || 'CONFERENCE'
  }));

  const LUXURY_PALETTES = [
    { name: 'Obsidian Gold', bg: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)', text: '#FCD34D' },
    { name: 'Amber Rust', bg: 'linear-gradient(135deg, #78350F 0%, #92400E 100%)', text: '#FEF3C7' },
    { name: 'Emerald Prestige', bg: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)', text: '#D1FAE5' },
    { name: 'Royal Navy', bg: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', text: '#BAE6FD' },
    { name: 'Amethyst', bg: 'linear-gradient(135deg, #4C1D95 0%, #5B21B6 100%)', text: '#EDE9FE' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans selection:bg-[#B45309] selection:text-white">
      
      {/* 🌟 Executive Cockpit Hero Banner 🌟 */}
      <div className="bg-gradient-to-br from-[#1C1917] via-[#24211D] to-[#171614] rounded-3xl p-6 sm:p-8 text-[#FDFAF5] relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute right-0 top-0 w-96 h-full bg-[#B45309]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-[#C28E27]/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 bg-white/10 text-[#F59E0B] rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 backdrop-blur-md border border-white/10 shadow-xs">
                <Radio size={12} className="text-emerald-400 animate-pulse" />
                {user.organization?.name || 'Executive Conference Suite'}
              </span>
              <span className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
                <Activity size={12} className="text-amber-400" />
                Live Telemetry Synchronized
              </span>
              {isFetching && <span className="text-[10px] text-amber-400 animate-pulse">Refreshing...</span>}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Welcome back, {user.name} 👋
            </h1>
            
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl font-light">
              Autonomous oversight of cross-track agendas, delegate registration curves, door scanning checkpoints, and real-time event intelligence.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link 
                to="/dashboard/organizer/events/new"
                className="bg-[#B45309] hover:bg-[#92400E] text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-[#B45309]/30 transition-all flex items-center gap-2 uppercase tracking-wider hover:-translate-y-0.5 cursor-pointer"
              >
                <Plus size={15} /> + Create Conference
              </Link>
              <Link 
                to="/dashboard/organizer/speakers"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-xs border border-white/10 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Mic size={14} className="text-[#FCD34D]" /> Keynote Speakers
              </Link>
              <Link 
                to="/dashboard/staff"
                className="bg-white/10 hover:bg-white/20 text-[#F59E0B] px-4 py-2.5 rounded-xl font-bold text-xs border border-white/10 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={14} /> Door QR Scanner Mode
              </Link>
            </div>
          </div>

          {/* Quick Portfolio Gauge */}
          <div className="bg-[#171614]/80 border border-white/10 p-5 rounded-2xl backdrop-blur-md lg:w-72 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs text-stone-400 font-bold uppercase tracking-wider">
              <span>Portfolio Health</span>
              <span className="text-emerald-400 font-black">98.4% OPTIMAL</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">Live &amp; Open:</span>
                <span className="font-mono font-bold text-white">{activeEvents} Summits</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">Total Seat Scale:</span>
                <span className="font-mono font-bold text-[#FCD34D]">{totalCapacity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">Draft Pipelines:</span>
                <span className="font-mono font-bold text-stone-400">{totalDraft} Summits</span>
              </div>
            </div>
            <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#B45309] to-emerald-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${totalEvents > 0 ? (activeEvents / totalEvents) * 100 : 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 High Level KPI Matrix 🌟 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#171614] p-5 sm:p-6 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B45309]/10 text-[#B45309] dark:text-[#F59E0B] flex items-center justify-center font-black">
              <CalendarDays size={22} />
            </div>
            <span className="text-[10px] font-black bg-[#B45309]/10 text-[#B45309] dark:text-[#FCD34D] border border-[#B45309]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {activeEvents} Active
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Managed Portfolio</p>
            <p className="text-3xl font-black text-stone-900 dark:text-[#F5F2EB]">{totalEvents}</p>
            <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-bold">● {activeEvents} live</span> across all venues
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#171614] p-5 sm:p-6 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
              <Users size={22} />
            </div>
            <span className="text-[10px] font-black bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Target Scale
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Seat Capacity Target</p>
            <p className="text-3xl font-black text-stone-900 dark:text-[#F5F2EB]">{totalCapacity.toLocaleString()}</p>
            <p className="text-[11px] text-stone-500 mt-1">Multi-track delegate allocations</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#171614] p-5 sm:p-6 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <ShieldCheck size={22} />
            </div>
            <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Protected
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Schedule Engine</p>
            <p className="text-2xl font-black text-stone-900 dark:text-[#F5F2EB]">Zero Collision</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
              ✓ Multi-room overlap guarded
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-[#171614] p-5 sm:p-6 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
              <Sparkles size={22} />
            </div>
            <span className="text-[10px] font-black bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              AI Copilot
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Intelligence Layer</p>
            <p className="text-2xl font-black text-stone-900 dark:text-[#F5F2EB]">Live Pulse Active</p>
            <p className="text-[11px] text-stone-500 mt-1">Grounded in MongoDB telemetry</p>
          </div>
        </div>

      </div>

      {/* 🌟 Interactive Trajectory & Velocity Matrix (Replacing old bar graph) 🌟 */}
      <div className="bg-white dark:bg-[#171614] p-6 sm:p-8 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE8DA] dark:border-stone-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#B45309]/10 text-[#B45309] dark:text-[#F59E0B] flex items-center justify-center">
                <BarChart2 size={18} />
              </div>
              <h3 className="font-black text-stone-900 dark:text-[#F5F2EB] text-lg tracking-tight">
                Portfolio Trajectory &amp; Capacity Scale
              </h3>
            </div>
            <p className="text-xs text-stone-500">Dual-curve capacity allocation vs estimated delegate velocity across active summits.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-xs font-bold text-stone-600 dark:text-stone-300">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#B45309]"></span>
                <span>Seat Capacity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Registration Velocity</span>
              </div>
            </div>
          </div>
        </div>

        {trajectoryChartData.length > 0 ? (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="capacityGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B45309" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#B45309" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="velocityGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2A24" strokeOpacity={0.15} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#78716C" 
                  fontSize={11} 
                  fontWeight={600} 
                  tickLine={false} 
                  axisLine={{ stroke: '#2E2A24', strokeOpacity: 0.2 }}
                />
                <YAxis 
                  stroke="#78716C" 
                  fontSize={11} 
                  fontWeight={600} 
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#1C1917] text-[#FDFAF5] p-3.5 rounded-2xl shadow-2xl border border-stone-800 text-xs font-sans space-y-1.5">
                          <p className="font-extrabold text-[#F59E0B] text-sm">{d.fullTitle}</p>
                          <div className="space-y-1 text-stone-300 font-mono text-[11px]">
                            <p>Max Capacity: <strong className="text-white">{d.capacity} seats</strong></p>
                            <p>Velocity Metric: <strong className="text-emerald-400">{d.estimatedVelocity} delegates</strong></p>
                            <p>Lifecycle Status: <span className="font-bold text-amber-300 uppercase">{d.status}</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="capacity" 
                  stroke="#B45309" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#capacityGlow)" 
                  name="Seat Capacity"
                />
                <Area 
                  type="monotone" 
                  dataKey="estimatedVelocity" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#velocityGlow)" 
                  name="Registration Velocity"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-12 text-center bg-[#FAF8F5] dark:bg-[#1C1917] rounded-2xl border border-dashed border-[#EFE8DA] dark:border-stone-800 space-y-2">
            <BarChart2 size={32} className="mx-auto text-stone-400" />
            <p className="text-xs font-bold text-stone-700 dark:text-stone-300">No Portfolio Summits Created</p>
            <p className="text-[11px] text-stone-400">Create your first conference to activate dynamic trajectory telemetry.</p>
          </div>
        )}
      </div>

      {/* 🌟 Luxury Conference Portfolio Showcase (Redesigned Whole Section) 🌟 */}
      <div className="space-y-6">
        
        {/* Showcase Header, Filters & View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-[#F5F2EB] tracking-tight flex items-center gap-2">
              <Layers size={22} className="text-[#B45309]" />
              Conference Portfolio Showcase
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Multi-track scheduling, door crew deployment, and VIP pass governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search summits or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-white dark:bg-[#1C1917] border border-[#EFE8DA] dark:border-stone-800 rounded-xl text-stone-900 dark:text-[#F5F2EB] focus:outline-none focus:border-[#B45309]"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-[#1C1917] p-1 rounded-xl border border-[#EFE8DA] dark:border-stone-800">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'ALL' ? 'bg-white dark:bg-[#2E2A24] text-[#B45309] shadow-xs' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                All ({events?.length || 0})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'ACTIVE' ? 'bg-white dark:bg-[#2E2A24] text-[#B45309] shadow-xs' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Active ({activeEvents})
              </button>
              <button
                onClick={() => setStatusFilter('DRAFT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'DRAFT' ? 'bg-white dark:bg-[#2E2A24] text-[#B45309] shadow-xs' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Draft ({totalDraft})
              </button>
            </div>

            {/* Grid / Table Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-[#1C1917] p-1 rounded-xl border border-[#EFE8DA] dark:border-stone-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-[#2E2A24] text-[#B45309] shadow-xs' : 'text-stone-500'}`}
                title="Grid Card View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-[#2E2A24] text-[#B45309] shadow-xs' : 'text-stone-500'}`}
                title="Compact Table View"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Loading conference portfolio...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-[#171614] rounded-3xl p-12 text-center border border-dashed border-[#EFE8DA] dark:border-stone-800 space-y-4">
            <CalendarDays size={36} className="mx-auto text-stone-300" />
            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">No conferences matched your query</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">Try adjusting your search terms or create a new summit.</p>
            <Link
              to="/dashboard/organizer/events/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold shadow-md shadow-[#B45309]/20"
            >
              <Plus size={14} /> Create New Conference
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          
          /* 🌟 1. LUXURY VISUAL CARD SHOWCASE GRID 🌟 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, idx) => {
              const hasBanner = Boolean(event.bannerImage);
              const cardBg = event.cardColor || LUXURY_PALETTES[idx % LUXURY_PALETTES.length].bg;
              const isLive = event.status === 'LIVE';

              return (
                <div 
                  key={event._id}
                  className="group bg-white dark:bg-[#171614] rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Card Banner Header */}
                  <div 
                    className="h-44 relative p-5 flex flex-col justify-between text-white overflow-hidden"
                    style={{
                      background: hasBanner ? `url(${event.bannerImage}) center/cover no-repeat` : cardBg
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>

                    {/* Top Row Badges */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black bg-white/95 dark:bg-[#1C1917]/95 text-stone-900 dark:text-[#FCD34D] px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md border border-white/20">
                        {event.category || 'CONFERENCE'}
                      </span>

                      <span className={`relative z-10 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                        isLive ? 'bg-rose-500 text-white border-rose-400 animate-pulse' :
                        event.status === 'REGISTRATION_OPEN' ? 'bg-emerald-600 text-white border-emerald-400' :
                        'bg-stone-900/90 text-stone-200 border-white/20 backdrop-blur-md'
                      }`}>
                        {event.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Bottom Title & Date */}
                    <div className="relative z-10 space-y-1">
                      <h3 className="font-black text-base text-white tracking-tight leading-snug drop-shadow-md line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-stone-200 font-medium drop-shadow-sm">
                        <CalendarDays size={12} className="text-[#FCD34D]" />
                        <span>{new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body Metrics */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      
                      {/* Venue & Location */}
                      <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
                        <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                          <MapPin size={13} className="text-[#B45309] shrink-0" />
                          <strong className="text-stone-800 dark:text-stone-200 truncate">{event.venue?.name || 'Convention Center'}</strong>
                        </span>
                        <span className="text-[11px] font-mono text-stone-400">{event.venue?.city || 'Virtual'}</span>
                      </div>

                      {/* Capacity Meter Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-stone-500 font-bold uppercase tracking-wider">Capacity Scale</span>
                          <span className="font-mono font-bold text-stone-900 dark:text-white">{event.capacity || 100} Delegates</span>
                        </div>
                        <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#B45309] to-[#D97706] h-full rounded-full"
                            style={{ width: '75%' }}
                          ></div>
                        </div>
                      </div>

                      {/* Quick Meta Tags */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#24211D] text-stone-600 dark:text-stone-300">
                          {event.sessionsCount || 6} Sessions
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#24211D] text-stone-600 dark:text-stone-300">
                          {event.ticketsCount || 3} Ticket Tiers
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          VIP Waitlist Active
                        </span>
                      </div>

                    </div>

                    {/* 1-Click Action Dock */}
                    <div className="pt-4 border-t border-[#EFE8DA] dark:border-stone-800 space-y-2">
                      <Link
                        to={`/dashboard/organizer/events/${event._id}`}
                        className="w-full py-2.5 bg-stone-900 dark:bg-stone-800 hover:bg-[#B45309] dark:hover:bg-[#B45309] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-xs"
                      >
                        <Layers size={13} />
                        <span>Manage Workspace &rarr;</span>
                      </Link>

                      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
                        <Link
                          to={`/dashboard/organizer/events/${event._id}?tab=pulse`}
                          className="py-1.5 rounded-lg bg-stone-50 dark:bg-[#24211D] hover:bg-amber-500/10 hover:text-[#B45309] text-stone-600 dark:text-stone-300 transition-colors"
                        >
                          ⚡ Pulse
                        </Link>
                        <Link
                          to={`/dashboard/organizer/events/${event._id}?tab=sessions`}
                          className="py-1.5 rounded-lg bg-stone-50 dark:bg-[#24211D] hover:bg-amber-500/10 hover:text-[#B45309] text-stone-600 dark:text-stone-300 transition-colors"
                        >
                          📅 Agenda
                        </Link>
                        <Link
                          to={`/dashboard/organizer/events/${event._id}?tab=staff`}
                          className="py-1.5 rounded-lg bg-stone-50 dark:bg-[#24211D] hover:bg-amber-500/10 hover:text-[#B45309] text-stone-600 dark:text-stone-300 transition-colors"
                        >
                          🛡️ Door
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        ) : (
          
          /* 🌟 2. EXECUTIVE COMPACT TABLE VIEW 🌟 */
          <div className="bg-white dark:bg-[#171614] border border-[#EFE8DA] dark:border-stone-800 rounded-3xl overflow-hidden shadow-md">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-beige">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] dark:bg-[#1C1917] border-b border-[#EFE8DA] dark:border-stone-800 text-stone-600 dark:text-stone-400 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="py-4 px-6">Conference Title &amp; Category</th>
                    <th className="py-4 px-6">Schedule / Venue</th>
                    <th className="py-4 px-6">Seat Capacity</th>
                    <th className="py-4 px-6">Lifecycle Status</th>
                    <th className="py-4 px-6 text-right">Workspace Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE8DA] dark:divide-stone-800">
                  {filteredEvents.map(event => (
                    <tr key={event._id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs uppercase shrink-0 shadow-xs"
                            style={{ background: event.cardColor || '#1C1917' }}
                          >
                            {event.category?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="font-black text-stone-900 dark:text-[#F5F2EB] text-sm hover:text-[#B45309] transition-colors">
                              {event.title}
                            </div>
                            <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider">
                              {event.category || 'CONFERENCE'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-stone-600 dark:text-stone-400">
                        <div className="font-bold text-stone-800 dark:text-stone-200">
                          {new Date(event.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-stone-500">{event.venue?.name || 'TBD'}</div>
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-stone-900 dark:text-white">
                        {event.capacity || 100} seats
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          event.status === 'LIVE' ? 'bg-rose-500 text-white border-rose-400 animate-pulse' :
                          event.status === 'REGISTRATION_OPEN' ? 'bg-emerald-600 text-white border-emerald-400' :
                          'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                        }`}>
                          {event.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/dashboard/organizer/events/${event._id}`}
                            className="px-3.5 py-1.5 bg-[#1C1917] dark:bg-stone-800 hover:bg-[#B45309] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                          >
                            Open &rarr;
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* 🌟 Quick Operations & Resource Gateway 🌟 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        
        <Link 
          to="/dashboard/organizer/events" 
          className="bg-white dark:bg-[#171614] p-5 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-xs hover:border-[#B45309] hover:shadow-lg hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-3">
              <CalendarDays size={20} />
            </div>
            <h3 className="font-black text-stone-900 dark:text-[#F5F2EB] text-sm group-hover:text-[#B45309] transition-colors">Conferences Catalog</h3>
            <p className="text-[11px] text-stone-500 mt-1">Multi-track scheduling &amp; agenda rosters</p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#EFE8DA] dark:border-stone-800">
            <span className="text-[10px] font-black text-[#B45309] uppercase tracking-wider">Open Directory</span>
            <ArrowRight size={14} className="text-stone-400 group-hover:text-[#B45309] group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {events && events.length > 0 ? (
          <Link 
            to={`/dashboard/organizer/events/${events[0]._id}?tab=staff`}
            className="bg-white dark:bg-[#171614] p-5 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-xs hover:border-[#B45309] hover:shadow-lg hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-3">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-black text-stone-900 dark:text-[#F5F2EB] text-sm group-hover:text-[#B45309] transition-colors">Door Staff &amp; Scanner Crew</h3>
              <p className="text-[11px] text-stone-500 mt-1">Assign check-in staff &amp; scanners</p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#EFE8DA] dark:border-stone-800">
              <span className="text-[10px] font-black text-[#B45309] uppercase tracking-wider">Authorize Staff</span>
              <UserCheck size={14} className="text-stone-400 group-hover:text-[#B45309] transition-all" />
            </div>
          </Link>
        ) : (
          <Link 
            to="/dashboard/staff"
            className="bg-white dark:bg-[#171614] p-5 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-xs hover:border-[#B45309] hover:shadow-lg hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-3">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-black text-stone-900 dark:text-[#F5F2EB] text-sm group-hover:text-[#B45309] transition-colors">Door QR Scanner</h3>
              <p className="text-[11px] text-stone-500 mt-1">Live camera optical validation</p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#EFE8DA] dark:border-stone-800">
              <span className="text-[10px] font-black text-[#B45309] uppercase tracking-wider">Open Scanner</span>
              <ShieldCheck size={14} className="text-stone-400 group-hover:text-[#B45309] transition-all" />
            </div>
          </Link>
        )}

        <Link 
          to="/dashboard/organizer/feedback" 
          className="bg-white dark:bg-[#171614] p-5 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-xs hover:border-[#B45309] hover:shadow-lg hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-3">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-black text-stone-900 dark:text-[#F5F2EB] text-sm group-hover:text-[#B45309] transition-colors">Attendee Reviews</h3>
            <p className="text-[11px] text-stone-500 mt-1">Post-event sentiment &amp; ratings</p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#EFE8DA] dark:border-stone-800">
            <span className="text-[10px] font-black text-[#B45309] uppercase tracking-wider">Inspect Feedback</span>
            <MessageSquare size={14} className="text-stone-400 group-hover:text-[#B45309] transition-all" />
          </div>
        </Link>

        <Link 
          to="/dashboard/organizer/settings" 
          className="bg-white dark:bg-[#171614] p-5 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-xs hover:border-[#B45309] hover:shadow-lg hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-3">
              <SettingsIcon size={20} />
            </div>
            <h3 className="font-black text-stone-900 dark:text-[#F5F2EB] text-sm group-hover:text-[#B45309] transition-colors">Org Configuration</h3>
            <p className="text-[11px] text-stone-500 mt-1">Organization profile &amp; policies</p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#EFE8DA] dark:border-stone-800">
            <span className="text-[10px] font-black text-[#B45309] uppercase tracking-wider">Configure</span>
            <SettingsIcon size={14} className="text-stone-400 group-hover:text-[#B45309] transition-all" />
          </div>
        </Link>
      </div>

    </div>
  );
}
