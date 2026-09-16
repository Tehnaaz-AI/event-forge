import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function EventSettings({ event }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    eventType: event.eventType || 'CONFERENCE',
    category: event.category || 'Technology',
    status: event.status || 'DRAFT',
    startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
    endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
    capacity: event.capacity || 500,
    venueName: event.venue?.name || '',
    venueAddress: event.venue?.address || '',
    waitlistEnabled: event.registrationSettings?.waitlistEnabled ?? true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/events/${event._id}`, {
      ...data,
      capacity: parseInt(data.capacity),
      venue: { name: data.venueName, address: data.venueAddress },
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', event._id] });
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Event Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Configure event details, scheduling, capacity, and publishing status</p>
      </div>

      {savedSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
          <CheckCircle size={20} /> Event settings saved successfully!
        </div>
      )}

      {updateMutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle size={20} /> {updateMutation.error?.message || 'Failed to update event settings'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        
        {/* Status Selection */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1">Event Status</label>
            <p className="text-xs text-slate-500">Control public visibility and attendee registration status</p>
          </div>
          <select 
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            className="border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand focus:border-brand"
          >
            <option value="DRAFT">DRAFT (Hidden)</option>
            <option value="PUBLISHED">PUBLISHED (Visible)</option>
            <option value="REGISTRATION_OPEN">REGISTRATION_OPEN (Tickets Available)</option>
            <option value="REGISTRATION_CLOSED">REGISTRATION_CLOSED (Sold Out / Closed)</option>
            <option value="LIVE">LIVE (Event In Progress)</option>
            <option value="COMPLETED">COMPLETED (Past Event)</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Basic Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
            <input 
              required 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              required 
              rows="4" 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
              <select 
                value={formData.eventType} 
                onChange={e => setFormData({ ...formData, eventType: e.target.value })} 
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand"
              >
                <option value="CONFERENCE">Conference</option>
                <option value="SEMINAR">Seminar</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="EXHIBITION">Exhibition</option>
                <option value="MEETUP">Meetup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input 
                required 
                type="text" 
                value={formData.category} 
                onChange={e => setFormData({ ...formData, category: e.target.value })} 
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand" 
              />
            </div>
          </div>
        </div>

        {/* Date & Location */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Date &amp; Venue</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date &amp; Time</label>
              <input 
                required 
                type="datetime-local" 
                value={formData.startDate} 
                onChange={e => setFormData({ ...formData, startDate: e.target.value })} 
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date &amp; Time</label>
              <input 
                required 
                type="datetime-local" 
                value={formData.endDate} 
                onChange={e => setFormData({ ...formData, endDate: e.target.value })} 
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Venue Name</label>
              <input 
                required 
                type="text" 
                value={formData.venueName} 
                onChange={e => setFormData({ ...formData, venueName: e.target.value })} 
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Venue Address</label>
              <input 
                required 
                type="text" 
                value={formData.venueAddress} 
                onChange={e => setFormData({ ...formData, venueAddress: e.target.value })} 
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand" 
              />
            </div>
          </div>
        </div>

        {/* Capacity & Waitlist */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Capacity &amp; Registration Controls</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Capacity</label>
              <input 
                required 
                type="number" 
                min="1" 
                value={formData.capacity} 
                onChange={e => setFormData({ ...formData, capacity: e.target.value })} 
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand" 
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input 
                id="waitlist" 
                type="checkbox" 
                checked={formData.waitlistEnabled} 
                onChange={e => setFormData({ ...formData, waitlistEnabled: e.target.checked })} 
                className="w-5 h-5 text-brand rounded border-slate-300 focus:ring-brand" 
              />
              <label htmlFor="waitlist" className="text-sm font-medium text-slate-700 cursor-pointer">
                Enable Waitlist when tickets sell out
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={updateMutation.isPending} 
            className="bg-brand text-white px-8 py-3 rounded-xl font-bold text-base hover:bg-brand/90 transition-colors flex items-center gap-2 shadow-lg shadow-brand/20 disabled:opacity-50"
          >
            {updateMutation.isPending ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {updateMutation.isPending ? 'Saving Settings...' : 'Save Event Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
