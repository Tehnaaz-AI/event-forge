import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get(`/events/${id}`)
  });

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
    { id: 'overview', label: 'Executive Overview' },
    { id: 'registrations', label: '👥 Registered Attendees' },
    { id: 'waitlist', label: '👑 VIP Waitlist' },
    { id: 'pulse', label: '⚡ Live Event Pulse & OS' },
    { id: 'stage', label: '🎙️ Stage Run-of-Show' },
    { id: 'tickets', label: 'Tickets & Pricing Tiers' },
    { id: 'staff', label: 'Door Staff & Crew' },
    { id: 'sessions', label: 'Sessions & Multi-Track' },
    { id: 'speakers', label: 'Speakers' },
    { id: 'sponsors', label: 'Sponsors & Lead Capture' },
    { id: 'ai', label: 'AI Content Assistant' },
    { id: 'announcements', label: 'Broadcasts' },
    { id: 'post-event', label: '📊 Post-Event AI Report' },
    { id: 'settings', label: 'Event Configuration' }
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

      {/* Tab Navigation Ribbon */}
      <div className="flex items-center gap-2 border-b border-[#EFE8DA] overflow-x-auto pb-1 scrollbar-beige">
        {tabs.map(tab => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-3 px-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 -mb-px shrink-0 ${
                isActive 
                  ? 'border-[#B45309] text-[#B45309] bg-white rounded-t-xl shadow-xs' 
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
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
