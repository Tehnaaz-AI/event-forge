import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, CalendarDays, MapPin, Users, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

export default function EventsList() {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['organizer-events'],
    queryFn: () => api.get('/events/organizer/me'),
    refetchInterval: 10000,
    refetchOnWindowFocus: true
  });

  if (isLoading) {
    return (
      <div className="p-16 text-center text-stone-500 text-xs">
        <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading conference portfolio...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-rose-800 bg-rose-50 rounded-3xl border border-rose-200 text-xs font-semibold">
        Failed to load conferences: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans text-stone-900">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Managed Conferences</h1>
          <p className="text-xs text-stone-500 mt-1">
            Active, draft, and completed conferences across your organization.
          </p>
        </div>

        <Link 
          to="/dashboard/organizer/events/new" 
          className="bg-[#B45309] hover:bg-[#92400E] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Create Conference
        </Link>
      </div>

      {/* Conference Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <div 
            key={event._id} 
            className="bg-white rounded-3xl shadow-sm border border-[#EFE8DA] overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between"
          >
            <div>
              <div className="h-32 bg-gradient-to-br from-[#FDFAF5] to-[#F5F2EB] border-b border-[#EFE8DA] flex items-center justify-between p-6 relative">
                <span className="text-xs font-extrabold text-[#B45309] bg-white border border-[#EFE8DA] px-3 py-1 rounded-full uppercase tracking-wider">
                  {event.category || 'CONFERENCE'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  event.status === 'LIVE' ? 'bg-emerald-100 text-emerald-800' :
                  event.status === 'REGISTRATION_OPEN' ? 'bg-[#B45309]/10 text-[#B45309]' :
                  'bg-stone-100 text-stone-700'
                }`}>
                  {event.status.replace('_', ' ')}
                </span>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="text-lg font-extrabold text-stone-900 truncate">{event.title}</h3>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{event.description}</p>
                
                <div className="space-y-1.5 pt-2 text-xs text-stone-600 border-t border-[#EFE8DA]">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-[#B45309]" />
                    <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-amber-700" />
                    <span className="truncate">{event.venue?.name || 'Venue TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-stone-400" />
                    <span>{event.capacity} Capacity Target</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link 
                to={`/dashboard/organizer/events/${event._id}`}
                className="w-full text-center bg-[#FAF8F5] hover:bg-[#B45309] hover:text-white border border-[#EFE8DA] text-stone-800 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                Manage Workspace <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}

        {(!events || events.length === 0) && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-[#EFE8DA]">
            <CalendarDays size={48} className="mx-auto text-stone-300 mb-3" />
            <h3 className="text-base font-bold text-stone-900 mb-1">No conferences yet</h3>
            <p className="text-xs text-stone-500 mb-4">Get started by creating your first flagship event.</p>
            <Link 
              to="/dashboard/organizer/events/new" 
              className="text-[#B45309] font-bold text-xs hover:underline"
            >
              + Create an event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
