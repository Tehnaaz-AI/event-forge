import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Cpu, Calendar, Users, Award, Sparkles, 
  ArrowRight, CheckCircle2, Globe, Building, Zap, Lock,
  Server, Layers, Check, Database, RefreshCw, Activity, Terminal
} from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import useDocumentTitle from '../../components/common/useDocumentTitle';

export default function AboutPage() {
  useDocumentTitle('About EventForge | Enterprise Conference Infrastructure', 'Learn about EventForge mission, architecture, and high-concurrency event operating system.');

  const [activeLayer, setActiveLayer] = useState('optical'); // 'optical' | 'rbac' | 'agenda' | 'ai'

  const pillars = [
    {
      icon: <Layers className="text-[#B45309]" size={24} />,
      title: 'Conflict-Free Agenda Engine',
      description: 'Zero-collision mathematical constraint solvers prevent speaker overlap, track double-booking, and room capacity violations.'
    },
    {
      icon: <Zap className="text-amber-600" size={24} />,
      title: 'Sub-Second QR Gatekeeping',
      description: 'High-throughput optical scanner with instant Web Audio chime feedback handles peak attendee arrival rushes without bottlenecks.'
    },
    {
      icon: <ShieldCheck className="text-emerald-600" size={24} />,
      title: 'Isolated Multi-Tenant Security',
      description: 'Strict Role-Based Access Control (RBAC) across Platform Admins, Organizers, Door Staff, and Delegates with signed JWT tokens.'
    },
    {
      icon: <Sparkles className="text-purple-600" size={24} />,
      title: 'AI Content & Schedule Studio',
      description: 'Integrated generative models create marketing descriptions, speaker bios, and personalized delegate itineraries in seconds.'
    }
  ];

  const platformSpecs = [
    { label: 'Check-in Latency', value: '< 150ms' },
    { label: 'Schedule Concurrency', value: '10,000+' },
    { label: 'Tenant Isolation', value: '100% RBAC' },
    { label: 'Uptime SLA', value: '99.9%' }
  ];

  const architectureLayers = {
    optical: {
      name: 'Layer 1: Edge CDN & Optical QR Pipeline',
      icon: <Zap size={18} className="text-amber-600" />,
      metric: '112ms Decode Time',
      badge: 'Zero-Lag Hardware Decode',
      description: 'Client-side hardware accelerated jsQR camera feed with Web Audio API chime synthesizers. Validates passes instantly at venue turnstiles with offline capability.',
      specs: ['Sub-150ms scan confirmation', 'Offline cache fallback', 'Tamper-proof HMAC signature verification', 'Multi-door synchronized arrivals']
    },
    rbac: {
      name: 'Layer 2: Enterprise Multi-Tenant RBAC Core',
      icon: <ShieldCheck size={18} className="text-emerald-600" />,
      metric: '4-Tier Isolation',
      badge: 'Strict Security',
      description: 'Isolated tenancy architecture enforcing strict privilege separation between Master Admins, Event Organizers, Door Staff, and Delegates.',
      specs: ['Signed cryptographic JWT tokens', 'Rate-limiting & DDoS mitigation', 'Audit logs for door scan verification', 'Atomic ticket booking locks']
    },
    agenda: {
      name: 'Layer 3: Zero-Collision Constraint Engine',
      icon: <Layers size={18} className="text-[#B45309]" />,
      metric: '0.00% Overlap',
      badge: 'Mathematical Solver',
      description: 'Dynamic graph-based collision solver checking room capacity, speaker availability, and time slot overlap in O(1) indexed lookups.',
      specs: ['Speaker double-booking prevention', 'Room maximum occupancy alarms', 'Multi-track stage synchronization', 'Instant session re-sequencing']
    },
    ai: {
      name: 'Layer 4: Generative AI Concierge Studio',
      icon: <Sparkles size={18} className="text-purple-600" />,
      metric: 'Gemini 2.5 Flash',
      badge: 'Intelligent Matchmaker',
      description: 'Autonomous contextual model synthesizing attendee career goals with conference tracks to generate personalized itineraries.',
      specs: ['Dynamic multi-track itinerary curation', 'Autonomous speaker bio enhancement', 'Automated marketing email copy generation', 'Real-time session recommendations']
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-stone-900 dark:text-stone-100 font-sans selection:bg-[#B45309] selection:text-white pb-24">
      
      {/* Hero Banner - Seamless */}
      <section className="pt-8 pb-16 px-6 text-center relative">
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <Breadcrumbs items={[{ label: 'About EventForge' }]} />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-1.5 bg-white text-[#B45309] border border-[#EFE8DA] rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-block shadow-xs"
          >
            Enterprise Event Architecture
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight"
          >
            The Operating System for <br />
            <span className="cursive-accent font-normal text-[#B45309] text-5xl sm:text-7xl block mt-1">
              World-Class Summits
            </span>
          </motion.h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-light">
            EventForge was engineered to eliminate schedule collisions, gatekeeper friction, and fragmented tooling across high-stakes corporate conferences and international exhibitions.
          </p>
        </div>
      </section>

      {/* Main Philosophy & Mission Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 space-y-20">
        
        {/* Mission Statement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-widest">Engineering Mission</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-snug">
              Precision <span className="cursive-accent font-normal text-[#B45309] text-3xl sm:text-4xl align-middle px-1">Infrastructure</span> for High-Stakes Summits
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              When enterprises, academic institutions, and global organizations convene thousands of delegates, software latency and scheduling confusion cannot happen. EventForge couples AI curation with high-throughput transactional backends to deliver unified conference execution.
            </p>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={13} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Guaranteed Conflict-Free Agenda Scheduling</h4>
                  <p className="text-[11px] text-stone-500">Constraint verification prevents double-booked venues, overlapping keynotes, and track collisions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={13} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Zero-Friction Optical QR Gatekeeper Access</h4>
                  <p className="text-[11px] text-stone-500">Sub-second camera scanning with Web Audio feedback handles peak arrival surges without lines.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={13} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Autonomous AI Content Studio &amp; Matchmaking</h4>
                  <p className="text-[11px] text-stone-500">Instant generation of promotional copy, session descriptions, and attendee interest-matched itineraries.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-[#EFE8DA] rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B45309]/5 rounded-bl-full pointer-events-none"></div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider">Enterprise Architecture</span>
              <h3 className="text-xl font-extrabold text-stone-900">Four Dedicated Role Surfaces</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] space-y-1 hover:border-[#B45309]/30 transition-colors">
                <p className="text-xs font-bold text-rose-800">Master Admin</p>
                <p className="text-[10px] text-stone-500">Platform-wide user management, cross-tenant event purge, and telemetry.</p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] space-y-1 hover:border-[#B45309]/30 transition-colors">
                <p className="text-xs font-bold text-amber-800">Event Organizer</p>
                <p className="text-[10px] text-stone-500">Multi-track builder, speaker directory, sponsor deliverables, and analytics.</p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] space-y-1 hover:border-[#B45309]/30 transition-colors">
                <p className="text-xs font-bold text-orange-800">Door Staff</p>
                <p className="text-[10px] text-stone-500">Live WebRTC optical check-in, arrival feeds, and audio validation.</p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] space-y-1 hover:border-[#B45309]/30 transition-colors">
                <p className="text-xs font-bold text-emerald-800">Attendee Pass</p>
                <p className="text-[10px] text-stone-500">Digital wallet passes, printable lanyard badges, and post-event feedback.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#EFE8DA] flex items-center justify-between text-xs font-bold text-stone-700">
              <span>Security &amp; Tenant Isolation</span>
              <span className="text-emerald-600 flex items-center gap-1"><ShieldCheck size={14} /> SOC2 / JWT Verified</span>
            </div>
          </motion.div>
        </div>

        {/* 🔬 INTERACTIVE SYSTEM ARCHITECTURE PLAYGROUND 🔬 */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl border border-[#EFE8DA] p-8 sm:p-12 shadow-xl space-y-8"
        >
          <div className="text-center space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-amber-50 text-[#B45309] border border-amber-200 px-3.5 py-1 rounded-full inline-block">
              Interactive System Architecture
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Explore the <span className="cursive-accent font-normal text-[#B45309] text-3xl sm:text-4xl align-middle px-1">Technology Stack</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
              Click through the architectural layers below to inspect the real-time execution pipelines powering EventForge.
            </p>
          </div>

          {/* Layer Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {Object.keys(architectureLayers).map((key) => {
              const layer = architectureLayers[key];
              const isSelected = activeLayer === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveLayer(key)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#1C1917] text-white shadow-md'
                      : 'bg-[#FAF8F5] border border-[#EFE8DA] text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {layer.icon}
                  <span>{layer.name.split(':')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Layer Visualizer Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLayer}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
            >
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#B45309]/10 text-[#B45309] rounded-full text-[10px] font-extrabold uppercase">
                    {architectureLayers[activeLayer].badge}
                  </span>
                  <span className="text-xs font-bold text-stone-400">•</span>
                  <span className="text-xs font-bold text-emerald-600">Benchmark: {architectureLayers[activeLayer].metric}</span>
                </div>

                <h4 className="text-xl font-extrabold text-stone-900">
                  {architectureLayers[activeLayer].name}
                </h4>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                  {architectureLayers[activeLayer].description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {architectureLayers[activeLayer].specs.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-stone-800">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1C1917] text-white p-6 rounded-2xl border border-stone-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-[10px] text-stone-400">
                  <span>TELEMETRY</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
                  </span>
                </div>
                <p className="text-amber-400 font-bold">{architectureLayers[activeLayer].metric}</p>
                <p className="text-[11px] text-stone-400 leading-normal">
                  All system nodes operating at nominal enterprise SLA thresholds.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Platform Pillars Section */}
        <div className="space-y-10 pt-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-[#B45309] rounded-full text-[11px] font-extrabold uppercase tracking-widest">
              <Server size={13} />
              <span>Core Platform Pillars</span>
            </div>
            <h3 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              Engineered for <span className="cursive-accent font-normal text-[#B45309] text-3xl sm:text-4xl align-middle px-1">Speed, Scale &amp; Reliability</span>
            </h3>
            <p className="text-sm text-stone-600 max-w-xl mx-auto">
              Everything required to plan, promote, ticket, and operate conferences with zero friction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white rounded-3xl p-6 border border-[#EFE8DA] shadow-sm hover:shadow-lg transition-shadow space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#EFE8DA] flex items-center justify-center">
                  {pillar.icon}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-stone-900">{pillar.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed mt-2">{pillar.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Specifications Strip */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#1C1917] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-white/10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-stone-800">
            {platformSpecs.map((spec, idx) => (
              <div key={idx} className="pt-4 md:pt-0 space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold text-[#C28E27] tracking-tight">{spec.value}</p>
                <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{spec.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Bar */}
        <div className="bg-gradient-to-r from-[#292524] to-[#1C1917] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Host Your Next Masterpiece Summit?
            </h3>
            <p className="text-xs sm:text-sm text-stone-400">
              Join enterprise organizers managing verified summits, conferences, and exhibitions with EventForge.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/explore"
              className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>Explore Active Conferences</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/login?tab=register"
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-6 py-3.5 rounded-xl border border-white/20 transition-all"
            >
              <span>Register Organizer Account</span>
            </Link>
          </div>
        </div>

      </section>

    </div>
  );
}
