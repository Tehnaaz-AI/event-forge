import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Sparkles, Clock, CheckCircle, Ticket, Mail, User, 
  ShieldCheck, ArrowRight, Calendar, BellRing, Zap, Check, Lock, LogIn, UserPlus
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import useDocumentTitle from '../../components/common/useDocumentTitle';

export default function WaitlistPage() {
  useDocumentTitle('VIP Waitlist & Early Access', 'Join the priority queue for sold-out summits and early bird tiers.');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventParam = searchParams.get('event') || searchParams.get('eventId') || '';
  const user = JSON.parse(localStorage.getItem('eventforge_user') || 'null');

  const [selectedEvent, setSelectedEvent] = useState(eventParam);
  const [joined, setJoined] = useState(false);
  const [queueNumber, setQueueNumber] = useState(1);
  const [isAlreadyConfirmed, setIsAlreadyConfirmed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: events } = useQuery({
    queryKey: ['public-events-list'],
    queryFn: () => api.get('/events')
  });

  useEffect(() => {
    if (eventParam) {
      setSelectedEvent(eventParam);
    } else if (events && events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0]._id);
    }
  }, [eventParam, events]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=/waitlist');
      return;
    }

    const targetEventId = selectedEvent || events?.[0]?._id;
    if (!targetEventId) {
      setErrorMessage('Please select an active conference to join its VIP waitlist.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.post(`/events/${targetEventId}/waitlist/join`);
      if (res?.alreadyConfirmed) {
        setIsAlreadyConfirmed(true);
        setStatusMessage(res.message || 'You already hold an active confirmed pass for this conference.');
      } else {
        setIsAlreadyConfirmed(false);
        setQueueNumber(res?.position || 1);
        setStatusMessage(res?.message || 'You are registered in the VIP priority waitlist queue.');
      }
      setJoined(true);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to secure VIP waitlist position.');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* 🔒 AUTHENTICATION GATE CHECK 🔒 */}
        {!user ? (
          <div className="bg-gradient-to-br from-[#FDFAF5] to-[#F5F2EB] border border-[#EFE8DA] rounded-3xl p-8 max-w-lg mx-auto space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center mx-auto">
              <Lock size={22} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-stone-900">Authentication Required</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                To prevent automated reservation bots and guarantee priority seat reservation under your verified delegate profile, please sign in or create an account.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                to="/login?redirect=/waitlist"
                className="bg-[#B45309] hover:bg-[#92400E] text-white py-3 px-4 rounded-xl text-xs font-bold shadow-md shadow-[#B45309]/20 transition-all flex items-center justify-center gap-2"
              >
                <LogIn size={14} />
                <span>Sign In to Account</span>
              </Link>

              <Link
                to="/login?tab=register&redirect=/waitlist"
                className="bg-white hover:bg-stone-50 border border-[#EFE8DA] text-stone-800 py-3 px-4 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus size={14} className="text-[#B45309]" />
                <span>Register Account</span>
              </Link>
            </div>
          </div>
        ) : joined ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-50 to-[#FAF8F5] border border-emerald-200 rounded-3xl p-8 max-w-md mx-auto space-y-4 shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-stone-900">
                {isAlreadyConfirmed ? 'Confirmed Pass Active' : "You're on the VIP Priority List!"}
              </h3>
              {!isAlreadyConfirmed && (
                <p className="text-xs font-bold text-emerald-700">Estimated Priority Queue Position: #{queueNumber}</p>
              )}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {isAlreadyConfirmed 
                ? 'Your delegate account already holds a valid, active pass for this conference. You do not need to wait in the standby queue.'
                : `We've registered your verified account ${user.email}. When a pass tier unlocks, your private reservation code will be activated immediately.`
              }
            </p>

            <div className="pt-2 flex flex-col gap-2 items-center">
              {isAlreadyConfirmed ? (
                <Link
                  to="/dashboard/attendee"
                  className="inline-flex items-center gap-2 bg-[#B45309] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  <span>View Pass &amp; QR Badge in Dashboard</span>
                  <ArrowRight size={13} />
                </Link>
              ) : (
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#B45309] hover:underline"
                >
                  <span>Browse Other Active Conferences</span>
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleJoin} className="max-w-md mx-auto space-y-4 text-left">
            
            {/* Verified Account Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-900 truncate">Verified: {user.name}</p>
                  <p className="text-[10px] text-emerald-700 truncate">{user.email}</p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                AUTHENTICATED
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Target Summit for VIP Priority</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-3 text-xs text-stone-900 focus:outline-none focus:border-[#B45309] transition-colors font-medium"
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
              disabled={isSubmitting}
              className="w-full bg-[#B45309] hover:bg-[#92400E] text-white py-3.5 rounded-xl text-xs font-bold shadow-md shadow-[#B45309]/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider mt-4"
            >
              <BellRing size={15} />
              <span>{isSubmitting ? 'Securing Priority Spot...' : 'Claim VIP Queue Position'}</span>
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
