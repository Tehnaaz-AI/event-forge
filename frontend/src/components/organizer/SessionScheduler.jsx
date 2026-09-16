import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Clock, MapPin, AlertCircle, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export default function SessionScheduler({ eventId, eventStartDate }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    room: '',
    capacity: 100,
    startTime: new Date(eventStartDate).toISOString().slice(0, 16),
    endTime: new Date(new Date(eventStartDate).getTime() + 60*60*1000).toISOString().slice(0, 16),
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions', eventId],
    queryFn: () => api.get(`/events/${eventId}/sessions`)
  });

  const createSession = useMutation({
    mutationFn: (newSession) => api.post(`/events/${eventId}/sessions`, newSession),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', eventId] });
      setShowForm(false);
      setFormError('');
      setFormData(prev => ({...prev, title: ''})); // reset basic fields
    },
    onError: (error) => {
      setFormError(error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    createSession.mutate({
      ...formData,
      capacity: parseInt(formData.capacity),
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
    });
  };

  if (isLoading) return <div>Loading schedule...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900">Event Schedule</h3>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800"
          >
            <Plus size={16} /> Add Session
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-900">New Session</h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">×</button>
          </div>
          
          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 text-red-700">
              <AlertCircle size={20} className="shrink-0" />
              <div>
                <p className="font-semibold text-sm">Conflict Detected</p>
                <p className="text-sm">{formError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Session Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-slate-200 rounded-lg px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Room / Location</label>
              <input required type="text" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="w-full border-slate-200 rounded-lg px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input required type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full border-slate-200 rounded-lg px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input required type="datetime-local" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full border-slate-200 rounded-lg px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
              <input required type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full border-slate-200 rounded-lg px-3 py-2 border" />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={createSession.isPending} className="bg-brand text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
              {createSession.isPending ? 'Saving...' : 'Save Session'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sessions?.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No sessions scheduled yet.</p>
        ) : (
          sessions?.map(session => (
            <div key={session._id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-slate-300">
              <div>
                <h4 className="font-bold text-slate-900">{session.title}</h4>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Clock size={14}/> {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <span className="flex items-center gap-1"><MapPin size={14}/> {session.room}</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
