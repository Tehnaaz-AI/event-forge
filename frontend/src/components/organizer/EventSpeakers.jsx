import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, Mail, Plus, Trash2, Mic, Building, CheckCircle2, 
  X, RefreshCcw, Sparkles, ExternalLink, Calendar, UserPlus 
} from 'lucide-react';
import { api } from '../../services/api';

export default function EventSpeakers({ eventId }) {
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);

  // New Speaker Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');

  // 1. Fetch Sessions for this Event (to see current assigned speakers)
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ['sessions', eventId],
    queryFn: () => api.get(`/events/${eventId}/sessions`)
  });

  // 2. Fetch Organization Speakers Directory
  const { data: orgSpeakers = [], isLoading: isLoadingSpeakers } = useQuery({
    queryKey: ['speakers'],
    queryFn: () => api.get('/speakers')
  });

  // Extract unique speakers actively attached to event sessions
  const activeEventSpeakersMap = new Map();
  sessions.forEach(session => {
    session.speakers?.forEach(sp => {
      const spObj = typeof sp === 'object' ? sp : { _id: sp };
      if (spObj._id && !activeEventSpeakersMap.has(spObj._id)) {
        activeEventSpeakersMap.set(spObj._id, {
          ...spObj,
          sessionTitles: [session.title]
        });
      } else if (spObj._id) {
        const existing = activeEventSpeakersMap.get(spObj._id);
        if (!existing.sessionTitles.includes(session.title)) {
          existing.sessionTitles.push(session.title);
        }
      }
    });
  });

  // Combine event-assigned speakers and org speakers
  const allSpeakers = [...orgSpeakers];
  activeEventSpeakersMap.forEach((val, key) => {
    if (!allSpeakers.some(s => s._id === key)) {
      allSpeakers.push(val);
    }
  });

  // Mutations
  const createSpeakerMutation = useMutation({
    mutationFn: async (speakerData) => {
      const newSp = await api.post('/speakers', {
        name: speakerData.name,
        email: speakerData.email,
        bio: speakerData.bio || undefined,
        avatar: speakerData.avatar || undefined
      });

      // If a session was selected, assign speaker to that session
      if (speakerData.sessionId && newSp?._id) {
        const targetSession = sessions.find(s => s._id === speakerData.sessionId);
        if (targetSession) {
          const currentSpeakerIds = (targetSession.speakers || []).map(s => typeof s === 'object' ? s._id : s);
          await api.patch(`/sessions/${targetSession._id}`, {
            speakers: [...new Set([...currentSpeakerIds, newSp._id])]
          });
        }
      }
      return newSp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', eventId] });
      setAddModalOpen(false);
      setName('');
      setEmail('');
      setBio('');
      setAvatar('');
      setSelectedSessionId('');
    }
  });

  const assignSpeakerMutation = useMutation({
    mutationFn: async ({ speakerId, sessionId }) => {
      const targetSession = sessions.find(s => s._id === sessionId);
      if (!targetSession) throw new Error('Session not found');
      const currentSpeakerIds = (targetSession.speakers || []).map(s => typeof s === 'object' ? s._id : s);
      return await api.patch(`/sessions/${sessionId}`, {
        speakers: [...new Set([...currentSpeakerIds, speakerId])]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', eventId] });
      setAssignModalOpen(false);
      setSelectedSpeaker(null);
    }
  });

  const deleteSpeakerMutation = useMutation({
    mutationFn: (speakerId) => api.delete(`/speakers/${speakerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', eventId] });
    }
  });

  const handleCreateSpeaker = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    createSpeakerMutation.mutate({
      name,
      email,
      bio,
      avatar,
      sessionId: selectedSessionId
    });
  };

  if (isLoadingSessions || isLoadingSpeakers) {
    return (
      <div className="p-16 text-center text-stone-500">
        <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading keynote speakers and presenters...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-stone-900 dark:text-[#F5F2EB] tracking-tight flex items-center gap-2">
            <Mic size={20} className="text-[#B45309] dark:text-[#F59E0B]" /> Keynote Speakers &amp; Presenters
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Manage keynote luminaries, panel moderators, and technical breakout speakers for this conference.
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded-2xl text-xs font-bold shadow-sm shadow-[#B45309]/20 transition-all shrink-0 cursor-pointer"
        >
          <UserPlus size={14} /> Add New Speaker
        </button>
      </div>

      {/* Speakers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allSpeakers.map(speaker => {
          const spName = speaker.name || 'Speaker';
          const spEmail = speaker.email || '';
          const spBio = speaker.bio || '';
          const spAvatar = speaker.avatar || null;
          const assignedSessionTitles = activeEventSpeakersMap.get(speaker._id)?.sessionTitles || [];

          return (
            <div 
              key={speaker._id} 
              className="bg-white dark:bg-[#171614] p-6 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                {/* Speaker Avatar */}
                <div className="w-20 h-20 bg-[#B45309]/10 text-[#B45309] dark:text-[#F59E0B] rounded-full flex items-center justify-center text-2xl font-extrabold mb-4 overflow-hidden border-2 border-[#EFE8DA] dark:border-stone-700 shadow-inner">
                  {spAvatar ? (
                    <img src={spAvatar} alt={spName} className="w-full h-full object-cover" />
                  ) : (
                    spName.charAt(0)
                  )}
                </div>

                <h4 className="font-extrabold text-base text-stone-900 dark:text-[#F5F2EB]">{spName}</h4>
                {spEmail && (
                  <a href={`mailto:${spEmail}`} className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1 mt-0.5 hover:text-[#B45309] dark:hover:text-[#F59E0B] transition-colors font-mono">
                    <Mail size={12} /> {spEmail}
                  </a>
                )}

                {spBio ? (
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-3 line-clamp-3 bg-[#FAF8F5] dark:bg-[#1C1917] p-3 rounded-2xl w-full border border-[#EFE8DA] dark:border-stone-800 leading-relaxed text-left">
                    {spBio}
                  </p>
                ) : (
                  <p className="text-[11px] text-stone-400 italic mt-3 bg-[#FAF8F5] dark:bg-[#1C1917] p-2.5 rounded-2xl w-full border border-[#EFE8DA] dark:border-stone-800">
                    No bio summary provided.
                  </p>
                )}
              </div>

              {/* Assigned Sessions */}
              <div className="mt-4 pt-3 border-t border-[#EFE8DA] dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Assigned Sessions</span>
                  <button
                    onClick={() => {
                      setSelectedSpeaker(speaker);
                      setAssignModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-[#B45309] dark:text-[#F59E0B] hover:underline cursor-pointer"
                  >
                    + Assign Track
                  </button>
                </div>

                {assignedSessionTitles.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {assignedSessionTitles.map((title, idx) => (
                      <span key={idx} className="bg-amber-50 dark:bg-amber-950/40 text-[#B45309] dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 text-[10px] font-bold px-2 py-0.5 rounded-full truncate max-w-full">
                        {title}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-400">Not currently assigned to a session track.</p>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => deleteSpeakerMutation.mutate(speaker._id)}
                    title="Remove Speaker Profile"
                    className="text-stone-300 dark:text-stone-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {allSpeakers.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white dark:bg-[#171614] rounded-3xl border border-dashed border-[#EFE8DA] dark:border-stone-800 space-y-3">
            <Users size={40} className="mx-auto text-stone-300 dark:text-stone-600" />
            <h4 className="text-sm font-extrabold text-stone-800 dark:text-[#F5F2EB]">No Speakers Registered Yet</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Add prominent keynote speakers, industry experts, and track presenters to feature on your event agenda.
            </p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#B45309]/20 transition-all cursor-pointer"
            >
              <UserPlus size={13} /> Add First Speaker
            </button>
          </div>
        )}
      </div>

      {/* MODAL: Add New Speaker */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C1917] border border-[#EFE8DA] dark:border-stone-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#EFE8DA] dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Mic size={18} className="text-[#B45309] dark:text-[#F59E0B]" />
                <h3 className="font-extrabold text-base text-stone-900 dark:text-[#F5F2EB]">Add Conference Speaker</h3>
              </div>
              <button 
                onClick={() => setAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSpeaker} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Speaker Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dr. Alex Vance"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#292524] border border-[#EFE8DA] dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Speaker Email Address *</label>
                <input
                  required
                  type="email"
                  placeholder="speaker@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#292524] border border-[#EFE8DA] dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#B45309] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Avatar / Headshot URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or paste image URL"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#292524] border border-[#EFE8DA] dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>

              {sessions.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Assign to Session Track (Optional)</label>
                  <select
                    value={selectedSessionId}
                    onChange={e => setSelectedSessionId(e.target.value)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#292524] border border-[#EFE8DA] dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                  >
                    <option value="">-- Assign Later --</option>
                    {sessions.map(s => (
                      <option key={s._id} value={s._id}>{s.title} ({s.room})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Biography &amp; Executive Summary</label>
                <textarea
                  rows="3"
                  placeholder="Senior VP of Systems Engineering with 15+ years in distributed architecture..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#292524] border border-[#EFE8DA] dark:border-stone-700 rounded-xl p-3 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="w-1/2 py-2.5 bg-[#FAF8F5] dark:bg-[#292524] border border-[#EFE8DA] dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSpeakerMutation.isPending}
                  className="w-1/2 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold shadow-md shadow-[#B45309]/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {createSpeakerMutation.isPending ? <RefreshCcw size={13} className="animate-spin" /> : <UserPlus size={13} />}
                  {createSpeakerMutation.isPending ? 'Saving...' : 'Add Speaker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Assign Speaker to Session */}
      {assignModalOpen && selectedSpeaker && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C1917] border border-[#EFE8DA] dark:border-stone-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#EFE8DA] dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Mic size={18} className="text-[#B45309] dark:text-[#F59E0B]" />
                <h3 className="font-extrabold text-base text-stone-900 dark:text-[#F5F2EB]">Assign {selectedSpeaker.name}</h3>
              </div>
              <button 
                onClick={() => { setAssignModalOpen(false); setSelectedSpeaker(null); }}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Select a conference session to assign <strong>{selectedSpeaker.name}</strong> as a presenter or panelist.
              </p>

              {sessions.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-beige">
                  {sessions.map(sess => (
                    <button
                      key={sess._id}
                      onClick={() => assignSpeakerMutation.mutate({ speakerId: selectedSpeaker._id, sessionId: sess._id })}
                      disabled={assignSpeakerMutation.isPending}
                      className="w-full text-left p-3.5 bg-[#FAF8F5] dark:bg-[#292524] hover:bg-[#B45309]/10 dark:hover:bg-[#B45309]/20 border border-[#EFE8DA] dark:border-stone-700 hover:border-[#B45309] rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-stone-900 dark:text-[#F5F2EB] group-hover:text-[#B45309]">{sess.title}</p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">{sess.room} • {new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <Plus size={14} className="text-stone-400 group-hover:text-[#B45309]" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs rounded-2xl border border-amber-200 dark:border-amber-800/50">
                  No sessions exist for this event yet. Create sessions in the "Sessions &amp; Multi-Track" tab first.
                </div>
              )}

              <button
                type="button"
                onClick={() => { setAssignModalOpen(false); setSelectedSpeaker(null); }}
                className="w-full py-2.5 bg-[#FAF8F5] dark:bg-[#292524] border border-[#EFE8DA] dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

