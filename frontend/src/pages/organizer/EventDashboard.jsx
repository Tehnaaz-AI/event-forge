import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Calendar, MapPin, Users, Settings, Sparkles, 
  Volume2, ShieldCheck, Ticket, MessageSquare, Timer, Radio 
} from 'lucide-react';
import { api } from '../../services/api';
import SessionScheduler from '../../components/organizer/SessionScheduler';
import SponsorManager from '../../components/organizer/SponsorManager';
import AIAssistant from '../../components/organizer/AIAssistant';
import AnnouncementsManager from '../../components/organizer/AnnouncementsManager';
import EventOverview from '../../components/organizer/EventOverview';
import EventSpeakers from '../../components/organizer/EventSpeakers';
import EventSettings from '../../components/organizer/EventSettings';
import StaffManager from '../../components/organizer/StaffManager';
import TicketManager from '../../components/organizer/TicketManager';
import WaitlistManager from '../../components/organizer/WaitlistManager';
import EventRegistrations from '../../components/organizer/EventRegistrations';
import StageRunOfShow from '../../components/organizer/StageRunOfShow';
import EventPulse from '../../components/organizer/EventPulse';
import PostEventReport from '../../components/organizer/PostEventReport';

export default function EventDashboard() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get(`/events/${id}`)
  });

  // Real-time SSE Live Updates with Scoped Stream Token
  useEffect(() => {
    if (!id) return;
    let eventSource = null;
    let isCancelled = false;

    async function initRealtime() {
      try {
        const rawApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
        const base = rawApiUrl.endsWith('/api') ? rawApiUrl : (rawApiUrl ? `${rawApiUrl}/api` : '/api');
        
        const tokenRes = await api.post(`/events/${id}/intelligence/stream-token`);
        const streamToken = tokenRes?.streamToken;
        if (!streamToken || isCancelled) return;

        const streamUrl = `${base}/events/${id}/intelligence/stream?token=${encodeURIComponent(streamToken)}`;
        eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
          if (!isCancelled) setIsLiveConnected(true);
        };

        const invalidateEventData = () => {
          queryClient.invalidateQueries({ queryKey: ['event', id] });
          queryClient.invalidateQueries({ queryKey: ['event-waitlist', id] });
          queryClient.invalidateQueries({ queryKey: ['event-registrations', id] });
          queryClient.invalidateQueries({ queryKey: ['event-analytics', id] });
          queryClient.invalidateQueries({ queryKey: ['event-pulse', id] });
          queryClient.invalidateQueries({ queryKey: ['event-tickets', id] });
          queryClient.invalidateQueries({ queryKey: ['event-sessions', id] });
        };

        eventSource.addEventListener('REGISTRATION_CREATED', invalidateEventData);
        eventSource.addEventListener('WAITLIST_JOINED', invalidateEventData);
        eventSource.addEventListener('WAITLIST_PROMOTED', invalidateEventData);
        eventSource.addEventListener('WAITLIST_PRIORITY_UPDATED', invalidateEventData);
        eventSource.addEventListener('ATTENDEE_CHECKED_IN', invalidateEventData);
        eventSource.addEventListener('REGISTRATION_CANCELLED', invalidateEventData);
        eventSource.addEventListener('PULSE_UPDATED', invalidateEventData);
        eventSource.addEventListener('ANNOUNCEMENT_CREATED', invalidateEventData);
        eventSource.addEventListener('ROOM_OCCUPANCY_CHANGED', invalidateEventData);
        eventSource.addEventListener('ACTION_EXECUTED', invalidateEventData);

        eventSource.onerror = () => {
          if (!isCancelled) setIsLiveConnected(false);
        };
      } catch (err) {
        console.warn('Real-time connection fallback to polling:', err.message);
      }
    }

    initRealtime();

    return () => {
      isCancelled = true;
      if (eventSource) eventSource.close();
    };
  }, [id, queryClient]);

  if (isLoading) {
    return (
      <div className="p-16 text-center text-stone-500">
        <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading conference workspace...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-12 text-center text-rose-700 bg-rose-50 rounded-3xl border border-rose-200">
        Failed to load conference details.
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '🏛️ Executive Overview' },
    { id: 'registrations', label: '👥 Registered Attendees' },
    { id: 'waitlist', label: '👑 VIP Waitlist' },
    { id: 'pulse', label: '⚡ Live Event Pulse & OS' },
    { id: 'stage', label: '🎙️ Stage Run-of-Show' },
    { id: 'tickets', label: '🎟️ Tickets & Pricing Tiers' },
    { id: 'staff', label: '🛡️ Door Staff & Crew' },
    { id: 'sessions', label: '🗓️ Sessions & Multi-Track' },
    { id: 'speakers', label: '🎤 Keynote Speakers' },
    { id: 'sponsors', label: '💼 Sponsors & Partners' },
    { id: 'ai', label: '✨ AI Content Assistant' },
    { id: 'announcements', label: '📢 Live Broadcasts' },
    { id: 'post-event', label: '📊 Post-Event AI Report' },
    { id: 'settings', label: '⚙️ Event Configuration' }
  ];

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Title */}
      <div>
        <Link 
          to="/dashboard/organizer/events" 
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-[#B45309] mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to All Events
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">{event.title}</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/20">
                {event.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-stone-500 max-w-2xl">{event.description}</p>
          </div>

          <Link
            to={`/e/${event.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#EFE8DA] text-stone-700 hover:text-[#B45309] rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Preview Public Page &rarr;
          </Link>
        </div>
      </div>

      {/* Tab Navigation Ribbon - Modern Segmented Glass Capsule */}
      <div className="bg-[#FAF6EF]/90 dark:bg-[#141210]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#E8DFC8] dark:border-stone-800 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-sleek">
        {tabs.map(tab => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-2.5 px-4 text-xs font-bold whitespace-nowrap transition-all rounded-xl shrink-0 flex items-center gap-2 ${
                isActive 
                  ? 'bg-gradient-to-r from-[#B45309] via-[#D97706] to-[#C28E27] text-white shadow-md shadow-[#B45309]/25 font-extrabold scale-[1.02]' 
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-stone-800/80'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div>
        {currentTab === 'overview' && (
          <EventOverview eventId={event._id} />
        )}

        {currentTab === 'registrations' && (
          <EventRegistrations eventId={event._id} />
        )}

        {currentTab === 'pulse' && (
          <EventPulse eventId={event._id} />
        )}

        {currentTab === 'waitlist' && (
          <WaitlistManager eventId={event._id} />
        )}

        {currentTab === 'stage' && (
          <StageRunOfShow eventId={event._id} />
        )}

        {currentTab === 'tickets' && (
          <TicketManager eventId={event._id} />
        )}

        {currentTab === 'staff' && (
          <StaffManager eventId={event._id} />
        )}

        {currentTab === 'sessions' && (
          <SessionScheduler eventId={event._id} eventStartDate={event.startDate} />
        )}

        {currentTab === 'speakers' && (
          <EventSpeakers eventId={event._id} />
        )}

        {currentTab === 'sponsors' && (
          <SponsorManager eventId={event._id} />
        )}

        {currentTab === 'ai' && (
          <AIAssistant eventId={event._id} />
        )}

        {currentTab === 'announcements' && (
          <AnnouncementsManager eventId={event._id} />
        )}

        {currentTab === 'post-event' && (
          <PostEventReport eventId={event._id} />
        )}

        {currentTab === 'settings' && (
          <EventSettings event={event} />
        )}
      </div>
    </div>
  );
}
