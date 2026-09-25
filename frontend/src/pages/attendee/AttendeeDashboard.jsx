import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Ticket as TicketIcon, Calendar, MapPin, QrCode, Star, Send, 
  CheckCircle, Clock, Printer, Sparkles, Download, ShieldCheck, 
  Compass, User, Building, ArrowRight, Bookmark, Eye, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

// Helper to generate downloadable .ics calendar file
function downloadCalendarEvent(event) {
  const startDate = new Date(event.startDate || Date.now());
  const endDate = new Date(event.endDate || new Date(startDate.getTime() + 8 * 3600000));
  
  const formatDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventForge//Corporate Conference Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${event._id || Date.now()}@eventforge.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${event.title || 'Corporate Conference'}`,
    `DESCRIPTION:${event.description || 'Event registered via EventForge'}`,
    `LOCATION:${event.venue?.name || 'Convention Center'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${(event.title || 'event').replace(/\s+/g, '_')}_Schedule.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function AttendeeDashboard() {
  const user = JSON.parse(localStorage.getItem('eventforge_user') || '{}');

  const { data: myRegistrations, isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: () => api.get('/events/attendee/my-tickets'),
    refetchInterval: 5000,
    refetchOnWindowFocus: true
  });

  const { data: savedEvents = [], refetch: refetchSaved } = useQuery({
    queryKey: ['saved-events'],
    queryFn: () => api.get('/auth/saved-events')
  });

  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'saved' | 'ai-concierge'
  
  const removeSavedMutation = useMutation({
    mutationFn: (eventId) => api.delete(`/auth/saved-events/${eventId}`),
    onSuccess: () => {
      refetchSaved();
    }
  });

  const handleRemoveSavedEvent = (eventId) => {
    removeSavedMutation.mutate(eventId);
  };
  const [activeBadgeTicket, setActiveBadgeTicket] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ eventId: '', rating: 5, comments: '' });
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  // AI Concierge State
  const [userInterests, setUserInterests] = useState('Autonomous AI Agents, Distributed Systems & Enterprise Security');
  const [aiItinerary, setAiItinerary] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');

  const feedbackMutation = useMutation({
    mutationFn: (data) => api.post(`/events/${data.eventId}/feedback`, {
      rating: parseInt(data.rating),
      comments: data.comments
    }),
    onSuccess: () => {
      setFeedbackSuccess('Thank you! Your verified post-event review has been recorded.');
      setFeedbackError('');
      setFeedbackData({ eventId: '', rating: 5, comments: '' });
      setTimeout(() => setFeedbackSuccess(''), 5000);
    },
    onError: (err) => {
      setFeedbackError(err.response?.data?.message || 'Reviews can only be submitted after the conference has started or concluded.');
      setFeedbackSuccess('');
      setTimeout(() => setFeedbackError(''), 6000);
    }
  });

  const aiConciergeMutation = useMutation({
    mutationFn: ({ eventId, interests }) => api.post(`/events/${eventId}/ai/attendee-recommendations`, { interests }),
    onSuccess: (data) => {
      setAiItinerary(data.recommendations || data.content || String(data));
    }
  });

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackData.eventId) return;
    setFeedbackError('');
    feedbackMutation.mutate(feedbackData);
  };

  const handleGenerateItinerary = (e) => {
    e.preventDefault();
    const eventId = selectedEventId || myRegistrations?.[0]?.event?._id;
    if (!eventId) return;
    aiConciergeMutation.mutate({ eventId, interests: userInterests });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans text-stone-900">
      
      {/* Welcome Banner in Luxury Espresso / Beige */}
      <div className="bg-[#1C1917] text-[#FDFAF5] p-8 rounded-3xl shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 w-96 h-full bg-[#B45309]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="px-3 py-1 bg-white/10 text-[#C28E27] rounded-full text-xs font-bold uppercase tracking-wider inline-block backdrop-blur-md border border-white/10">
            Attendee Hub &amp; Passes
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user.name}! 🎟️</h1>
          <p className="text-stone-300 text-xs md:text-sm leading-relaxed">
            Access your official conference credentials, generate printable physical lanyard badges, export calendar schedules, and consult your personal AI itinerary concierge.
          </p>

          {/* Tab Selector */}
          <div className="flex gap-3 pt-3">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'tickets' 
                  ? 'bg-[#B45309] text-white shadow-md' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <TicketIcon size={15} /> My Event Passes
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'saved' 
                  ? 'bg-[#B45309] text-white shadow-md' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Bookmark size={15} /> Bookmarked ({savedEvents?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('ai-concierge')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'ai-concierge' 
                  ? 'bg-[#B45309] text-white shadow-md' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Sparkles size={15} /> AI Schedule Concierge
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab: My Registered Tickets */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2 tracking-tight">
              <TicketIcon className="text-[#B45309]" size={22} /> Confirmed Passes &amp; Lanyard Credentials
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-stone-500 text-xs">Loading passes...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myRegistrations?.map((reg) => {
                const event = reg.event || {};
                const ticket = reg.ticket;
                const isWaitlisted = reg.registrationStatus === 'WAITLISTED';

                return (
                  <div 
                    key={reg._id} 
                    className="bg-white rounded-3xl border border-[#EFE8DA] shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-3 py-1 bg-[#B45309]/10 text-[#B45309] rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                            {reg.ticketCategory?.name || 'Standard Pass'}
                          </span>
                          {reg.isVIP && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#B45309] text-white flex items-center gap-1 shadow-xs">
                              👑 VIP PRIORITY
                            </span>
                          )}
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isWaitlisted ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isWaitlisted ? 'STANDBY WAITLIST' : reg.registrationStatus}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold text-stone-900 mb-1">{event.title}</h3>
                        <p className="text-xs text-stone-500 font-medium">{event.organization?.name || 'Corporate Conference'}</p>
                      </div>

                      <div className="space-y-1.5 text-xs font-medium text-stone-600 pt-2 border-t border-[#EFE8DA]">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-[#B45309]" />
                          <span>{new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {event.venue?.name && (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-amber-700" />
                            <span>{event.venue.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-[#FAF8F5] border-t border-[#EFE8DA] flex flex-wrap items-center justify-between gap-3">
                      {ticket ? (
                        <>
                          <div>
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">TICKET NUMBER</p>
                            <p className="text-xs font-mono font-bold text-stone-900">{ticket.ticketNumber}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => downloadCalendarEvent(event)}
                              title="Download .ics Calendar Invite"
                              className="bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold px-3 py-2 rounded-xl border border-[#EFE8DA] transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <Calendar size={13} /> Add to Cal
                            </button>
                            <button 
                              onClick={() => setActiveBadgeTicket({ ...ticket, reg, event })}
                              className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                              <Printer size={13} /> View Pass Badge
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-between gap-2 text-xs">
                          <div>
                            <p className="font-extrabold text-amber-900">
                              {reg.isVIP ? '👑 Priority Standby Queue' : 'Standby Queue'}
                            </p>
                            <p className="text-[11px] text-stone-500">
                              {reg.waitlistPosition ? `Position #${reg.waitlistPosition} in queue` : 'Automated promotion active upon seat release'}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-amber-200/50 text-amber-900 rounded-xl text-[10px] font-black uppercase">
                            Auto-Promoting
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {(!myRegistrations || myRegistrations.length === 0) && (
                <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-dashed border-[#EFE8DA] text-stone-500 space-y-3">
                  <TicketIcon size={44} className="mx-auto text-stone-300" />
                  <h3 className="text-base font-bold text-stone-900">No Passes Registered</h3>
                  <p className="text-xs text-stone-500">Discover upcoming corporate conferences and register for your first pass.</p>
                  <a 
                    href="/explore" 
                    className="inline-block bg-[#B45309] hover:bg-[#92400E] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-colors"
                  >
                    Browse Conferences &rarr;
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Saved Conferences & Bookmarks */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-[#F5F2EB] flex items-center gap-2 tracking-tight">
              <Bookmark className="text-[#B45309]" size={22} /> Bookmarked Conferences ({savedEvents?.length || 0})
            </h2>
            <Link 
              to="/explore" 
              className="text-xs font-bold text-[#B45309] hover:underline flex items-center gap-1"
            >
              Explore More Events &rarr;
            </Link>
          </div>

          {(!savedEvents || savedEvents.length === 0) ? (
            <div className="bg-white dark:bg-[#171614] p-12 text-center rounded-3xl border border-dashed border-[#EFE8DA] dark:border-stone-800 text-stone-500 space-y-3">
              <Bookmark size={40} className="mx-auto text-stone-300 dark:text-stone-600" />
              <h3 className="text-base font-bold text-stone-900 dark:text-[#F5F2EB]">No Bookmarked Conferences Yet</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Bookmark conferences you are interested in exploring or attending later.</p>
              <Link 
                to="/explore" 
                className="inline-block bg-[#B45309] hover:bg-[#92400E] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-colors"
              >
                Explore Conferences &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedEvents.map(event => (
                <div key={event._id} className="bg-white dark:bg-[#171614] rounded-3xl border border-[#EFE8DA] dark:border-stone-800 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#B45309]/30 transition-all">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-[#B45309] dark:text-amber-300 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-[#EFE8DA] dark:border-stone-700">
                        {event.category || 'Conference'}
                      </span>
                      <button
                        onClick={() => handleRemoveSavedEvent(event._id)}
                        title="Remove bookmark"
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-[#F5F2EB] leading-snug">{event.title}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">{event.description}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 font-medium border-t border-[#EFE8DA] dark:border-stone-800 pt-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#B45309]" />
                      <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                    </div>
                    {event.venue?.name && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#B45309]" />
                        <span>{event.venue.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link
                      to={event.slug ? `/conferences/${event.slug}` : `/explore`}
                      className="w-full bg-[#FAF8F5] dark:bg-[#24211D] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-[#EFE8DA] dark:border-stone-700 text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Event Info</span>
                    </Link>
                    <Link
                      to={`/explore`}
                      className="w-full bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>Secure Passes</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: AI Schedule Concierge */}
      {activeTab === 'ai-concierge' && (
        <div className="bg-white p-8 rounded-3xl border border-[#EFE8DA] shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#EFE8DA] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Personal Itinerary &amp; Session Concierge</h2>
              <p className="text-xs text-stone-500">Synthesize a personalized multi-track conference schedule aligned with your career goals.</p>
            </div>
          </div>

          <form onSubmit={handleGenerateItinerary} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                Your Technical Focus &amp; Learning Goals
              </label>
              <textarea 
                rows="3"
                value={userInterests}
                onChange={e => setUserInterests(e.target.value)}
                placeholder="e.g. Microservices, AI Agents, Cloud Native, Zero Trust Security..."
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl p-3.5 text-xs text-stone-900 focus:ring-1 focus:ring-[#B45309] focus:outline-none"
              />
            </div>

            <button 
              type="submit"
              disabled={aiConciergeMutation.isPending || !myRegistrations?.length}
              className="bg-[#B45309] hover:bg-[#92400E] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles size={15} /> {aiConciergeMutation.isPending ? 'Synthesizing Agenda...' : 'Generate My AI Itinerary'}
            </button>
          </form>

          {aiItinerary && (
            <div className="p-6 bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl text-xs text-stone-800 whitespace-pre-wrap leading-relaxed shadow-xs space-y-2">
              <h4 className="font-extrabold text-[#B45309] flex items-center gap-2 uppercase tracking-wider text-[11px]">
                <Compass size={15} /> Recommended Schedule Plan
              </h4>
              <p>{aiItinerary}</p>
            </div>
          )}
        </div>
      )}

      {/* Printable Conference Badge Modal in Luxury Beige */}
      {activeBadgeTicket && (
        <div className="fixed inset-0 w-screen h-screen min-h-screen z-[999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C1917] border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative animate-in fade-in my-auto">
            <button 
              onClick={() => setActiveBadgeTicket(null)}
              className="no-print absolute top-4 right-4 text-stone-400 hover:text-white font-bold text-xl cursor-pointer transition-colors"
            >
              &times;
            </button>

            {/* Visual Lanyard Badge Card */}
            <div id="printable-badge" className="bg-gradient-to-b from-[#1C1917] to-[#121110] text-[#FDFAF5] rounded-3xl p-6 relative overflow-hidden border border-stone-800 shadow-2xl space-y-4">
              {/* Lanyard Cutout Slot */}
              <div className="w-12 h-2 bg-stone-800 border border-stone-700 rounded-full mx-auto -mt-2"></div>

              <div className="pt-1">
                <span className="px-3 py-1 bg-[#B45309] text-white rounded-full text-[9px] font-extrabold uppercase tracking-widest inline-block shadow-xs">
                  {activeBadgeTicket.reg?.ticketCategory?.name || 'VIP ALL ACCESS'}
                </span>
                <h3 className="text-xl font-extrabold mt-2 tracking-tight text-white">
                  {activeBadgeTicket.event?.title || 'EventForge Summit'}
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {activeBadgeTicket.event?.venue?.name || 'Main Convention Hall'}
                </p>
              </div>

              {/* Attendee Info */}
              <div className="py-3 border-y border-stone-800 bg-[#24211D]/60 rounded-2xl">
                <h4 className="text-lg font-extrabold text-white tracking-tight">{user.name}</h4>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{user.role || 'ATTENDEE'}</p>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">{user.email}</p>
              </div>

              {/* QR Entry Code */}
              <div className="p-3 bg-white rounded-2xl inline-block shadow-lg">
                {activeBadgeTicket.qrCode ? (
                  <img src={activeBadgeTicket.qrCode} alt="QR Badge" className="w-36 h-36 mx-auto rounded-lg" />
                ) : (
                  <QrCode size={100} className="mx-auto text-stone-900" />
                )}
              </div>

              {/* Badge Token Footer */}
              <div className="bg-[#24211D] text-amber-300 font-mono font-bold text-xs py-2 px-3 rounded-xl border border-stone-800">
                {activeBadgeTicket.ticketNumber}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="no-print flex gap-3">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-[#B45309] hover:bg-[#92400E] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md uppercase tracking-wider cursor-pointer transition-all"
              >
                <Printer size={15} /> Print Badge (PDF)
              </button>
              <button 
                onClick={() => setActiveBadgeTicket(null)}
                className="px-5 bg-[#292524] border border-stone-700 text-stone-300 hover:text-white font-bold py-3 rounded-xl text-xs hover:bg-stone-800 cursor-pointer transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating & Review Section (Post-Event Only) */}
      {myRegistrations?.length > 0 && (
        <div className="bg-white p-8 rounded-3xl border border-[#EFE8DA] shadow-sm max-w-2xl space-y-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Star className="text-amber-500 fill-amber-500" size={18} /> Verified Post-Event Review
            </h3>
            <p className="text-xs text-stone-500">Attendee reviews open on conference day to ensure authentic evaluations.</p>
          </div>

          {feedbackSuccess && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
              <CheckCircle size={16} /> {feedbackSuccess}
            </div>
          )}

          {feedbackError && (
            <div className="p-3.5 bg-amber-50 text-amber-900 rounded-xl text-xs font-semibold border border-amber-200 flex items-center gap-2">
              <Clock size={16} className="text-amber-700 shrink-0" /> {feedbackError}
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Select Event</label>
              <select 
                required
                value={feedbackData.eventId}
                onChange={e => setFeedbackData({ ...feedbackData, eventId: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl p-2.5 text-xs text-stone-900 focus:ring-1 focus:ring-[#B45309]"
              >
                <option value="">-- Choose an Event --</option>
                {myRegistrations.map(r => {
                  const evt = r.event || {};
                  const isUpcoming = new Date(evt.startDate) > new Date() && evt.status !== 'LIVE' && evt.status !== 'COMPLETED';
                  return (
                    <option key={evt._id} value={evt._id}>
                      {evt.title} {isUpcoming ? `(Opens ${new Date(evt.startDate).toLocaleDateString()})` : '(Review Active)'}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFeedbackData({ ...feedbackData, rating: num })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      feedbackData.rating >= num 
                        ? 'bg-[#B45309] text-white border-[#B45309]' 
                        : 'bg-[#FAF8F5] text-stone-600 border-[#EFE8DA] hover:border-stone-300'
                    }`}
                  >
                    ★ {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Feedback Comments</label>
              <textarea 
                rows="3"
                value={feedbackData.comments}
                onChange={e => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                placeholder="What did you think of the keynotes, technical tracks, or organization?"
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl p-3 text-xs text-stone-900 focus:ring-1 focus:ring-[#B45309]"
              />
            </div>

            <button 
              type="submit"
              disabled={!feedbackData.eventId || feedbackMutation.isPending}
              className="bg-[#B45309] hover:bg-[#92400E] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={15} /> {feedbackMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
