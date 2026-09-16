import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Clock, CheckCircle, Ticket, Mail, User, ShieldCheck, ArrowRight, Calendar } from 'lucide-react';
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

  const { data: events } = useQuery({
    queryKey: ['public-events-list'],
    queryFn: () => api.get('/events')
  });

  const handleJoin = (e) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setJoined(true);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: 'VIP Priority Waitlist' }]} />

      <div className="bg-white rounded-3xl border border-[#EFE8DA] p-8 sm:p-12 shadow-xl text-center space-y-8 mt-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-[#B45309] flex items-center justify-center mx-auto shadow-inner">
          <Clock size={32} />
        </div>

        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest bg-amber-50 text-[#B45309] border border-amber-200 px-3.5 py-1 rounded-full">
            Early Access &amp; Sold-Out Pass Notification
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-stone-900 tracking-tight">
            Join the <span className="cursive-accent font-normal text-[#B45309] text-4xl md:text-6xl align-middle px-1.5">Priority Waitlist</span>
          </h1>
          <p className="text-sm md:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
            Never miss out on sold-out keynotes, executive workshops, or limited early bird allocations. When spots unlock, waitlisted attendees receive instant first-priority checkout links.
          </p>
        </div>

        {joined ? (
          <div className="bg-gradient-to-br from-emerald-50 to-[#FAF8F5] border border-emerald-200 rounded-3xl p-8 max-w-md mx-auto space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-stone-900">You're on the Priority List!</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We've registered <strong>{email}</strong> for instant notifications. When a pass unlocks, your private reservation code will be emailed immediately.
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
          </div>
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
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#B45309]"
                />
                <User size={15} className="absolute left-3 top-3 text-stone-400" />
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
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#B45309]"
                />
                <Mail size={15} className="absolute left-3 top-3 text-stone-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Select Summit (Optional)</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#B45309]"
              >
                <option value="">All Flagship Summits (General Priority)</option>
                {events?.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-[#B45309]/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={14} />
              <span>Join Priority Waitlist</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
