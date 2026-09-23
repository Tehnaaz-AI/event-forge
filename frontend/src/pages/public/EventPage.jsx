import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Users, Ticket as TicketIcon, Sparkles, 
  Building, Clock, ArrowRight, Lock, UserPlus, X, Check, ShieldCheck, Tag,
  Bookmark, BookmarkCheck, Share2, Layers, Filter, Shield, ShieldAlert,
  QrCode, ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import TicketCheckout from './TicketCheckout';
import AISessionFinder from '../../components/public/AISessionFinder';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import FAQSection from '../../components/common/FAQSection';
import EventReviewsSection from '../../components/common/EventReviewsSection';
import useDocumentTitle from '../../components/common/useDocumentTitle';

export default function EventPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [preselectedTicketId, setPreselectedTicketId] = useState(null);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');
  
  const user = JSON.parse(localStorage.getItem('eventforge_user') || 'null');
  const isOperator = user?.role === 'STAFF' || user?.role === 'PLATFORM_ADMIN';

  const [bookmarkedSessions, setBookmarkedSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('eventforge_bookmarked_sessions') || '[]');
    } catch {
      return [];
    }
  });

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['public-event', slug],
    queryFn: () => api.get(`/events/public/${slug}`)
  });

  useDocumentTitle(
    event ? `${event.title} | EventForge Passes & Schedule` : 'Conference Overview',
    event ? event.description : 'Official conference pass registration and multi-track schedule.'
  );

  // Auto-open checkout if redirected back after authenticating or if checkout param present
  useEffect(() => {
    if (searchParams.get('checkout') === 'true' && !isOperator) {
      setCheckoutOpen(true);
    }
  }, [searchParams, isOperator]);

  const handleOpenCheckout = (ticketCategoryId = null) => {
    if (isOperator) {
      if (user?.role === 'STAFF') {
        navigate('/staff/scanner');
      } else {
        navigate('/admin');
      }
      return;
    }
    if (ticketCategoryId) {
      setPreselectedTicketId(ticketCategoryId);
    }
    setCheckoutOpen(true);
  };

  const toggleBookmark = (sessionId) => {
    let updated;
    if (bookmarkedSessions.includes(sessionId)) {
      updated = bookmarkedSessions.filter(id => id !== sessionId);
    } else {
      updated = [...bookmarkedSessions, sessionId];
    }
    setBookmarkedSessions(updated);
    try {
      localStorage.setItem('eventforge_bookmarked_sessions', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-3 text-stone-500 font-sans">
        <div className="w-10 h-10 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-wider">Loading conference agenda &amp; passes...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <h2 className="text-2xl font-extrabold text-stone-900">Conference Not Found</h2>
        <p className="text-xs text-stone-500">The requested event is either not published or has concluded.</p>
        <Link to="/explore" className="text-xs font-bold text-[#B45309] hover:underline">
          &larr; Return to Featured Conferences
        </Link>
      </div>
    );
  }

  // Extract unique rooms/tracks
  const availableRooms = ['ALL', ...Array.from(new Set(event.sessions?.map(s => s.room).filter(Boolean)))];
  const filteredSessions = event.sessions?.filter(s => selectedRoomFilter === 'ALL' || s.room === selectedRoomFilter) || [];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 text-stone-900 font-sans selection:bg-[#B45309] selection:text-white">
      
      {/* Breadcrumb Bar */}
      <div className="max-w-6xl mx-auto px-6 pt-4">
        <Breadcrumbs items={[{ label: 'Explore Summits', path: '/explore' }, { label: event.title }]} />
      </div>

      {/* Luxury Editorial Hero Section */}
      <section className="bg-gradient-to-b from-[#FDFAF5] via-[#FAF8F5] to-[#F5F2EB] border-b border-[#EFE8DA] pt-8 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-3.5 py-1 bg-white text-[#B45309] border border-[#EFE8DA] rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-block shadow-xs"
          >
            {event.category || 'Executive Summit'}
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-stone-900 leading-tight"
          >
            {event.title}
          </motion.h1>
          
          <p className="text-base md:text-lg text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
            {event.description}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-stone-700">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#EFE8DA] shadow-xs">
              <Calendar className="text-[#B45309]" size={16}/> 
              <span>{new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {event.venue?.name && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#EFE8DA] shadow-xs">
                <MapPin className="text-amber-700" size={16}/> 
                <span>{event.venue.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#EFE8DA] shadow-xs">
              <Building className="text-[#B45309]" size={16}/> 
              <span>{event.organization?.name || 'Executive Host'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Sticky Action Bar */}
      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 flex flex-col md:flex-row items-center justify-between border border-[#EFE8DA] gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center font-bold">
              <Building size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Presented by</p>
              <p className="text-base font-extrabold text-stone-900">{event.organization?.name || 'Executive Host'}</p>
            </div>
          </div>

          {user?.role === 'STAFF' ? (
            <Link
              to="/staff/scanner"
              className="w-full md:w-auto bg-stone-900 hover:bg-stone-800 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <QrCode size={18} className="text-[#C28E27]" />
              Door Entrance Scanner
            </Link>
          ) : user?.role === 'PLATFORM_ADMIN' ? (
            <Link
              to="/admin"
              className="w-full md:w-auto bg-stone-900 hover:bg-stone-800 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Shield size={18} className="text-[#C28E27]" />
              Manage in Admin Console
            </Link>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleOpenCheckout()}
              className="w-full md:w-auto bg-[#B45309] hover:bg-[#92400E] text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-[#B45309]/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <TicketIcon size={18} />
              Secure Passes Now
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Section 1: Ticket Passes & Pricing Tiers */}
      <section className="max-w-5xl mx-auto px-6 mt-16 space-y-8">
        <div className="border-b border-[#EFE8DA] pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Conference <span className="cursive-accent font-normal text-gradient-shimmer text-glow-accent text-float-subtle text-3xl sm:text-4xl align-middle px-1">Passes &amp; Admission</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {isOperator 
                ? 'Operator account: Ticket purchasing is restricted for Staff & Administrators.'
                : 'Select your pass tier for instant digital QR badge issuance'}
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
            <ShieldCheck size={15} /> Official Authorized Registration
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {event.ticketCategories?.map((tier, idx) => {
            const isAvailable = (tier.availableQuantity ?? tier.capacity ?? 1) > 0;
            return (
              <motion.div 
                key={tier._id || idx}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-6 ${
                  idx === 0 
                    ? 'border-[#B45309] shadow-lg shadow-[#B45309]/5 ring-2 ring-[#B45309]/10' 
                    : 'border-[#EFE8DA] shadow-sm hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B45309] bg-amber-50 px-2.5 py-1 rounded-full">
                      Tier {idx + 1}
                    </span>
                    {isAvailable ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {tier.availableQuantity !== undefined ? `${tier.availableQuantity} Left` : 'Available'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                        Sold Out (Waitlist)
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-stone-900">{tier.name}</h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">{tier.description || 'Full conference access, keynotes, masterclasses, and networking.'}</p>
                  </div>

                  <div className="pt-2">
                    <p className="text-3xl font-extrabold text-stone-900">
                      {tier.price === 0 ? 'Free' : `$${tier.price}`}
                    </p>
                    <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Per Delegate</p>
                  </div>
                </div>

                {user?.role === 'STAFF' ? (
                  <Link
                    to="/staff/scanner"
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white shadow-xs"
                  >
                    <QrCode size={14} className="text-[#C28E27]" />
                    <span>Door Scanner Access</span>
                  </Link>
                ) : user?.role === 'PLATFORM_ADMIN' ? (
                  <Link
                    to="/admin"
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white shadow-xs"
                  >
                    <Shield size={14} className="text-[#C28E27]" />
                    <span>Admin Oversight</span>
                  </Link>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenCheckout(tier._id)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isAvailable 
                        ? 'bg-[#B45309] hover:bg-[#92400E] text-white shadow-md shadow-[#B45309]/20' 
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    <TicketIcon size={14} />
                    <span>{isAvailable ? `Select ${tier.name}` : 'Join Waitlist'}</span>
                  </motion.button>
                )}
              </motion.div>
            );
          })}

          {(!event.ticketCategories || event.ticketCategories.length === 0) && (
            <div className="col-span-3 bg-white p-8 rounded-3xl border border-[#EFE8DA] text-center space-y-4">
              <TicketIcon size={32} className="mx-auto text-[#B45309]" />
              <h4 className="text-base font-bold text-stone-900">Standard Delegate Pass</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Secure your general admission pass with instant QR badge issuance.
              </p>
              {!isOperator && (
                <button
                  onClick={() => handleOpenCheckout()}
                  className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold py-3 px-6 rounded-xl shadow-md cursor-pointer"
                >
                  Secure Delegate Pass ($299)
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Agenda Grid & Sidebar */}
      <div className="max-w-5xl mx-auto px-6 mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Left Column: Multi-Track Schedule */}
        <div className="md:col-span-2 space-y-6">
          <div className="border-b border-[#EFE8DA] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Conference <span className="cursive-accent font-normal text-[#B45309] text-3xl sm:text-4xl align-middle px-1">Itinerary &amp; Keynotes</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Multi-track sessions, masterclasses, and executive panels</p>
            </div>

            {/* Room / Track Filter Buttons */}
            {availableRooms.length > 2 && (
              <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
                {availableRooms.map(room => (
                  <button
                    key={room}
                    onClick={() => setSelectedRoomFilter(room)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      selectedRoomFilter === room 
                        ? 'bg-[#B45309] text-white shadow-xs' 
                        : 'bg-white border border-[#EFE8DA] text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    {room}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {filteredSessions.map(session => {
              const isBookmarked = bookmarkedSessions.includes(session._id);
              return (
                <motion.div 
                  key={session._id} 
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm hover:shadow-md transition-all space-y-3 relative"
                >
                  <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-start">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-stone-900">{session.title}</h3>
                      <p className="text-xs text-[#B45309] font-semibold flex items-center gap-1.5">
                        <Clock size={13} />
                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      <span className="bg-[#FAF8F5] border border-[#EFE8DA] text-stone-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {session.room}
                      </span>
                      
                      {/* Interactive Bookmark Button */}
                      <button
                        onClick={() => toggleBookmark(session._id)}
                        title={isBookmarked ? 'Remove from personal agenda' : 'Bookmark to personal agenda'}
                        className={`p-1.5 rounded-xl border transition-all ${
                          isBookmarked 
                            ? 'bg-amber-100 text-[#B45309] border-amber-300' 
                            : 'bg-[#FAF8F5] text-stone-400 border-[#EFE8DA] hover:text-[#B45309]'
                        }`}
                      >
                        {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                    </div>
                  </div>

                  {session.description && (
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {session.description}
                    </p>
                  )}

                  {session.speakers?.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {session.speakers.map(speaker => (
                        <div 
                          key={speaker._id} 
                          className="flex items-center gap-2 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#EFE8DA]"
                        >
                          <div className="w-6 h-6 rounded-full bg-[#B45309]/10 text-[#B45309] flex items-center justify-center text-[10px] font-bold">
                            {speaker.name?.charAt(0) || 'S'}
                          </div>
                          <span className="text-xs font-bold text-stone-800">{speaker.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {filteredSessions.length === 0 && (
              <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-[#EFE8DA] text-stone-500 text-xs">
                No sessions listed in this track or room yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Finder & Sponsors */}
        <div className="space-y-8">
          <AISessionFinder eventId={event._id} />
          
          {event.sponsors?.length > 0 && (
            <section className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm text-center space-y-4">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Proud Partners &amp; Sponsors</h3>
              <div className="space-y-3">
                {event.sponsors.map(sponsor => (
                  <div key={sponsor._id} className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA]">
                    <p className="font-extrabold text-stone-900 text-sm">{sponsor.organization?.name || sponsor.name}</p>
                    <p className="text-[10px] font-bold text-[#B45309] mt-0.5 uppercase tracking-wider">{sponsor.package?.name || 'Official'} Partner</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

      </div>

      {/* Verified Post-Event Reviews Section */}
      <EventReviewsSection event={event} />

      {/* Comprehensive FAQs Section */}
      <FAQSection />

      {/* Checkout Modal */}
      {checkoutOpen && !isOperator && (
        <TicketCheckout 
          event={event} 
          initialCategoryId={preselectedTicketId}
          onClose={() => {
            setCheckoutOpen(false);
            setPreselectedTicketId(null);
          }} 
        />
      )}
    </div>
  );
}
