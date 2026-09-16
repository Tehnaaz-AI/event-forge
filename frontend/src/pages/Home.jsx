import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Sparkles, ArrowRight, ShieldCheck, Cpu, 
  Ticket, TrendingUp, Plus, Clock, MessageSquare, Award,
  CheckCircle2, Zap, Users, Play, Shield, Layers, RefreshCw,
  QrCode, Check, Smartphone, CheckCircle, Search
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

  // Interactive Live Command Center Simulation State
  const [activeSimulatorTab, setActiveSimulatorTab] = useState('optical'); // 'optical' | 'conflict' | 'ai' | 'pass'
  const [scanCounter, setScanCounter] = useState(1482);
  const [lastScannedAttendee, setLastScannedAttendee] = useState({ name: 'Elena Rostova', badge: 'VIP All-Access', time: 'Just now' });
  const [isScanning, setIsScanning] = useState(false);
  const [conflictResolved, setConflictResolved] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState(['Generative AI', 'Multi-Track']);
  const [selectedPersona, setSelectedPersona] = useState('organizer'); // 'organizer' | 'attendee' | 'speaker' | 'staff'

  const { data: events, isLoading } = useQuery({
    queryKey: ['public-events-list'],
    queryFn: () => api.get('/events')
  });

  const triggerLiveScan = () => {
    setIsScanning(true);
    const mockAttendees = [
      { name: 'Marcus Sterling', badge: 'Keynote Speaker', time: 'Just now' },
      { name: 'Dr. Evelyn Martinez', badge: 'VIP All-Access', time: 'Just now' },
      { name: 'Sarah Jenkins', badge: 'Executive Delegate', time: 'Just now' },
      { name: 'Vikram Chandrasekhar', badge: 'Press / Media', time: 'Just now' },
      { name: 'Tehnaaz Fathima', badge: 'Platform Admin', time: 'Just now' }
    ];
    setTimeout(() => {
      const random = mockAttendees[Math.floor(Math.random() * mockAttendees.length)];
      setScanCounter(prev => prev + 1);
      setLastScannedAttendee(random);
      setIsScanning(false);
    }, 450);
  };

  const toggleInterest = (topic) => {
    if (selectedInterests.includes(topic)) {
      setSelectedInterests(selectedInterests.filter(t => t !== topic));
    } else {
      setSelectedInterests([...selectedInterests, topic]);
    }
  };

  const personaDetails = {
    organizer: {
      title: 'Conference Organizer & Executive',
      badge: 'Architecture & Multi-Track Builder',
      desc: 'Orchestrate multi-track agendas, assign speakers, configure tiered VIP passes, and broadcast live announcements to attendees in real time.',
      highlights: ['Zero-conflict agenda matrix', 'Multi-tier pass ticketing & revenue', 'Real-time sponsor deliverables', 'Live attendance broadcast'],
      actionText: 'Host a Conference',
      actionLink: user ? '/dashboard/organizer/events/new' : '/login?tab=register'
    },
    attendee: {
      title: 'Conference Delegate & VIP Attendee',
      badge: 'Digital Wallet & AI Concierge',
      desc: 'Seamless 1-click pass checkout, digital QR badges in your wallet, personalized AI agenda matching, and post-session speaker feedback.',
      highlights: ['Instant holographic wallet pass', 'AI interest-matched itinerary', 'Sub-second optical door entry', 'Session bookmarks & resources'],
      actionText: 'Explore Flagship Summits',
      actionLink: '/explore'
    },
    speaker: {
      title: 'Keynote Speaker & Panelist',
      badge: 'Stage & Session Management',
      desc: 'Dedicated speaker portals with live session scheduling, room assignment details, audience engagement polls, and presentation materials distribution.',
      highlights: ['Direct stage & room schedule', 'Live delegate Q&A integration', 'Speaker bio & keynote studio', 'Co-speaker session sync'],
      actionText: 'View Speaker Lineup',
      actionLink: '/explore'
    },
    staff: {
      title: 'Door Staff & Venue Gatekeeper',
      badge: 'Zero-Latency Optical Scanner',
      desc: 'Ultra high-speed camera scanner with instant Web Audio tone confirmation, offline resilience, and live attendee arrival analytics.',
      highlights: ['<150ms camera barcode decode', 'Instant duplicate pass rejection', 'Multi-door synchronized arrivals', 'Audio & visual status cues'],
      actionText: 'Launch Door Scanner',
      actionLink: user ? '/dashboard/staff' : '/login'
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

      {/* 🚀 UNIQUE INTERACTIVE SUMMIT COMMAND CENTER SIMULATOR 🚀 */}
      <section className="max-w-6xl mx-auto px-6 py-16 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl border border-[#EFE8DA] p-6 sm:p-10 shadow-xl overflow-hidden relative"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFE8DA] pb-6 mb-8">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-[#B45309] rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-amber-200">
                <Zap size={12} />
                <span>Interactive Architecture Simulation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                Experience EventForge in <span className="cursive-accent font-normal text-[#B45309] text-3xl sm:text-4xl align-middle px-1">Real-Time Action</span>
              </h2>
            </div>

            {/* Interactive Simulation Switcher Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA]">
              <button
                onClick={() => setActiveSimulatorTab('optical')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSimulatorTab === 'optical' 
                    ? 'bg-[#B45309] text-white shadow-sm' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <QrCode size={14} />
                <span>Optical Scanner</span>
              </button>

              <button
                onClick={() => setActiveSimulatorTab('conflict')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSimulatorTab === 'conflict' 
                    ? 'bg-[#B45309] text-white shadow-sm' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <Layers size={14} />
                <span>Conflict Engine</span>
              </button>

              <button
                onClick={() => setActiveSimulatorTab('ai')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSimulatorTab === 'ai' 
                    ? 'bg-[#B45309] text-white shadow-sm' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <Sparkles size={14} />
                <span>AI Concierge</span>
              </button>

              <button
                onClick={() => setActiveSimulatorTab('pass')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSimulatorTab === 'pass' 
                    ? 'bg-[#B45309] text-white shadow-sm' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <Smartphone size={14} />
                <span>Digital Wallet</span>
              </button>
            </div>
          </div>

          {/* Interactive Simulation Sandbox Views */}
          <AnimatePresence mode="wait">
            {activeSimulatorTab === 'optical' && (
              <motion.div 
                key="optical"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center"
              >
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-stone-900">Sub-Second Optical Door Scanner</h4>
                      <p className="text-xs text-stone-500">Live hardware-accelerated video barcode decodes with zero server lag.</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold animate-pulse">
                      Gate 01 Active
                    </span>
                  </div>

                  <div className="bg-[#1C1917] text-white rounded-2xl p-6 relative overflow-hidden font-mono border border-stone-800">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4 text-xs text-stone-400">
                      <span>DECODE LATENCY: <strong className="text-emerald-400">114ms</strong></span>
                      <span>ARRIVAL RATE: <strong className="text-amber-400">42 scans/min</strong></span>
                      <span>TOTAL CHECKED-IN: <strong className="text-white text-sm">{scanCounter}</strong></span>
                    </div>

                    <div className="flex items-center gap-4 bg-stone-900/90 p-4 rounded-xl border border-stone-800">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        {isScanning ? <RefreshCw className="animate-spin" size={24} /> : <CheckCircle size={24} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-stone-400">Latest Validated Pass</p>
                        <p className="text-base font-bold text-white truncate">{lastScannedAttendee.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-stone-400">
                          <span className="text-[#F59E0B]">{lastScannedAttendee.badge}</span>
                          <span>•</span>
                          <span>{lastScannedAttendee.time}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold shrink-0">
                        ACCESS GRANTED
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#EFE8DA] text-center space-y-4">
                  <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">Test Gate Speed</p>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Click below to simulate a rush hour optical pass decode and real-time ledger update.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={triggerLiveScan}
                    disabled={isScanning}
                    className="w-full bg-[#B45309] hover:bg-[#92400E] text-white py-3.5 rounded-xl font-bold text-xs shadow-md shadow-[#B45309]/20 flex items-center justify-center gap-2"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="animate-spin" size={15} />
                        <span>Decoding Optical QR...</span>
                      </>
                    ) : (
                      <>
                        <Play size={15} />
                        <span>Simulate Attendee Scan</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeSimulatorTab === 'conflict' && (
              <motion.div 
                key="conflict"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-extrabold text-stone-900">Zero-Collision Constraint Solver</h4>
                    <p className="text-xs text-stone-500">Mathematical room and speaker overlap resolution across multi-track stages.</p>
                  </div>
                  <button
                    onClick={() => setConflictResolved(!conflictResolved)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-[#EFE8DA] bg-[#FAF8F5] hover:bg-stone-200/50 transition-colors self-start"
                  >
                    {conflictResolved ? 'Inject Simulated Overlap' : 'Auto-Resolve Overlap'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#FAF8F5] border border-[#EFE8DA] p-4 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Track 01 • Main Auditorium</span>
                    <div className="p-3 bg-white rounded-xl border border-[#EFE8DA] space-y-1">
                      <p className="text-xs font-bold text-stone-900">Keynote: Next-Gen AI Models</p>
                      <p className="text-[11px] text-stone-500">09:00 - 10:30 AM • Dr. Evelyn Martinez</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl space-y-2 border transition-colors ${
                    conflictResolved ? 'bg-[#FAF8F5] border-[#EFE8DA]' : 'bg-rose-50 border-rose-300'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Track 02 • Breakout Hall A</span>
                    <div className={`p-3 rounded-xl border space-y-1 ${
                      conflictResolved ? 'bg-white border-[#EFE8DA]' : 'bg-rose-100 border-rose-300'
                    }`}>
                      <p className="text-xs font-bold text-stone-900">
                        {conflictResolved ? 'Decentralized Identity Workshop' : '🚨 Conflict: Dr. Evelyn Martinez Double-Booked!'}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {conflictResolved ? '10:45 - 12:00 PM • Alex Vance' : '09:30 - 10:45 AM (Overlap Detected)'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#FAF8F5] border border-[#EFE8DA] p-4 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Track 03 • Executive Stage</span>
                    <div className="p-3 bg-white rounded-xl border border-[#EFE8DA] space-y-1">
                      <p className="text-xs font-bold text-stone-900">Autonomous Cloud Scaling</p>
                      <p className="text-[11px] text-stone-500">09:00 - 10:30 AM • Sarah Jenkins</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSimulatorTab === 'ai' && (
              <motion.div 
                key="ai"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="text-base font-extrabold text-stone-900">AI Concierge &amp; Schedule Synthesizer</h4>
                  <p className="text-xs text-stone-500">Select topics below to generate an instantaneous personalized summit itinerary.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Generative AI', 'Multi-Track', 'Quantum Computing', 'Zero-Trust Security', 'Executive Leadership', 'Web3 & Identity'].map(topic => (
                    <button
                      key={topic}
                      onClick={() => toggleInterest(topic)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        selectedInterests.includes(topic)
                          ? 'bg-[#B45309] text-white shadow-xs'
                          : 'bg-[#FAF8F5] border border-[#EFE8DA] text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      {selectedInterests.includes(topic) ? '✓ ' : '+ '}{topic}
                    </button>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-[#FDFAF5] to-[#F5F2EB] p-5 rounded-2xl border border-[#EFE8DA] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#B45309]">
                    <Sparkles size={15} />
                    <span>AI Curated Itinerary Path ({selectedInterests.length} interest clusters matched)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-[#EFE8DA] space-y-1">
                      <span className="text-[10px] font-bold text-[#B45309] uppercase">9:30 AM • Keynote</span>
                      <p className="font-bold text-stone-900">Enterprise {selectedInterests[0] || 'AI'} in High-Scale Systems</p>
                      <p className="text-[11px] text-stone-500">98% Match with your selected topics</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#EFE8DA] space-y-1">
                      <span className="text-[10px] font-bold text-[#B45309] uppercase">11:15 AM • Workshop</span>
                      <p className="font-bold text-stone-900">Production {selectedInterests[1] || 'Security'} Architectures</p>
                      <p className="text-[11px] text-stone-500">Zero overlap with prior session</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSimulatorTab === 'pass' && (
              <motion.div 
                key="pass"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <h4 className="text-base font-extrabold text-stone-900">Holographic Digital Wallet Pass</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Attendees receive dynamic digital passes stored directly in their dashboard and Apple/Google Wallet with signed tamper-proof QR codes.
                  </p>
                  <ul className="space-y-2 text-xs text-stone-700">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Instant PDF &amp; Lanyard Badge Export</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Multi-Track Keynote VIP Seating Clearance</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Secure 1-Click Ticket Reassignment</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-[#1C1917] to-[#292524] text-white p-6 rounded-3xl border border-white/10 shadow-2xl relative space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-[#C28E27] uppercase tracking-wider">EventForge Executive Pass</span>
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">VERIFIED</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-extrabold text-white">FutureTech Global Summit 2026</p>
                      <p className="text-xs text-stone-400">Attendee: {user?.name || 'Alex Morgan'}</p>
                    </div>
                    <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center text-stone-900">
                      <QrCode size={46} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-between text-[10px] text-stone-400">
                    <span>TIER: VIP ALL-ACCESS</span>
                    <span>GATE: PRIORITY LANE</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* 🧭 INTERACTIVE CHOOSE YOUR PERSONA JOURNEY 🧭 */}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#B45309] uppercase tracking-widest">
            Tailored Conference Journeys
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            Built for Every <span className="cursive-accent font-normal text-[#B45309] text-3xl md:text-5xl align-middle px-1">Summit Role</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
            Select your role to explore the dedicated tools and workflows engineered for your summit success.
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex justify-center gap-2 flex-wrap">
          {[
            { id: 'organizer', label: 'Event Organizer', icon: <Layers size={14} /> },
            { id: 'attendee', label: 'Attendee Pass', icon: <Ticket size={14} /> },
            { id: 'speaker', label: 'Keynote Speaker', icon: <Users size={14} /> },
            { id: 'staff', label: 'Door Staff', icon: <Shield size={14} /> }
          ].map(persona => (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(persona.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedPersona === persona.id
                  ? 'bg-[#1C1917] text-white shadow-md'
                  : 'bg-white border border-[#EFE8DA] text-stone-600 hover:border-stone-400'
              }`}
            >
              {persona.icon}
              <span>{persona.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Persona Experience Card */}
        <motion.div
          key={selectedPersona}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl border border-[#EFE8DA] p-8 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
        >
          <div className="md:col-span-2 space-y-4">
            <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {personaDetails[selectedPersona].badge}
            </span>
            <h3 className="text-2xl font-extrabold text-stone-900">
              {personaDetails[selectedPersona].title}
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed font-light">
              {personaDetails[selectedPersona].desc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {personaDetails[selectedPersona].highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-stone-800">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#EFE8DA] text-center space-y-4 flex flex-col justify-center">
            <p className="text-xs font-bold text-stone-700">Ready to Experience?</p>
            <Link
              to={personaDetails[selectedPersona].actionLink}
              className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold py-3.5 px-6 rounded-xl shadow-md transition-all block text-center"
            >
              {personaDetails[selectedPersona].actionText} &rarr;
            </Link>
          </div>
        </motion.div>
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
