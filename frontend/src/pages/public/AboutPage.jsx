import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Cpu, Calendar, Users, Award, Sparkles, 
  ArrowRight, CheckCircle2, Globe, Building, Zap, Lock 
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans selection:bg-[#B45309] selection:text-white pb-24">
      
      {/* Luxury Hero Banner */}
      <section className="bg-gradient-to-b from-[#FDFAF5] via-[#FAF8F5] to-[#F5F2EB] border-b border-[#EFE8DA] pt-20 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#B45309]/5 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <span className="px-4 py-1.5 bg-white text-[#B45309] border border-[#EFE8DA] rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-block shadow-xs">
            Enterprise Event Operations
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight">
            The Operating System for <br />
            <span className="logo-cursive font-bold text-[#B45309] text-5xl sm:text-7xl block mt-1">
              World-Class Summits
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-light">
            EventForge was architected to eliminate the fragmentation, scheduling collisions, and manual gatekeeper friction inherent in modern corporate conferences.
          </p>
        </div>
      </section>

      {/* Main Philosophy & Mission Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 space-y-20">
        
        {/* Mission Statement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-widest">Our Engineering Mission</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-snug">
              Precision Infrastructure for High-Stakes Corporate Events
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              When Fortune 500 enterprises, academic institutions, and industry guilds convene thousands of delegates, software failure is not an option. EventForge combines autonomous AI intelligence with high-throughput transactional backends to power seamless event lifecycles.
            </p>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={13} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Guaranteed Conflict-Free Agenda Scheduling</h4>
                  <p className="text-[11px] text-stone-500">Autonomous mathematical collision engines prevent double-booked rooms and overlapping speakers.</p>
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
                  <h4 className="text-xs font-bold text-stone-900">Autonomous AI Content Studio & Matchmaking</h4>
                  <p className="text-[11px] text-stone-500">Instant generation of promotional copy, session descriptions, and attendee interest-matched itineraries.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#EFE8DA] rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B45309]/5 rounded-bl-full pointer-events-none"></div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider">Enterprise Multi-Tenancy</span>
              <h3 className="text-xl font-extrabold text-stone-900">Four Dedicated Role Surfaces</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] space-y-1">
                <p className="text-xs font-bold text-rose-800">Master Admin</p>
                <p className="text-[10px] text-stone-500">Platform-wide user management, cross-tenant event purge, and telemetry.</p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] space-y-1">
                <p className="text-xs font-bold text-amber-800">Event Organizer</p>
                <p className="text-[10px] text-stone-500">Multi-track builder, speaker directory, sponsor deliverables, and analytics.</p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] space-y-1">
                <p className="text-xs font-bold text-orange-800">Door Staff</p>
                <p className="text-[10px] text-stone-500">Live WebRTC optical check-in, arrival feeds, and audio validation.</p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] space-y-1">
                <p className="text-xs font-bold text-emerald-800">Attendee Pass</p>
                <p className="text-[10px] text-stone-500">Digital wallet passes, printable lanyard badges, and post-event feedback.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#EFE8DA] flex items-center justify-between text-xs font-bold text-stone-700">
              <span>Security &amp; Tenant Isolation</span>
              <span className="text-emerald-600 flex items-center gap-1"><ShieldCheck size={14} /> SOC2 / JWT Verified</span>
            </div>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="bg-[#1C1917] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
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
