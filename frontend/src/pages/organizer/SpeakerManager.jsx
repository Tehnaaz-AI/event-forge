import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Users, Mail, Phone, Edit, Trash2, ArrowLeft, 
  Sparkles, CheckCircle2, User, Mic 
} from 'lucide-react';
import { api } from '../../services/api';

export default function SpeakerManager() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', bio: '' });

  const { data: speakers, isLoading } = useQuery({
    queryKey: ['organizer-speakers'],
    queryFn: () => api.get('/speakers')
  });

  const saveSpeaker = useMutation({
    mutationFn: (data) => {
      if (editingSpeaker) {
        return api.put(`/speakers/${editingSpeaker._id}`, data);
      }
      return api.post('/speakers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-speakers'] });
      closeForm();
    }
  });

  const deleteSpeaker = useMutation({
    mutationFn: (id) => api.delete(`/speakers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizer-speakers'] })
  });

  const handleEdit = (speaker) => {
    setEditingSpeaker(speaker);
    setFormData({ 
      name: speaker.name, 
      email: speaker.email, 
      phone: speaker.phone || '', 
      bio: speaker.bio || '' 
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSpeaker(null);
    setFormData({ name: '', email: '', phone: '', bio: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSpeaker.mutate(formData);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Mic className="text-[#B45309]" size={28} /> Speaker Directory
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Curate keynote speakers, assign panel roles, and maintain bios across conferences.
          </p>
        </div>

        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-[#B45309] hover:bg-[#92400E] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Add New Speaker
          </button>
        )}
      </div>

      {/* Speaker Form (Add / Edit) */}
      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-[#EFE8DA] shadow-md max-w-2xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#EFE8DA] pb-4 mb-6">
            <h3 className="text-lg font-bold text-stone-900">
              {editingSpeaker ? 'Edit Speaker Profile' : 'Register New Keynote Speaker'}
            </h3>
            <button
              onClick={closeForm}
              className="text-xs font-bold text-stone-400 hover:text-stone-700 transition-colors"
            >
              Cancel &amp; Return
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input 
                  required 
                  disabled={!!editingSpeaker} 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-[#B45309]" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Phone (Optional)
                </label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Professional Bio &amp; Credentials
                </label>
                <textarea 
                  rows="3" 
                  value={formData.bio} 
                  onChange={e => setFormData({ ...formData, bio: e.target.value })} 
                  placeholder="Key areas of expertise, books authored, previous keynote appearances..."
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE8DA]">
              <button 
                type="button" 
                onClick={closeForm} 
                className="px-5 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saveSpeaker.isPending} 
                className="bg-[#B45309] hover:bg-[#92400E] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors disabled:opacity-50"
              >
                {saveSpeaker.isPending ? 'Saving Profile...' : 'Save Speaker'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Speaker Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-500">Loading speaker roster...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers?.map(speaker => (
            <div 
              key={speaker._id} 
              className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center font-bold text-xl uppercase border border-[#B45309]/20">
                    {speaker.avatar ? (
                      <img src={speaker.avatar} alt={speaker.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      speaker.name?.charAt(0) || 'S'
                    )}
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(speaker)} 
                      className="p-2 text-stone-400 hover:text-[#B45309] hover:bg-stone-100 rounded-lg transition-colors"
                      title="Edit Speaker"
                    >
                      <Edit size={15} />
                    </button>
                    <button 
                      onClick={() => { if (confirm(`Remove speaker ${speaker.name}?`)) deleteSpeaker.mutate(speaker._id); }} 
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-stone-900">{speaker.name}</h3>
                
                <div className="space-y-1.5 mt-3 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-[#B45309]" />
                    <span className="font-mono">{speaker.email}</span>
                  </div>
                  {speaker.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-stone-400" />
                      <span>{speaker.phone}</span>
                    </div>
                  )}
                </div>

                {speaker.bio && (
                  <p className="mt-4 text-xs text-stone-600 line-clamp-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#EFE8DA]">
                    {speaker.bio}
                  </p>
                )}
              </div>
            </div>
          ))}

          {(!speakers || speakers.length === 0) && !showForm && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-[#EFE8DA]">
              <Users size={48} className="mx-auto text-stone-300 mb-3" />
              <h3 className="text-base font-bold text-stone-900 mb-1">No Speakers Added Yet</h3>
              <p className="text-xs text-stone-500 mb-4">Add keynote speakers to assign them to multi-track session schedules.</p>
              <button 
                onClick={() => setShowForm(true)} 
                className="text-[#B45309] font-bold text-xs hover:underline"
              >
                + Register First Speaker
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
