import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Users, AlertCircle, Clock, Info, Bell, Zap, Calendar } from 'lucide-react';
import { api } from '../../services/api';

const TYPE_CONFIG = {
  INFO: { label: 'Info', icon: Info, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  REMINDER: { label: 'Reminder', icon: Bell, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  URGENT: { label: 'Urgent', icon: Zap, color: 'text-red-600 bg-red-50 border-red-100' },
  SCHEDULE_CHANGE: { label: 'Schedule Change', icon: Calendar, color: 'text-purple-600 bg-purple-50 border-purple-100' },
};

export default function AnnouncementsManager({ eventId }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ title: '', message: '', type: 'INFO', targetAudience: 'ALL' });
  const [showForm, setShowForm] = useState(false);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements', eventId],
    queryFn: () => api.get(`/events/${eventId}/announcements`)
  });

  const sendAnnouncement = useMutation({
    mutationFn: (data) => api.post(`/events/${eventId}/announcements`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', eventId] });
      setFormData({ title: '', message: '', type: 'INFO', targetAudience: 'ALL' });
      setShowForm(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (confirm(`Broadcast this to ${formData.targetAudience} attendees?`)) {
      sendAnnouncement.mutate(formData);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500">Loading announcements...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Broadcasts &amp; Announcements</h2>
          <p className="text-sm text-slate-500">Communicate directly with your attendees.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-brand text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-brand/90 transition-colors">
            <Send size={18} /> New Broadcast
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Compose Announcement</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:border-brand">
                  <option value="INFO">Info</option>
                  <option value="REMINDER">Reminder</option>
                  <option value="URGENT">Urgent</option>
                  <option value="SCHEDULE_CHANGE">Schedule Change</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To (Audience)</label>
                <select value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:border-brand">
                  <option value="ALL">All Registered Attendees</option>
                  <option value="CONFIRMED">Only Confirmed Tickets</option>
                  <option value="WAITLISTED">Only Waitlisted Attendees</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title / Subject</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:border-brand" placeholder="e.g. Schedule Update for Tomorrow" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
              <textarea required rows="6" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:border-brand" placeholder="Write your message here..."></textarea>
            </div>
          </div>
          {sendAnnouncement.isError && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{sendAnnouncement.error?.message}</div>
          )}
          <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={sendAnnouncement.isPending} className="bg-brand text-white px-6 py-2 rounded-lg font-medium hover:bg-brand/90 transition-colors flex items-center gap-2 disabled:opacity-50">
              <Send size={18} /> {sendAnnouncement.isPending ? 'Sending...' : 'Broadcast Now'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {announcements?.map(a => {
          const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.INFO;
          const Icon = cfg.icon;
          return (
            <div key={a._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                    <Icon size={12} /> {cfg.label}
                  </span>
                  <h4 className="font-bold text-slate-900">{a.title}</h4>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0 ml-4">
                  <span className="flex items-center gap-1"><Users size={12} /> {a.audience}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(a.sentAt).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg text-sm border border-slate-100">{a.message}</p>
            </div>
          );
        })}
        {(!announcements || announcements.length === 0) && !showForm && (
          <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No announcements sent yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
