import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Search, Loader2, Copy, Check, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function AISessionFinder({ eventId }) {
  const [interests, setInterests] = useState('');
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: async (customQuery) => {
      const q = customQuery || interests;
      const res = await api.post(`/events/${eventId}/ai/attendee-recommendations`, { interests: q });
      return res.recommendations || res.content || res;
    }
  });

  const handleCopy = () => {
    if (!mutation.data) return;
    navigator.clipboard.writeText(mutation.data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickTopic = (topic) => {
    setInterests(topic);
    mutation.mutate(topic);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm relative overflow-hidden flex flex-col font-sans">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-[#B45309]">
          <Sparkles size={18} className="animate-spin text-[#B45309]" />
          <h3 className="font-extrabold text-base text-stone-900">AI Session Matchmaker</h3>
        </div>
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-[#B45309] border border-amber-200">
          Smart Concierge
        </span>
      </div>
      <p className="text-xs text-stone-500 mb-3.5">Input your technical focus to synthesize a personalized agenda.</p>
      
      {/* Quick Search Input */}
      <div className="relative mb-2.5">
        <input 
          type="text" 
          placeholder="e.g. AI Agents, Distributed Systems, Zero-Trust..." 
          value={interests}
          onChange={e => setInterests(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && interests && mutation.mutate()}
          className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
        />
        <button 
          onClick={() => mutation.mutate()}
          disabled={!interests || mutation.isPending}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#B45309] text-white rounded-lg disabled:opacity-50 hover:bg-[#92400E] transition-colors shadow-xs cursor-pointer"
        >
          {mutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
        </button>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {['AI Agents', 'Architecture', 'Security', 'FinTech'].map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => handleQuickTopic(pill)}
            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-stone-600 hover:text-[#B45309] hover:bg-amber-50 border border-[#EFE8DA] transition-all cursor-pointer"
          >
            +{pill}
          </button>
        ))}
      </div>

      {/* Compact Scrollable Result Card with Custom Scrollbar */}
      {mutation.isSuccess && (
        <div className="mt-1 p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] animate-in fade-in flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#EFE8DA]/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1">
              <Sparkles size={11} className="text-[#B45309]" /> Recommended Itinerary
            </span>
            <button
              onClick={handleCopy}
              className="text-[11px] font-bold text-stone-600 hover:text-[#B45309] flex items-center gap-1 transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto scrollbar-beige text-xs text-stone-800 whitespace-pre-wrap leading-relaxed pr-1">
            {mutation.data}
          </div>
        </div>
      )}
      
      {mutation.isError && (
        <div className="mt-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
          Failed to generate agenda. Please check network or try a different topic.
        </div>
      )}
    </div>
  );
}
