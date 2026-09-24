import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Clock, MapPin, AlertCircle, Trash2, Calendar, 
  Layers, CheckCircle2, Sparkles, Filter, ShieldCheck, Users, 
  RefreshCw, Check, X, Tag
} from 'lucide-react';
import { api } from '../../services/api';

export default function SessionScheduler({ eventId, eventStartDate }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  
  const baseDate = eventStartDate ? new Date(eventStartDate) : new Date();
  const defaultStart = !isNaN(baseDate.getTime()) ? baseDate.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
  const defaultEnd = !isNaN(baseDate.getTime()) ? new Date(baseDate.getTime() + 60*60*1000).toISOString().slice(0, 16) : new Date(Date.now() + 3600000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    room: 'Main Keynote Hall',
    track: 'Track 1 - Strategy & AI',
    capacity: 250,
    startTime: defaultStart,
    endTime: defaultEnd,
    status: 'PUBLISHED'
  });

  const { data: sessions, isLoading, error, refetch } = useQuery({
    queryKey: ['sessions', eventId],
    queryFn: () => api.get(`/events/${eventId}/sessions`),
    refetchInterval: 6000,
    refetchOnWindowFocus: true
  });

  const createSession = useMutation({
    mutationFn: (newSession) => api.post(`/events/${eventId}/sessions`, newSession),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      setShowForm(false);
      setFormError('');
      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        capacity: 250
      }));
    },
    onError: (error) => {
      setFormError(error.response?.data?.message || error.message || 'Failed to create session');
    }
  });

  const deleteSession = useMutation({
    mutationFn: (sessionId) => api.delete(`/events/${eventId}/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
    onError: (err) => {
      alert(`Failed to delete session: ${err.message}`);
    }
  });

  const updateStatus = useMutation({
    mutationFn: ({ sessionId, status }) => api.patch(`/events/${eventId}/sessions/${sessionId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', eventId] });
    },
    onError: (err) => {
      alert(`Status update failed: ${err.message}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    createSession.mutate({
      ...formData,
      capacity: parseInt(formData.capacity) || 100,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString()
    });
  };

  const sessionList = sessions || [];
  const uniqueRooms = Array.from(new Set(sessionList.map(s => s.room).filter(Boolean)));
  
  const filteredSessions = sessionList.filter(s => {
    if (selectedRoom !== 'ALL' && s.room !== selectedRoom) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-16 text-center text-stone-500">
        <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading multi-track session agenda...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-stone-900 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE8DA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B45309]/10 text-[#B45309] rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            <Layers size={13} /> Conflict-Free Multi-Track Engine
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Conference Schedule &amp; Multi-Track Sessions</h2>
          <p className="text-xs text-stone-500 max-w-xl">
            Orchestrate keynote addresses, technical breakouts, workshops, and panel sessions with server-side overlap &amp; speaker collision prevention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-3 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-[#EFE8DA] rounded-2xl transition-all"
            title="Refresh Sessions"
          >
            <RefreshCw size={16} />
          </button>
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="bg-[#B45309] hover:bg-[#92400E] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md shadow-[#B45309]/20 flex items-center gap-2 transition-all shrink-0"
            >
              <Plus size={16} /> Add New Session
            </button>
          )}
        </div>
      </div>

      {/* Add Session Form Modal */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE8DA] shadow-md space-y-5 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between border-b border-[#EFE8DA] pb-4">
            <h4 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
              <Calendar size={18} className="text-[#B45309]" /> Schedule New Track Session
            </h4>
            <button 
              type="button" 
              onClick={() => { setShowForm(false); setFormError(''); }} 
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100"
            >
              <X size={18} />
            </button>
          </div>
          
          {formError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs font-semibold">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold text-rose-900">Schedule Conflict Detected</p>
                <p className="mt-0.5">{formError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">Session Title *</label>
              <input 
                required 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-4 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B45309]" 
                placeholder="e.g. Keynote: Autonomous Agents & Enterprise Architectures" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Room / Location *</label>
              <input 
                required 
                type="text" 
                value={formData.room} 
                onChange={e => setFormData({ ...formData, room: e.target.value })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-4 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B45309]" 
                placeholder="e.g. Main Hall A, Breakout Room 3" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Track / Theme</label>
              <input 
                type="text" 
                value={formData.track} 
                onChange={e => setFormData({ ...formData, track: e.target.value })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-4 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B45309]" 
                placeholder="e.g. AI & Engineering Track" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Start Time *</label>
              <input 
                required 
                type="datetime-local" 
                value={formData.startTime} 
                onChange={e => setFormData({ ...formData, startTime: e.target.value })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-4 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B45309]" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">End Time *</label>
              <input 
                required 
                type="datetime-local" 
                value={formData.endTime} 
                onChange={e => setFormData({ ...formData, endTime: e.target.value })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-4 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B45309]" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Room Seating Capacity *</label>
              <input 
                required 
                type="number" 
                min="1" 
                value={formData.capacity} 
                onChange={e => setFormData({ ...formData, capacity: e.target.value })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-4 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B45309]" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Publishing Status</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({ ...formData, status: e.target.value })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3 py-2 text-xs font-bold text-[#B45309] focus:outline-none focus:border-[#B45309]"
              >
                <option value="PUBLISHED">Published (Visible to Delegates)</option>
                <option value="APPROVED">Approved (Internal)</option>
                <option value="PROPOSED">Proposed</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE8DA]">
            <button 
              type="button" 
              onClick={() => { setShowForm(false); setFormError(''); }} 
              className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-50 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createSession.isPending} 
              className="bg-[#B45309] hover:bg-[#92400E] text-white px-6 py-2 rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {createSession.isPending ? 'Verifying Conflict Rules...' : 'Save & Publish Session'}
            </button>
          </div>
        </form>
      )}

      {/* Room / Track Filter Bar */}
      {uniqueRooms.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-beige">
          <span className="text-xs font-bold text-stone-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter size={13} /> Filter Hall:
          </span>
          <button
            onClick={() => setSelectedRoom('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedRoom === 'ALL' ? 'bg-[#1C1917] text-white' : 'bg-white border border-[#EFE8DA] text-stone-600 hover:bg-stone-50'
            }`}
          >
            All Tracks ({sessionList.length})
          </button>
          {uniqueRooms.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRoom(r)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedRoom === r ? 'bg-[#B45309] text-white' : 'bg-white border border-[#EFE8DA] text-stone-600 hover:bg-stone-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Multi-Track Scrollable Session List Container */}
      <div className="bg-white rounded-3xl border border-[#EFE8DA] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFE8DA] bg-[#FAF8F5] flex items-center justify-between">
          <span className="text-xs font-extrabold text-stone-800 uppercase tracking-wider">
            {filteredSessions.length} Scheduled Multi-Track Sessions
          </span>
          <span className="text-[10px] font-bold text-stone-400">Deterministic Conflict Guard Active</span>
        </div>

        <div className="max-h-[500px] overflow-y-auto overflow-x-auto divide-y divide-[#EFE8DA] scrollbar-beige">
          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center text-stone-400 text-xs">
              <Calendar size={36} className="mx-auto mb-2 text-stone-300" />
              <p className="font-bold text-stone-600">No sessions scheduled for this room</p>
              <p className="text-[11px] text-stone-400 mt-1">Click "Add New Session" to populate your multi-track conference agenda.</p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const start = new Date(session.startTime);
              const end = new Date(session.endTime);
              const timeStr = !isNaN(start) 
                ? `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                : 'TBD';

              return (
                <div 
                  key={session._id} 
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F5]/80 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/20">
                        {session.room}
                      </span>
                      {session.track && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
                          {session.track}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        session.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' :
                        session.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {session.status || 'PUBLISHED'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-stone-900 truncate">{session.title}</h4>

                    <div className="flex items-center gap-4 text-xs text-stone-500 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock size={13} className="text-[#B45309]" /> {timeStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-stone-400" /> {session.capacity || 100} Seat Limit
                      </span>
                      {session.speakers?.length > 0 && (
                        <span className="text-stone-600 font-medium">
                          🎤 {session.speakers.map(sp => sp.name).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus.mutate({
                        sessionId: session._id,
                        status: session.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
                      })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        session.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-[#FAF8F5] text-stone-600 border-[#EFE8DA] hover:border-[#B45309]'
                      }`}
                    >
                      {session.status === 'PUBLISHED' ? '✓ Published' : 'Publish'}
                    </button>

                    <button 
                      onClick={() => {
                        if (confirm(`Remove session "${session.title}"?`)) {
                          deleteSession.mutate(session._id);
                        }
                      }}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
