import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Search, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export default function AISessionFinder({ eventId }) {
  const [interests, setInterests] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/events/${eventId}/ai/attendee-recommendations`, { interests });
      return res.recommendations || res.content || res;
    }
  });

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm relative overflow-hidden group">
      <div className="flex items-center gap-2 text-[#B45309] mb-1">
        <Sparkles size={18} className="animate-pulse" />
        <h3 className="font-extrabold text-base text-stone-900">AI Session Matchmaker</h3>
      </div>
      <p className="text-xs text-stone-500 mb-4">Input your learning focus to synthesize a personalized agenda.</p>
      
      <div className="relative mb-3">
        <input 
          type="text" 
          placeholder="e.g. AI Agents, Distributed Systems..." 
          value={interests}
          onChange={e => setInterests(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && interests && mutation.mutate()}
          className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl pl-3 pr-10 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
        />
        <button 
          onClick={() => mutation.mutate()}
          disabled={!interests || mutation.isPending}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#B45309] text-white rounded-lg disabled:opacity-50 hover:bg-[#92400E] transition-colors shadow-xs"
        >
          {mutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
        </button>
      </div>

      {mutation.isSuccess && (
        <div className="mt-3 p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] animate-in fade-in text-xs text-stone-700 whitespace-pre-wrap leading-relaxed">
          {mutation.data}
        </div>
      )}
      
      {mutation.isError && (
        <div className="mt-3 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
          Failed to generate agenda. Please try again.
        </div>
      )}
    </div>
  );
}
