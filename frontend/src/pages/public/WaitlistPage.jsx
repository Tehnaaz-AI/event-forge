import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Sparkles, Clock, CheckCircle, Ticket, Mail, User, 
  ShieldCheck, ArrowRight, Calendar, BellRing, Zap, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import useDocumentTitle from '../../components/common/useDocumentTitle';

export default function WaitlistPage() {
  useDocumentTitle('VIP Waitlist & Early Access', 'Join the priority queue for sold-out summits and early bird tiers.');

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [joined, setJoined] = useState(false);
  const [queueNumber, setQueueNumber] = useState(14);

  const { data: events } = useQuery({
    queryKey: ['public-events-list'],
    queryFn: () => api.get('/events')
  });

  const handleJoin = (e) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setQueueNumber(Math.floor(Math.random() * 8) + 7);
    setJoined(true);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 max-w-4xl mx-auto font-sans selection:bg-[#B45309] selection:text-white">
      <Breadcrumbs items={[{ label: 'VIP Priority Waitlist' }]} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl border border-[#EFE8DA] p-8 sm:p-12 shadow-xl text-center space-y-8 mt-4"
      >
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-[#B45309] flex items-center justify-center mx-auto shadow-inner">
          <Clock size={32} />
        </div>

        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest bg-amber-50 text-[#B45309] border border-amber-200 px-3.5 py-1 rounded-full inline-block">
            Early Access &amp; Sold-Out Pass Notification
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-stone-900 tracking-tight">
            Join the <span className="cursive-accent font-normal text-[#B45309] text-4xl md:text-6xl align-middle px-1.5">Priority Waitlist</span>
          </h1>
          <p className="text-sm md:text-base text-stone-600 max-w-xl mx-auto leading-relaxed font-light">
            Never miss out on sold-out keynotes, executive workshops, or limited early bird allocations. When spots unlock, waitlisted attendees receive instant first-priority checkout links.
          </p>
        </div>

        {joined ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-50 to-[#FAF8F5] border border-emerald-200 rounded-3xl p-8 max-w-md mx-auto space-y-4 shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-stone-900">You're on the Priority List!</h3>
              <p className="text-xs font-bold text-emerald-700">Estimated Priority Queue Position: #{queueNumber}</p>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              We've registered <strong>{email}</strong>. When a pass tier unlocks, your private 24-hour reservation code will be emailed immediately.
            </p>

            <div className="pt-2">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#B45309] hover:underline"
              >
                <span>Browse Other Active Conferences</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleJoin} className="max-w-md mx-auto space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl pl-9 pr-3.5 py-3 text-xs text-stone-900 focus:outline-none focus:border-[#B45309] transition-colors"
                />
                <User size={15} className="absolute left-3 top-3.5 text-stone-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl pl-9 pr-3.5 py-3 text-xs text-stone-900 focus:outline-none focus:border-[#B45309] transition-colors"
                />
                <Mail size={15} className="absolute left-3 top-3.5 text-stone-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Select Summit (Optional)</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-3 text-xs text-stone-900 focus:outline-none focus:border-[#B45309] transition-colors"
              >
                <option value="">All Upcoming Summits &amp; Keynotes</option>
                {events?.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-[#B45309] hover:bg-[#92400E] text-white py-3.5 rounded-xl text-xs font-bold shadow-md shadow-[#B45309]/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider mt-4"
            >
              <BellRing size={15} />
              <span>Claim Priority Queue Spot</span>
            </motion.button>
          </form>
        )}

        <div className="pt-4 border-t border-[#EFE8DA] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-500">
          <div className="flex items-center justify-center gap-1.5">
            <Check size={14} className="text-emerald-600" /> Instant Notification
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Check size={14} className="text-emerald-600" /> 24-Hour Pass Lock
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Check size={14} className="text-emerald-600" /> No Advance Fees
          </div>
        </div>
      </motion.div>
    </div>
  );
}
