import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Compass, Home, ArrowRight, Search, Calendar, Sparkles, 
  Layers, ShieldAlert, LifeBuoy, Zap, Radio, ArrowLeft
} from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import useDocumentTitle from '../../components/common/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('404 Page Not Found', 'The conference or page you are looking for does not exist.');

  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/explore');
    }
  };

  const quickTags = [
    'AI Summits', 
    'Executive Keynotes', 
    'Multi-Track Agendas', 
    'VIP Passes', 
    'Door Scanner'
  ];

  const gatewayCards = [
    {
      title: 'Explore Summits',
      desc: 'Discover live conferences, keynote speakers, and multi-track agendas.',
      icon: Calendar,
      to: '/explore',
      badge: 'Public Registry',
      color: 'from-amber-500/10 to-orange-500/10 text-[#B45309]'
    },
    {
      title: 'Platform OS & Features',
      desc: 'Explore zero-conflict scheduling, VIP waitlists, and door scan engines.',
      icon: Zap,
      to: '/features',
      badge: 'Architecture',
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600'
    },
    {
      title: 'Executive Workspace',
      desc: 'Organizer telemetry, agenda makers, staff assignment & intelligence.',
      icon: Layers,
      to: '/dashboard/organizer',
      badge: 'Organizer Suite',
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-600'
    },
    {
      title: 'Support Helpdesk',
      desc: 'Direct triage with our engineering team for ticket and summit questions.',
      icon: LifeBuoy,
      to: '/contact',
      badge: '24/7 SLA',
      color: 'from-purple-500/10 to-pink-500/10 text-purple-600'
    }
  ];

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 sm:px-6 py-16 text-center font-sans selection:bg-[#B45309] selection:text-white relative overflow-hidden">
      
      {/* Ambient Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B45309]/5 dark:bg-[#B45309]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-3xl w-full mx-auto space-y-8"
      >
        <div className="flex justify-center">
          <Breadcrumbs items={[{ label: '404 Route Desync' }]} />
        </div>

        {/* Floating 3D Animated Forge Compass */}
        <div className="relative inline-block mx-auto">
          {/* Outer Pulsing Radar Ring */}
          <motion.div 
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#B45309]/20 via-[#C28E27]/20 to-transparent blur-md pointer-events-none"
          />

          <motion.div 
            animate={{ rotate: [0, 8, -8, 0], y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1C1917] to-[#2E2A24] text-[#F59E0B] flex items-center justify-center mx-auto shadow-2xl border border-white/10 relative z-10"
          >
            <Compass size={44} className="stroke-[1.75]" />
          </motion.div>
        </div>

        {/* Telemetry Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B45309]/10 text-[#B45309] dark:text-[#FCD34D] border border-[#B45309]/20 text-xs font-black uppercase tracking-widest">
            <Radio size={12} className="animate-pulse text-[#B45309]" />
            HTTP 404 // ROUTE_DISCONNECTED
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-stone-900 dark:text-[#F5F2EB] tracking-tight leading-tight">
            Summit Coordinate <br />
            <span className="cursive-accent font-normal text-[#B45309] dark:text-[#F59E0B] text-5xl sm:text-6xl md:text-7xl align-middle px-2">
              Not Found
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-lg mx-auto leading-relaxed">
            The conference path, checkout pass, or agenda session you requested is unavailable or has transitioned to a new coordinates.
          </p>
        </div>

        {/* Live Search Form & Quick Chips */}
        <div className="max-w-lg mx-auto space-y-3">
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              placeholder="Search summit title, keynote speaker, or track..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#1C1917] border border-[#EFE8DA] dark:border-stone-800 rounded-2xl pl-11 pr-28 py-3.5 text-xs text-stone-900 dark:text-[#F5F2EB] shadow-md focus:outline-none focus:border-[#B45309] dark:focus:border-[#F59E0B] transition-all"
            />
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#B45309] transition-colors" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#B45309] hover:bg-[#92400E] text-white text-[11px] font-extrabold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <span>Explore</span>
              <ArrowRight size={12} />
            </button>
          </form>

          {/* Quick Filter Tag Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mr-1">Suggestions:</span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  navigate(`/explore?q=${encodeURIComponent(tag)}`);
                }}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#24211D] hover:bg-[#B45309]/10 hover:text-[#B45309] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Gateway Exploration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
          {gatewayCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                to={card.to}
                className="group bg-white dark:bg-[#171614] p-5 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 hover:border-[#B45309]/40 dark:hover:border-amber-500/40 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all flex items-start gap-4"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-black text-stone-900 dark:text-[#F5F2EB] group-hover:text-[#B45309] transition-colors truncate">
                      {card.title}
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#24211D] text-stone-500 dark:text-stone-400">
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-black py-3.5 px-7 rounded-2xl shadow-xl shadow-[#B45309]/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wider hover:-translate-y-0.5"
          >
            <Home size={15} />
            <span>Return to Global Portal</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto bg-white dark:bg-[#1C1917] hover:bg-stone-50 dark:hover:bg-[#24211D] border border-[#EFE8DA] dark:border-stone-800 text-stone-800 dark:text-[#F5F2EB] text-xs font-black py-3.5 px-7 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer hover:-translate-y-0.5"
          >
            <ArrowLeft size={15} />
            <span>Go Back Previous Page</span>
          </button>
        </div>

        {/* Sub-Footer Helpdesk Link */}
        <div className="pt-6 border-t border-[#EFE8DA] dark:border-stone-800 text-xs text-stone-400 flex items-center justify-center gap-2">
          <span>Need immediate assistance?</span>
          <Link to="/contact" className="text-[#B45309] dark:text-[#FCD34D] font-bold hover:underline flex items-center gap-1">
            <span>Contact 24/7 Operations Desk</span>
            <ArrowRight size={12} />
          </Link>
        </div>

      </motion.div>
    </div>
  );
}
