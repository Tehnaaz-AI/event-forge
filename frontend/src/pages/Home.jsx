import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Sparkles, ArrowRight, ShieldCheck, Cpu, 
  Ticket, TrendingUp, Plus, Clock, MessageSquare, Award,
  CheckCircle2, Zap, Users, Shield, Layers,
  QrCode, Check, Smartphone, CheckCircle, Search, Star
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
  const [activeAgendaDay, setActiveAgendaDay] = useState('day1');

  const { data: events, isLoading } = useQuery({
    queryKey: ['public-events-list'],
    queryFn: () => api.get('/events')
  });

  const agendaTracks = {
    day1: {
      tag: 'Day 01 • Executive Keynotes & Opening Ceremony',
      sessions: [
        {
          time: '09:00 - 10:30 AM',
          room: 'Main Grand Auditorium',
          title: 'Autonomous Enterprise Architecture & AI Transformation',
          speaker: 'Dr. Evelyn Martinez',
          role: 'VP AI Research',
          track: 'Keynote'
        },
        {
          time: '11:00 - 12:30 PM',
          room: 'Hall A • Executive Stage',
          title: 'Zero-Trust Infrastructure & Cryptographic Identity',
          speaker: 'Marcus Sterling',
          role: 'Chief Security Officer',
          track: 'Security'
        },
        {
          time: '02:00 - 03:30 PM',
          room: 'Hall B • Innovation Lab',
          title: 'High-Concurrency Event Systems at Global Scale',
          speaker: 'Sarah Jenkins',
          role: 'Principal Architect',
          track: 'Infrastructure'
        }
      ]
    },
    day2: {
      tag: 'Day 02 • Deep-Dive Masterclasses & Workshops',
      sessions: [
        {
          time: '09:30 - 11:00 AM',
          room: 'Executive Boardroom C',
          title: 'Multi-Track Conflict Resolution & Dynamic Timelines',
          speaker: 'Vikram Chandrasekhar',
          role: 'Head of Engineering',
          track: 'Masterclass'
        },
        {
          time: '11:30 - 01:00 PM',
          room: 'Main Grand Auditorium',
          title: 'Autonomous LLM Agents in Mission-Critical Ops',
          speaker: 'Elena Rostova',
          role: 'Director of AI Strategy',
          track: 'AI Systems'
        },
        {
          time: '02:30 - 04:00 PM',
          room: 'Innovation Amphitheater',
          title: 'Sub-Second Optical Gatekeeping & Edge Verification',
          speaker: 'Alex Morgan',
          role: 'Lead Systems Architect',
          track: 'Hardware'
        }
      ]
    }
  };

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
                    <Ticket size={20} /> Open {user.role === 'ATTENDEE' ? 'Attendee Passes' : user.role === 'STAFF' ? 'Door Scanner' : 'Organizer Workspace'} <ArrowRight size={18} />
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

      {/* 🌟 LUXURY SHOWCASE: DIGITAL VIP PASS & INTERACTIVE AGENDA STREAM 🌟 */}
      <section className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="text-center space-y-3 mb-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest bg-amber-50 text-[#B45309] border border-amber-200 px-3.5 py-1 rounded-full inline-block">
            Seamless Executive Experience
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            Designed for <span className="cursive-accent font-normal text-[#B45309] text-3xl md:text-5xl align-middle px-1">Effortless Attendance</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Experience conflict-free multi-track agendas and instant digital wallet passes engineered for the world's most prestigious summits.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Multi-Track Agenda Stream */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EFE8DA] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE8DA] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                  <Calendar size={18} className="text-[#B45309]" />
                  <span>Curated Summit Agenda</span>
                </h3>
                <p className="text-xs text-stone-500">Live synchronized multi-track schedule</p>
              </div>

              {/* Day Switcher */}
              <div className="flex gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#EFE8DA] self-start sm:self-auto">
                <button
                  onClick={() => setActiveAgendaDay('day1')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeAgendaDay === 'day1'
                      ? 'bg-[#B45309] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Day 1 (Keynotes)
                </button>
                <button
                  onClick={() => setActiveAgendaDay('day2')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeAgendaDay === 'day2'
                      ? 'bg-[#B45309] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Day 2 (Workshops)
                </button>
              </div>
            </div>

            <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider block">
              {agendaTracks[activeAgendaDay].tag}
            </span>

            {/* Session Cards */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAgendaDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {agendaTracks[activeAgendaDay].sessions.map((session, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-[#EFE8DA] bg-[#FAF8F5] hover:bg-white hover:border-[#B45309]/30 transition-all space-y-2 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#B45309] flex items-center gap-1.5">
                        <Clock size={13} />
                        {session.time}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-[#EFE8DA] text-[10px] font-bold text-stone-600">
                        {session.room}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900">
                      {session.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#B45309]/10 text-[#B45309] flex items-center justify-center font-bold text-[10px]">
                          {session.speaker.charAt(0)}
                        </div>
                        <span className="text-stone-700 font-medium">{session.speaker}</span>
                        <span className="text-stone-400 text-[10px]">• {session.role}</span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Zero Conflict
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Holographic VIP Pass Showcase */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#1C1917] text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-baseline leading-none">
                  <span className="logo-cursive text-2xl font-extrabold text-[#C28E27] mr-0.5">Event</span>
                  <span className="font-extrabold text-white text-base tracking-tight uppercase">FORGE</span>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-500/30">
                  DIGITAL WALLET PASS
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">CONFERENCE</p>
                <h4 className="text-lg font-extrabold text-white">Global AI &amp; Enterprise Summit 2026</h4>
                <p className="text-xs text-[#C28E27] font-medium">Grand Hyatt Conference Center • San Francisco</p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-stone-400 uppercase">DELEGATE</p>
                  <p className="text-sm font-bold text-white truncate">{user?.name || 'Alex Morgan'}</p>
                  <p className="text-[11px] text-stone-400">Tier: VIP All-Access</p>
                </div>
                <div className="w-16 h-16 bg-white p-1.5 rounded-xl flex items-center justify-center text-stone-900 shrink-0">
                  <QrCode size={52} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-400 border-t border-white/10 pt-3">
                <div>
                  <span className="block text-stone-500 uppercase">GATE VERIFICATION</span>
                  <strong className="text-white">&lt; 150ms Instant Door Pass</strong>
                </div>
                <div>
                  <span className="block text-stone-500 uppercase">SEAT RESERVATION</span>
                  <strong className="text-emerald-400">Front Row Keynote Clear</strong>
                </div>
              </div>

              <Link
                to="/explore"
                className="w-full bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-center"
              >
                <span>Browse Passes &amp; Register</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
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
                <h3 className="text-xl font-extrabold text-stone-900">No Conferences Published Yet</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Be the first to publish a world-class conference. Sign up as an Organizer or Admin to create multi-track summits, speaker lineups, and tiered passes.
                </p>
                <div className="pt-2">
                  <Link
                    to={user ? "/dashboard/organizer/events/new" : "/login?tab=register"}
                    className="inline-flex items-center gap-2 bg-[#B45309] hover:bg-[#92400E] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-md shadow-[#B45309]/20 transition-all"
                  >
                    <Plus size={16} /> Create First Conference
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

      {/* Verified Reviews Section */}
      <TestimonialsSection />

      {/* Comprehensive FAQs Section */}
      <FAQSection />

    </div>
  );
}
