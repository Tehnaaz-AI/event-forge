import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, MapPin, Users, Type, AlignLeft, Image as ImageIcon, 
  Palette, Sparkles, ArrowRight, ShieldCheck, Check, Upload 
} from 'lucide-react';
import { api } from '../../services/api';
import useDocumentTitle from '../../components/common/useDocumentTitle';

const COLOR_PRESETS = [
  { label: 'Obsidian Velvet', hex: '#1C1917', text: 'text-stone-100', border: 'border-stone-700' },
  { label: 'Amber Rust', hex: '#B45309', text: 'text-amber-100', border: 'border-amber-600' },
  { label: 'Emerald Prestige', hex: '#047857', text: 'text-emerald-100', border: 'border-emerald-600' },
  { label: 'Royal Navy', hex: '#1E3A8A', text: 'text-blue-100', border: 'border-blue-600' },
  { label: 'Deep Amethyst', hex: '#581C87', text: 'text-purple-100', border: 'border-purple-600' },
  { label: 'Velvet Terracotta', hex: '#7C2D12', text: 'text-orange-100', border: 'border-orange-700' }
];

export default function NewEvent() {
  useDocumentTitle('Create Conference Summit', 'Launch a new flagship multi-track summit.');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'CONFERENCE',
    category: 'Technology',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
    capacity: 500,
    venue: { name: 'Convention Center Main Hall', address: '100 Enterprise Way' },
    tags: 'AI, Keynote, Innovation',
    status: 'REGISTRATION_OPEN',
    cardColor: '#1C1917',
    bannerImage: ''
  });

  const [imagePreview, setImagePreview] = useState('');

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, bannerImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const createEvent = useMutation({
    mutationFn: (data) => api.post('/events', data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-events-overview'] });
      navigate(`/dashboard/organizer/events/${response._id}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createEvent.mutate({
      ...formData,
      capacity: parseInt(formData.capacity) || 500,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : formData.tags
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 font-sans text-stone-900 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 bg-[#B45309]/10 text-[#B45309] rounded-full border border-[#B45309]/20">
            Flagship Event Creator
          </span>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-1">Create Conference Summit</h1>
          <p className="text-xs text-stone-500">Set up tracks, venue, ticket tiers, and luxury branding.</p>
        </div>
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="text-xs font-bold text-stone-500 hover:text-stone-900 px-3 py-1.5 rounded-xl border border-[#EFE8DA] bg-white transition-all"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {createEvent.isError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold">
            Creation Error: {createEvent.error.message}
          </div>
        )}

        {/* Live Card Preview Banner */}
        <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#B45309]" /> Live Event Card Preview
            </h3>
            <span className="text-[10px] text-stone-400 font-medium">As shown on public discover &amp; organizer dashboard</span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#EFE8DA] shadow-sm max-w-sm bg-white">
            <div 
              className="h-28 flex items-start justify-between p-4 relative transition-all duration-300 bg-cover bg-center"
              style={{
                backgroundColor: formData.cardColor,
                backgroundImage: formData.bannerImage ? `url(${formData.bannerImage})` : undefined
              }}
            >
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
              <span className="relative z-10 text-[10px] font-extrabold bg-white/95 dark:bg-[#1C1917]/95 text-stone-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md border border-white/20 dark:border-amber-500/30">
                {formData.category || 'CONFERENCE'}
              </span>
              <span className="relative z-10 text-[10px] font-extrabold bg-[#B45309] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                {formData.status.replace('_', ' ')}
              </span>
            </div>
            <div className="p-4 space-y-1">
              <h4 className="font-extrabold text-sm text-stone-900 truncate">{formData.title || 'Conference Title'}</h4>
              <p className="text-xs text-stone-500 line-clamp-1">{formData.description || 'Event description summary...'}</p>
            </div>
          </div>
        </div>

        {/* Primary Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE8DA] shadow-xs space-y-5">
          <h3 className="text-sm font-extrabold text-stone-900 border-b border-[#EFE8DA] pb-3">1. General Summit Metadata</h3>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Type size={14} className="text-[#B45309]" /> Conference Title *
            </label>
            <input 
              required 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
              className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-4 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B45309] transition-colors" 
              placeholder="e.g. Global AI & Cloud Summit 2026" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <AlignLeft size={14} className="text-[#B45309]" /> Executive Description *
            </label>
            <textarea 
              required 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              rows="3" 
              className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#B45309] transition-colors leading-relaxed" 
              placeholder="Provide context, mission, and who should attend..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Event Type</label>
              <select 
                value={formData.eventType} 
                onChange={e => setFormData({ ...formData, eventType: e.target.value })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B45309]"
              >
                <option value="CONFERENCE">Conference</option>
                <option value="SUMMIT">Executive Summit</option>
                <option value="WORKSHOP">Workshop / Masterclass</option>
                <option value="EXHIBITION">Exhibition / Expo</option>
                <option value="SYMPOSIUM">Symposium</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
              <input 
                required 
                type="text" 
                value={formData.category} 
                onChange={e => setFormData({ ...formData, category: e.target.value })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B45309]" 
                placeholder="Technology, Healthcare, Finance..." 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Initial Status</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({ ...formData, status: e.target.value })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3 py-2 text-xs font-bold text-[#B45309] focus:outline-none focus:border-[#B45309]"
              >
                <option value="REGISTRATION_OPEN">Registration Open (Active)</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visual Styling: Colors & Image Upload */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE8DA] shadow-xs space-y-5">
          <h3 className="text-sm font-extrabold text-stone-900 border-b border-[#EFE8DA] pb-3 flex items-center gap-2">
            <Palette size={16} className="text-[#B45309]" /> 2. Visual Theme &amp; Card Branding
          </h3>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-stone-700">Solid / Luxury Color Theme</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {COLOR_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.hex}
                  onClick={() => setFormData({ ...formData, cardColor: preset.hex })}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    formData.cardColor === preset.hex 
                      ? 'border-[#B45309] ring-2 ring-[#B45309]/30 shadow-xs' 
                      : 'border-[#EFE8DA] hover:border-stone-400'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full shadow-inner flex items-center justify-center text-white" style={{ backgroundColor: preset.hex }}>
                    {formData.cardColor === preset.hex && <Check size={14} />}
                  </div>
                  <span className="text-[10px] font-bold text-stone-700 text-center">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Upload size={14} className="text-[#B45309]" /> Upload Banner Image (Optional)
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageFile}
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3 py-2 text-xs text-stone-700 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#B45309] file:text-white hover:file:bg-[#92400E] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-[#B45309]" /> Or Direct Banner Image URL
              </label>
              <input 
                type="url" 
                value={formData.bannerImage.startsWith('data:') ? '' : formData.bannerImage} 
                onChange={e => {
                  setFormData({ ...formData, bannerImage: e.target.value });
                  setImagePreview(e.target.value);
                }} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:border-[#B45309]" 
                placeholder="https://images.unsplash.com/..." 
              />
            </div>
          </div>
        </div>

        {/* Schedule & Capacity */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE8DA] shadow-xs space-y-5">
          <h3 className="text-sm font-extrabold text-stone-900 border-b border-[#EFE8DA] pb-3">3. Dates, Venue &amp; Delegate Scale</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#B45309]" /> Start Date &amp; Time
              </label>
              <input 
                required 
                type="datetime-local" 
                value={formData.startDate} 
                onChange={e => setFormData({ ...formData, startDate: e.target.value })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B45309]" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#B45309]" /> End Date &amp; Time
              </label>
              <input 
                required 
                type="datetime-local" 
                value={formData.endDate} 
                onChange={e => setFormData({ ...formData, endDate: e.target.value })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B45309]" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <MapPin size={14} className="text-[#B45309]" /> Venue / Hall Name
              </label>
              <input 
                required 
                type="text" 
                value={formData.venue.name} 
                onChange={e => setFormData({ ...formData, venue: { ...formData.venue, name: e.target.value } })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B45309]" 
                placeholder="e.g. Grand Convention Center" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Users size={14} className="text-[#B45309]" /> Maximum Capacity Target
              </label>
              <input 
                required 
                type="number" 
                min="1" 
                value={formData.capacity} 
                onChange={e => setFormData({ ...formData, capacity: e.target.value })} 
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B45309]" 
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="px-5 py-3 rounded-2xl text-xs font-bold text-stone-600 bg-white border border-[#EFE8DA] hover:bg-stone-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={createEvent.isPending} 
            className="bg-[#B45309] hover:bg-[#92400E] text-white px-8 py-3 rounded-2xl font-bold text-xs shadow-md shadow-[#B45309]/20 transition-all flex items-center gap-2"
          >
            <span>{createEvent.isPending ? 'Publishing Summit...' : 'Create & Launch Summit'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
