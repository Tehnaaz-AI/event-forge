import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, Calendar, ShieldCheck, Users, Sparkles, CheckCircle2, 
  ArrowRight, QrCode, TrendingUp, Layers, Lock, Compass, Zap, Play, Check
} from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import useDocumentTitle from '../../components/common/useDocumentTitle';

export default function FeaturesPage() {
  useDocumentTitle('Platform Architecture & Capabilities', 'Explore zero-conflict scheduling, AI content studios, sub-second QR gatekeepers, and enterprise multi-tenancy.');

  const [activeSim, setActiveSim] = useState('scanner'); // 'scanner' | 'conflict' | 'ai'
  const [simRunning, setSimRunning] = useState(false);
  const [simOutput, setSimOutput] = useState(null);

  const runSimulation = () => {
    setSimRunning(true);
    setSimOutput(null);

    setTimeout(() => {
      setSimRunning(false);
      if (activeSim === 'scanner') {
        setSimOutput({
          status: 'VALIDATED',
          latency: '88ms',
          ticket: 'EF-VIP-2026-904',
          attendee: 'Executive Delegate',
          audioChime: 'High-Pitch Success 880Hz'
        });
      } else if (activeSim === 'conflict') {
        setSimOutput({
          status: 'OPTIMAL',
          conflictsDetected: 0,
          roomsValidated: 6,
          parallelTracks: 4,
          speakerAvailability: '100% Guaranteed'
        });
      } else {
        setSimOutput({
          status: 'GENERATED',
          campaignType: 'LinkedIn Executive Announcement',
          copy: '🚀 Thrilled to announce FutureTech Global Summit 2026! Join 1,200+ industry pioneers exploring generative systems and cloud security. Early bird passes active.',
          hashtags: '#FutureTech2026 #EnterpriseSummit #AILeadership'
        });
      }
    }, 600);
  };

  const features = [
    {
      icon: <Calendar size={28} className="text-[#B45309]" />,
      title: 'Conflict-Free Multi-Track Scheduling',
      description: 'Zero speaker double-booking and room overlap guarantees. The scheduling engine mathematically validates time slots and room capacities in real-time.'
    },
    {
      icon: <Cpu size={28} className="text-[#B45309]" />,
      title: 'AI Content & Marketing Studio',
      description: 'Generate multi-channel marketing campaigns (LinkedIn, X/Twitter, and Email blasts), speaker bios, and AI-curated attendee agendas in seconds.'
    },
    {
      icon: <QrCode size={28} className="text-[#B45309]" />,
      title: 'WebRTC Optical QR Door Scanner',
      description: 'High-speed hands-free badge scanning directly from staff mobile or webcam devices, with instant Web Audio chimes and duplicate entry prevention.'
    },
    {
      icon: <ShieldCheck size={28} className="text-[#B45309]" />,
      title: 'Atomic Inventory & Ticket Tiers',
      description: 'MongoDB transaction-safe reservations preventing overselling, tiered pricing with coupon codes (`SAVE20`), and automated waitlist pipelines.'
    },
    {
      icon: <Users size={28} className="text-[#B45309]" />,
      title: 'Sponsor ROI & Deliverable Tracking',
      description: 'Tiered sponsorship package allocation (Titanium, Platinum, Gold) and real-time deliverable milestone status checklists.'
    },
    {
      icon: <TrendingUp size={28} className="text-[#B45309]" />,
      title: 'Recharts Real-Time Telemetry',
      description: 'Interactive registration velocity area charts, ticket tier share donuts, live door scanned ratios, and attendee star review feeds.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 text-stone-900 font-sans">
      
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#FDFAF5] to-[#F5F2EB] border-b border-[#EFE8DA] pt-8 pb-20 px-6">
        <div className="max-w-5xl mx-auto px-4 mb-4">
          <Breadcrumbs items={[{ label: 'Platform Capabilities' }]} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center space-y-4"
        >
          <span className="px-3.5 py-1 bg-white text-[#B45309] border border-[#EFE8DA] rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-block shadow-xs">
            Architecture &amp; Capabilities
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-stone-900">
            Enterprise Event <span className="cursive-accent font-normal text-[#B45309] text-5xl md:text-7xl align-middle px-1.5">Infrastructure</span>
          </h1>
          <p className="text-sm md:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed font-light">
            Engineered from the ground up for high-scale corporate conferences, multi-track exhibitions, and global summits with guaranteed sub-second response times.
          </p>
        </motion.div>
      </section>

      {/* Interactive Live Architecture Simulator Section */}
      <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl border border-[#EFE8DA] p-6 sm:p-8 shadow-2xl space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B45309] bg-amber-50 px-2.5 py-0.5 rounded-full">
                Interactive Simulator
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-stone-900">
                Experience EventForge Engine in Real-Time
              </h3>
            </div>

            {/* Sim Switcher Tabs */}
            <div className="flex p-1 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] text-xs font-bold text-stone-600">
              <button
                onClick={() => { setActiveSim('scanner'); setSimOutput(null); }}
                className={`px-3 py-1.5 rounded-xl transition-all ${activeSim === 'scanner' ? 'bg-[#B45309] text-white shadow-xs' : 'hover:text-stone-900'}`}
              >
                QR Scanner
              </button>
              <button
                onClick={() => { setActiveSim('conflict'); setSimOutput(null); }}
                className={`px-3 py-1.5 rounded-xl transition-all ${activeSim === 'conflict' ? 'bg-[#B45309] text-white shadow-xs' : 'hover:text-stone-900'}`}
              >
                Conflict Engine
              </button>
              <button
                onClick={() => { setActiveSim('ai'); setSimOutput(null); }}
                className={`px-3 py-1.5 rounded-xl transition-all ${activeSim === 'ai' ? 'bg-[#B45309] text-white shadow-xs' : 'hover:text-stone-900'}`}
              >
                AI Content
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <h4 className="text-base font-extrabold text-stone-900">
                {activeSim === 'scanner' && 'Sub-Second Optical Gatekeeper Validation'}
                {activeSim === 'conflict' && 'Autonomous Collision-Free Schedule Verification'}
                {activeSim === 'ai' && 'AI Multi-Channel Marketing Synthesis'}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {activeSim === 'scanner' && 'Simulate an attendee scanning their pass at a high-volume convention entrance. Measures decoding latency and cryptographic signature verification.'}
                {activeSim === 'conflict' && 'Test our mathematical constraint solver verifying 4 simultaneous tracks, 12 keynote speakers, and 6 breakout halls with zero collisions.'}
                {activeSim === 'ai' && 'Synthesize an enterprise keynote announcement formatted with executive tone and high-conversion copy.'}
              </p>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={runSimulation}
                disabled={simRunning}
                className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold py-3 px-6 rounded-xl shadow-md shadow-[#B45309]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {simRunning ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Executing Simulation...
                  </span>
                ) : (
                  <>
                    <Play size={13} fill="currentColor" />
                    <span>Run Live Engine Test</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Sim Output Visualizer */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EFE8DA] font-mono text-xs space-y-3 min-h-[160px] flex flex-col justify-center">
              {simRunning && (
                <div className="text-center py-6 space-y-2 text-[#B45309]">
                  <div className="w-6 h-6 border-2 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-[11px] font-bold">Simulating high-concurrency request...</p>
                </div>
              )}

              {!simRunning && !simOutput && (
                <div className="text-center py-6 text-stone-400 space-y-1 font-sans">
                  <Zap size={24} className="mx-auto text-amber-500/70" />
                  <p className="text-xs font-semibold text-stone-600">Simulator Idle</p>
                  <p className="text-[11px] text-stone-400">Click "Run Live Engine Test" to benchmark system response.</p>
                </div>
              )}

              {!simRunning && simOutput && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2 text-stone-800 font-sans">
                  <div className="flex items-center justify-between border-b border-stone-200/70 pb-2">
                    <span className="text-[10px] font-mono uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                      <Check size={12} /> {simOutput.status}
                    </span>
                    {simOutput.latency && (
                      <span className="text-[11px] font-mono text-[#B45309] font-bold">
                        ⚡ Latency: {simOutput.latency}
                      </span>
                    )}
                  </div>

                  {activeSim === 'scanner' && (
                    <div className="space-y-1 text-xs">
                      <p><span className="font-bold text-stone-500">Badge ID:</span> <span className="font-mono">{simOutput.ticket}</span></p>
                      <p><span className="font-bold text-stone-500">Validation:</span> {simOutput.attendee} Authorized</p>
                      <p className="text-[11px] text-emerald-600 font-semibold">🔊 Instant Web Audio Chime Fired</p>
                    </div>
                  )}

                  {activeSim === 'conflict' && (
                    <div className="space-y-1 text-xs">
                      <p><span className="font-bold text-stone-500">Conflicts Detected:</span> <span className="font-bold text-emerald-600">{simOutput.conflictsDetected}</span></p>
                      <p><span className="font-bold text-stone-500">Halls Verified:</span> {simOutput.roomsValidated} Concurrent Breakouts</p>
                      <p className="text-[11px] text-emerald-600 font-semibold">✨ Agenda Mathematical Integrity: 100%</p>
                    </div>
                  )}

                  {activeSim === 'ai' && (
                    <div className="space-y-1.5 text-xs">
                      <p className="text-stone-700 italic">"{simOutput.copy}"</p>
                      <p className="text-[10px] text-[#B45309] font-bold">{simOutput.hashtags}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Grid of 6 Core Pillars */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="bg-white p-8 rounded-3xl border border-[#EFE8DA] shadow-sm hover:shadow-xl hover:border-[#B45309]/40 transition-all space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#B45309]/10 flex items-center justify-center font-bold">
                {feat.icon}
              </div>
              <h3 className="text-xl font-extrabold text-stone-900 leading-snug">{feat.title}</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">{feat.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Card in Luxury Ivory */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-white border border-[#EFE8DA] rounded-3xl p-10 text-center shadow-lg max-w-3xl mx-auto space-y-6"
        >
          <span className="px-3 py-1 bg-[#B45309]/10 text-[#B45309] rounded-full text-xs font-extrabold uppercase tracking-wider">
            Ready to Plan Your Next Summit?
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Launch Your <span className="cursive-accent font-normal text-[#B45309] text-4xl md:text-5xl align-middle px-1">Conference Workspace</span> in Minutes
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/login?tab=register"
                className="bg-[#B45309] hover:bg-[#92400E] text-white px-8 py-3.5 rounded-2xl font-bold text-xs shadow-md uppercase tracking-wider flex items-center gap-2"
              >
                Get Started Free <ArrowRight size={14} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/explore"
                className="bg-[#FAF8F5] border border-[#EFE8DA] text-stone-700 px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-stone-100"
              >
                Explore Conferences
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
