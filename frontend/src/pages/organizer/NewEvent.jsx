import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Type, AlignLeft } from 'lucide-react';
import { api } from '../../services/api';

export default function NewEvent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'CONFERENCE',
    category: 'Technology',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    capacity: 500,
    venue: { name: '', address: '' },
    tags: ''
  });

  const createEvent = useMutation({
    mutationFn: (data) => api.post('/events', data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      // Redirect to the newly created event dashboard
      navigate(`/dashboard/organizer/events/${response._id}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createEvent.mutate({
      ...formData,
      capacity: parseInt(formData.capacity),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create New Event</h1>
          <p className="text-slate-500 mt-1">Set up the foundation for your next big experience.</p>
        </div>
        <button type="button" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 font-medium">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        {createEvent.isError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            Error: {createEvent.error.message}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><Type size={16}/> Event Title</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-brand focus:border-brand" placeholder="e.g. FutureTech Summit 2026" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><AlignLeft size={16}/> Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="4" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-brand focus:border-brand" placeholder="What is this event about?"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
              <select value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-brand focus:border-brand">
                <option value="CONFERENCE">Conference</option>
                <option value="SEMINAR">Seminar</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="EXHIBITION">Exhibition</option>
                <option value="MEETUP">Meetup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-brand focus:border-brand" placeholder="e.g. Technology" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><Calendar size={16}/> Start Date & Time</label>
              <input required type="datetime-local" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-brand focus:border-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><Calendar size={16}/> End Date & Time</label>
              <input required type="datetime-local" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-brand focus:border-brand" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><MapPin size={16}/> Venue Name</label>
              <input required type="text" value={formData.venue.name} onChange={e => setFormData({...formData, venue: {...formData.venue, name: e.target.value}})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-brand focus:border-brand" placeholder="e.g. Grand Convention Center" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Venue Address</label>
              <input required type="text" value={formData.venue.address} onChange={e => setFormData({...formData, venue: {...formData.venue, address: e.target.value}})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-brand focus:border-brand" placeholder="e.g. 123 Tech Blvd, San Francisco, CA" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><Users size={16}/> Max Capacity</label>
              <input required type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-brand focus:border-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><Type size={16}/> Tags (comma separated)</label>
              <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-brand focus:border-brand" placeholder="e.g. AI, Web, Networking" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-end">
            <button type="submit" disabled={createEvent.isPending} className="bg-brand text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-brand/90 transition-colors disabled:opacity-50">
              {createEvent.isPending ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
