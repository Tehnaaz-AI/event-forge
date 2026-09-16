import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, CheckCircle, Zap, Layers, Lock, 
  Cpu, ArrowRight, Star, Award, CheckCircle2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function TestimonialsSection() {
  const user = JSON.parse(localStorage.getItem('eventforge_user') || 'null');

  const enterpriseStandards = [
    {
      icon: <Layers className="text-[#B45309]" size={22} />,
      title: 'Zero-Collision Agenda Engine',
      metric: '100% Conflict-Free',
      description: 'Mathematical room and speaker constraint checking guarantees zero double-booking across multi-track stages.'
    },
    {
      icon: <Zap className="text-amber-600" size={22} />,
      title: 'Optical QR Gatekeeping',
      metric: '< 150ms Check-in',
      description: 'Client-side hardware accelerated camera decoding with instant audio chime handles peak attendee arrival rushes without lines.'
    },
    {
      icon: <ShieldCheck className="text-emerald-600" size={22} />,
      title: 'Multi-Tenant Security & RBAC',
      metric: 'SOC2 & JWT Ready',
      description: 'Strict cryptographic isolation across Platform Admins, Organizers, Door Staff, and Delegates with atomic booking locks.'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto font-sans">
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-[#B45309] rounded-full text-[11px] font-extrabold uppercase tracking-widest">
          <Award size={13} />
          <span>Enterprise Reliability Standards</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
          Engineered for <span className="cursive-accent font-normal text-[#B45309] text-4xl md:text-5xl align-middle px-1.5">Mission-Critical Summits</span>
        </h2>
        <p className="text-sm text-stone-600 max-w-lg mx-auto">
          High-concurrency infrastructure powering real-time multi-track conferences with zero friction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {enterpriseStandards.map((std, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white rounded-3xl p-6 border border-[#EFE8DA] shadow-xs hover:shadow-xl hover:border-[#B45309]/30 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#EFE8DA] flex items-center justify-center">
                  {std.icon}
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {std.metric}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-stone-900">
                {std.title}
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed font-light">
                {std.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#EFE8DA] flex items-center justify-between text-xs font-semibold text-stone-500">
              <span>Platform Verification</span>
              <span className="text-[#B45309] flex items-center gap-1 font-bold">
                <CheckCircle2 size={13} /> Active SLA
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
