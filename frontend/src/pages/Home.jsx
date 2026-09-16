import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Sparkles, ArrowRight, ShieldCheck, Cpu, 
  Ticket, TrendingUp, Plus, Clock, MessageSquare, Award,
  CheckCircle2, Zap, Users, Shield, Layers,
  QrCode, Check, Smartphone, CheckCircle, Search, Star,
  Compass, Radio, Flame
} from 'lucide-react';
import { api } from '../services/api';
import useDocumentTitle from '../components/common/useDocumentTitle';
import FAQSection from '../components/common/FAQSection';
import TestimonialsSection from '../components/common/TestimonialsSection';

export default function Home() {
  useDocumentTitle(
    'Premier Multi-Track Conference Operating System',
    'Curate, scale, and orchestrate world-class enterprise conferences with zero-conflict scheduling and high-speed QR check-in.'
  );

  const user = JSON.parse(localStorage.getItem('eventforge_user') || 'null');

  const { data: events, isLoading } = useQuery({
    queryKey: ['public-events-list'],
    queryFn: () => api.get('/events')
  });

  const activeEvent = events && events.length > 0 ? events[0] : null;
  const [selectedPassQuantity, setSelectedPassQuantity] = useState(1);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-[#B45309] selection:text-white">
      
      {/* Editorial Luxury Hero Section */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden border-b border-[#EFE8DA] bg-gradient-to-b from-[#FDFAF5] via-[#FAF8F5] to-[#F5F2EB]">
        
        {/* Ambient Warm Floating Glow */}
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#B45309] rounded-full blur-[150px] pointer-events-none"
        />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto relative z-10 text-center space-y-8"
        >
          
          {/* Eyebrow Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#EFE8DA] rounded-full text-[#B45309] text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles size={14} className="text-[#C28E27] animate-spin" />
            <span>AI-Driven Corporate Event Operating System</span>
          </motion.div>
          
          {/* Editorial Headline with Cursive Accent */}
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-stone-900 leading-[1.2]">
            Curate, Scale &amp; <span className="cursive-accent font-normal text-[#B45309] text-6xl sm:text-7xl md:text-8xl inline-block px-2 align-middle">Masterpiece</span> <br />
            <span className="font-serif italic font-normal text-stone-800">
              World-Class Conferences
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed font-light">
            Unifying enterprise multi-track summits, global symposiums, and corporate exhibitions with intelligent schedule orchestration and high-speed optical verification.
          </motion.p>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 pt-2">
            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link 
                    to={user.role === 'PLATFORM_ADMIN' ? '/dashboard/admin' : user.role === 'ATTENDEE' ? '/dashboard/attendee' : user.role === 'STAFF' ? '/dashboard/staff' : '/dashboard/organizer'}
                    className="bg-[#B45309] hover:bg-[#92400E] text-white px-8 py-4 rounded-2xl font-extrabold text-base md:text-lg shadow-xl shadow-[#B45309]/20 transition-all flex items-center gap-2.5"
                  >
                    <Ticket size={20} /> Open {user.role === 'ATTENDEE' ? 'Attendee Passes' : user.role === 'STAFF' ? 'Door Scanner' : user.role === 'PLATFORM_ADMIN' ? 'Platform Admin Console' : 'Organizer Workspace'} <ArrowRight size={18} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link 
                    to="/explore" 
                    className="bg-white hover:bg-stone-50 text-stone-800 px-8 py-4 rounded-2xl font-bold text-base md:text-lg border border-[#EFE8DA] transition-all shadow-sm flex items-center gap-2"
                  >
                    Explore Summits
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link 
                    to="/explore" 
                    className="bg-[#B45309] hover:bg-[#92400E] text-white px-8 py-4 rounded-2xl font-extrabold text-base md:text-lg shadow-xl shadow-[#B45309]/20 transition-all flex items-center gap-2.5"
                  >
                    Explore Conferences <ArrowRight size={18} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link 
                    to="/login?tab=register" 
                    className="bg-white hover:bg-stone-50 text-stone-800 px-8 py-4 rounded-2xl font-bold text-base md:text-lg border border-[#EFE8DA] transition-all shadow-sm flex items-center gap-2"
                  >
                    Host a Conference
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* High-Level Trust Badges */}
          <motion.div variants={itemVariants} className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-sm flex items-center gap-3.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center font-bold shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-stone-900">Multi-Track</p>
                <p className="text-xs text-stone-500 font-medium">Zero-conflict matrix</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-sm flex items-center gap-3.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-stone-900">Optical Scanner</p>
                <p className="text-xs text-stone-500 font-medium">&lt;150ms check-in</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-sm flex items-center gap-3.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
                <Cpu size={20} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-stone-900">AI Concierge</p>
                <p className="text-xs text-stone-500 font-medium">Dynamic synthesis</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-sm flex items-center gap-3.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-stone-900">Live Telemetry</p>
                <p className="text-xs text-stone-500 font-medium">Real-time gate feeds</p>
              </div>
            </motion.div>
          </motion.div>

        </motion.div>
      </section>

      {/* 🚀 100% DYNAMIC REAL CONFERENCE SPOTLIGHT OR LIVE PLATFORM LAUNCHPAD 🚀 */}
      <section className="max-w-6xl mx-auto px-6 py-16 w-full">
        {activeEvent ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-[#EFE8DA] p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-50 text-[#B45309] rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-amber-200">
                  {activeEvent.category || 'Featured Conference'}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Registration Open
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900">
                {activeEvent.title}
              </h2>

              <p className="text-sm text-stone-600 leading-relaxed font-light line-clamp-3">
                {activeEvent.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-stone-700">
                <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#EFE8DA]">
                  <Calendar size={14} className="text-[#B45309]" />
                  <span>{new Date(activeEvent.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {activeEvent.venue?.name && (
                  <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#EFE8DA]">
                    <MapPin size={14} className="text-amber-700" />
                    <span>{activeEvent.venue.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-[#1C1917] to-[#292524] text-white p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-[#C28E27] uppercase">Official Digital Pass</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">VERIFIED</span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-white truncate max-w-[180px]">{activeEvent.title}</p>
                  <p className="text-xs text-stone-400">{user?.name || 'Delegate Pass'}</p>
                </div>
                <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center text-stone-900">
                  <QrCode size={46} />
                </div>
              </div>

              <Link
                to={`/e/${activeEvent.slug}`}
                className="w-full bg-[#B45309] hover:bg-[#92400E] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider block text-center mt-2"
              >
                <span>View Multi-Track Agenda &amp; Passes</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-[#EFE8DA] p-8 sm:p-12 shadow-xl text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 text-[#B45309] flex items-center justify-center mx-auto shadow-inner">
              <Radio size={32} className="animate-pulse" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-50 text-[#B45309] border border-amber-200 px-3.5 py-1 rounded-full inline-block">
                Production-Ready Platform Telemetry
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                Unified Multi-Track <span className="cursive-accent font-normal text-[#B45309] text-3xl sm:text-5xl align-middle px-1">Conference Engine</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                All backend systems, optical check-in scanners, and AI itinerary models are active and waiting for new conference publications.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-2 text-left">
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">DATABASE</span>
                <p className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={13} /> MongoDB Atlas Live
                </p>
              </div>
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">GATE SCANNER</span>
                <p className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={13} /> &lt;150ms Camera QR
                </p>
              </div>
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">AGENDA ENGINE</span>
                <p className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={13} /> 0 Active Collisions
                </p>
              </div>
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">AUTH &amp; SECURITY</span>
                <p className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={13} /> 100% RBAC Isolated
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                to={user ? "/dashboard/organizer/events/new" : "/login?tab=register"}
                className="bg-[#B45309] hover:bg-[#92400E] text-white px-6 py-3.5 rounded-xl text-xs font-bold shadow-lg shadow-[#B45309]/20 transition-all flex items-center gap-2 uppercase tracking-wider"
              >
                <Plus size={15} />
                <span>Publish First Summit</span>
              </Link>

              <Link
                to="/features"
                className="bg-[#FAF8F5] hover:bg-stone-100 border border-[#EFE8DA] text-stone-800 px-6 py-3.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
              >
                <Compass size={15} className="text-[#B45309]" />
                <span>Explore Platform Capabilities</span>
              </Link>
            </div>
          </motion.div>
        )}
      </section>

      {/* Featured Conferences Grid Section */}
      <section id="featured-events" className="max-w-6xl mx-auto px-6 py-16 w-full space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#EFE8DA] pb-6"
        >
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#B45309] uppercase tracking-widest">
              Upcoming Flagship Summits
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
              Featured Global <span className="cursive-accent font-normal text-[#B45309] text-3xl md:text-5xl align-middle px-1">Gatherings</span>
            </h2>
            <p className="text-xs text-stone-500">Curated conferences with verified speakers and multi-track agendas</p>
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link 
              to="/explore" 
              className="text-sm sm:text-base font-extrabold text-[#B45309] hover:text-[#92400E] flex items-center gap-2 group bg-white border border-[#EFE8DA] px-5 py-2.5 rounded-xl shadow-xs transition-all hover:shadow-md"
            >
              <span>Explore All Conferences</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {isLoading ? (
          <div className="bg-white p-16 text-center rounded-3xl border border-[#EFE8DA] text-stone-500 shadow-sm">
            <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading active conferences...
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {events?.map((event) => (
              <motion.div 
                key={event._id} 
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="bg-white rounded-3xl border border-[#EFE8DA] overflow-hidden shadow-sm hover:shadow-2xl hover:border-[#B45309]/50 transition-all group flex flex-col justify-between"
              >
                
                {/* Event Card Top Banner in Ivory/Sand */}
                <div className="p-8 bg-gradient-to-br from-[#FDFAF5] to-[#F5F2EB] border-b border-[#EFE8DA] space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="px-3.5 py-1.5 bg-white text-[#B45309] border border-[#EFE8DA] rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xs">
                      {event.category || 'Technology'}
                    </span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold uppercase">
                      Open
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 line-clamp-2 leading-snug group-hover:text-[#B45309] transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Event Card Bottom Body */}
                <div className="p-6 space-y-5">
                  <div className="space-y-2.5 text-sm font-semibold text-stone-700">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="text-[#B45309]" size={17} />
                      <span>{new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {event.venue?.name && (
                      <div className="flex items-center gap-2.5">
                        <MapPin className="text-amber-700" size={17} />
                        <span className="truncate">{event.venue.name}</span>
                      </div>
                    )}
                  </div>

                  <Link 
                    to={`/e/${event.slug}`}
                    className="w-full bg-[#FAF8F5] hover:bg-[#B45309] text-stone-900 hover:text-white border border-[#EFE8DA] hover:border-[#B45309] text-center font-extrabold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-xs group-hover:shadow-md uppercase tracking-wider"
                  >
                    <span>Explore Conference &amp; Passes</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}

            {(!events || events.length === 0) && (
              <div className="col-span-full bg-white p-16 text-center rounded-3xl border border-[#EFE8DA] shadow-xs text-stone-600 space-y-4 max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center mx-auto">
                  <Calendar size={28} />
                </div>
                <h3 className="text-xl font-extrabold text-stone-900">Ready for First Conference Publication</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-light">
                  Your platform database is pristine. Sign in as Organizer or Platform Admin to build your multi-track agendas, assign speakers, and configure passes.
                </p>
                <div className="pt-2">
                  <Link
                    to={user ? "/dashboard/organizer/events/new" : "/login?tab=register"}
                    className="inline-flex items-center gap-2 bg-[#B45309] hover:bg-[#92400E] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-md shadow-[#B45309]/20 transition-all uppercase tracking-wider"
                  >
                    <Plus size={16} /> Create Conference
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </section>

      {/* Priority Waitlist & Early Bird Banner */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-6 py-8 w-full"
      >
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-[#1C1917] text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-stone-700 relative overflow-hidden">
          <div className="space-y-2 max-w-lg relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F59E0B] bg-amber-500/10 px-3 py-1 rounded-full inline-block">
              VIP Priority <span className="cursive-accent font-normal text-[#F59E0B] text-base px-1">Access</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Looking for Sold-Out Keynotes &amp; Early Bird Passes?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
              Join the priority waitlist to receive instant checkout invitations when executive allocations release.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative z-10">
            <Link
              to="/waitlist"
              className="shrink-0 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-[#B45309]/30 transition-all flex items-center gap-2 uppercase tracking-wider"
            >
              <Clock size={16} />
              <span>Join VIP Waitlist</span>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Verified Reviews / Enterprise Reliability Section */}
      <TestimonialsSection />

      {/* Comprehensive FAQs Section */}
      <FAQSection />

    </div>
  );
}
