import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { MessageSquare, Star } from 'lucide-react';

export default function FeedbackList() {
  const [selectedEventId, setSelectedEventId] = useState('');

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['organizer-events-feedback'],
    queryFn: () => api.get('/events/organizer/me')
  });

  const { data: feedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['feedback', selectedEventId],
    queryFn: () => api.get(`/events/${selectedEventId}/feedback`),
    enabled: !!selectedEventId
  });

  if (eventsLoading) return <div className="p-8 text-slate-500">Loading events...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Attendee Feedback</h1>
          <p className="text-slate-500 text-sm mt-1">Review feedback, comments and star ratings submitted by your attendees</p>
        </div>
        <select 
          className="border border-slate-300 rounded-xl p-3 bg-white text-sm font-semibold text-slate-900 min-w-[240px] focus:ring-2 focus:ring-brand focus:border-brand shadow-sm"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          <option value="">-- Select an Event --</option>
          {events?.map(e => (
            <option key={e._id} value={e._id}>{e.title}</option>
          ))}
        </select>
      </div>

      {!selectedEventId && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Select an Event</h3>
          <p className="text-slate-500 text-sm">Choose an event from the dropdown to view its attendee feedback.</p>
        </div>
      )}

      {selectedEventId && feedbackLoading && (
        <div className="p-8 text-center text-slate-500">Loading feedback...</div>
      )}

      {selectedEventId && !feedbackLoading && (!feedback || feedback.length === 0) && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
          <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Feedback Yet</h3>
          <p className="text-slate-500 text-sm">No attendees have submitted feedback for this event yet.</p>
        </div>
      )}

      {selectedEventId && feedback?.length > 0 && (
        <div className="grid gap-4">
          {feedback.map(f => (
            <div key={f._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="bg-amber-50 p-3 rounded-2xl text-amber-500 border border-amber-100 shrink-0">
                <Star size={24} className="fill-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900 text-base">{f.attendee?.name || 'Attendee'}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {f.rating} / 5 Stars
                  </span>
                </div>
                {f.session && (
                  <p className="text-xs text-brand font-semibold mb-2">Session: {f.session.title}</p>
                )}
                <p className="text-slate-600 text-sm leading-relaxed">{f.comments || <em className="text-slate-400">No comment provided</em>}</p>
                <p className="text-xs text-slate-400 mt-4">{new Date(f.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
