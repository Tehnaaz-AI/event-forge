import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Crown, Users, ArrowUpRight, CheckCircle, RefreshCw, 
  Search, ShieldAlert, Sparkles, Filter, AlertCircle, Clock, 
  UserCheck, ChevronRight, Check, Zap, X
} from 'lucide-react';
import { api } from '../../services/api';

export default function WaitlistManager({ eventId }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'VIP' | 'STANDARD'
  const [search, setSearch] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [overrideCapacity, setOverrideCapacity] = useState(false);

  // Fetch event-scoped waitlist
  const { data: waitlist, isLoading, error, refetch } = useQuery({
    queryKey: ['event-waitlist', eventId],
    queryFn: () => api.get(`/events/${eventId}/waitlist`)
  });

  // Promote mutation
  const promoteMutation = useMutation({
    mutationFn: ({ registrationId, overrideCapacity }) => 
      api.post(`/events/${eventId}/waitlist/${registrationId}/promote`, { overrideCapacity }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-waitlist', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-analytics', eventId] });
      setSelectedAttendee(null);
      alert(`Success: ${data?.registration?.attendee?.name || 'Attendee'} promoted to Confirmed Delegate with active QR pass.`);
    },
    onError: (err) => {
      alert(`Promotion failed: ${err.message}`);
    }
  });

  // Priority toggle mutation
  const priorityMutation = useMutation({
    mutationFn: ({ registrationId, isVIP, priorityScore }) =>
      api.patch(`/events/${eventId}/waitlist/${registrationId}/priority`, { isVIP, priorityScore }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-waitlist', eventId] });
    },
    onError: (err) => {
      alert(`Failed to update priority: ${err.message}`);
    }
  });

  if (isLoading) {
    return (
      <div className="p-16 text-center text-stone-500">
        <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading priority waitlist queue...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center text-rose-800 bg-rose-50 rounded-3xl border border-rose-200 text-xs font-semibold">
        Failed to load waitlist queue. {error.message}
      </div>
    );
  }

  const items = waitlist || [];
  const totalWaitlisted = items.length;
  const vipCount = items.filter(r => r.isVIP).length;
  const standardCount = totalWaitlisted - vipCount;

  // Filter & search
  const filtered = items.filter(item => {
    if (filter === 'VIP' && !item.isVIP) return false;
    if (filter === 'STANDARD' && item.isVIP) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = item.attendee?.name?.toLowerCase() || '';
      const email = item.attendee?.email?.toLowerCase() || '';
      const tier = item.ticketCategory?.name?.toLowerCase() || '';
      return name.includes(q) || email.includes(q) || tier.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-stone-900">
      
      {/* Header Banner */}
      <div className="bg-[#1C1917] text-[#FDFAF5] p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 text-[#C28E27] rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 backdrop-blur-md border border-white/10">
              <Crown size={13} className="text-[#C28E27]" /> VIP Priority Engine
            </span>
            <span className="text-xs text-stone-400">Deterministic FIFO within Priority</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">VIP &amp; Delegate Waitlist Queue</h2>
          <p className="text-stone-300 text-xs leading-relaxed">
            Manage sold-out category pipelines. High-priority VIP passes are automatically promoted first whenever cancellations occur or capacity opens.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/10 w-max"
        >
          <RefreshCw size={14} /> Refresh Queue
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-700 font-bold shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Standby Queue</p>
            <p className="text-2xl font-extrabold text-stone-900">{totalWaitlisted}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#B45309]/10 flex items-center justify-center text-[#B45309] font-bold shrink-0">
            <Crown size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider">👑 VIP Priority Tier</p>
            <p className="text-2xl font-extrabold text-[#B45309]">{vipCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 font-bold shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Standard Standby</p>
            <p className="text-2xl font-extrabold text-stone-900">{standardCount}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-[#EFE8DA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by attendee name, email, or pass tier..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#B45309]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL' ? 'bg-[#1C1917] text-white' : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-100'
            }`}
          >
            All ({totalWaitlisted})
          </button>
          <button
            onClick={() => setFilter('VIP')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'VIP' ? 'bg-[#B45309] text-white' : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Crown size={12} /> VIP Priority ({vipCount})
          </button>
          <button
            onClick={() => setFilter('STANDARD')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'STANDARD' ? 'bg-[#1C1917] text-white' : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-100'
            }`}
          >
            Standard ({standardCount})
          </button>
        </div>
      </div>

      {/* Waitlist Table / Cards */}
      <div className="bg-white rounded-3xl border border-[#EFE8DA] shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y divide-[#EFE8DA]">
            {filtered.map((item, idx) => {
              const joinDate = item.createdAt ? new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recently';
              return (
                <div 
                  key={item._id}
                  className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF8F5]/80 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                      item.isVIP 
                        ? 'bg-[#B45309]/15 text-[#B45309] border border-[#B45309]/30' 
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}>
                      #{item.queueIndex || idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-stone-900 truncate">
                          {item.attendee?.name || 'Registered Delegate'}
                        </h4>
                        {item.isVIP ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/20">
                            <Crown size={11} /> VIP PRIORITY
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
                            Standard
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 truncate">{item.attendee?.email}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        Target Tier: <strong className="text-stone-700">{item.ticketCategory?.name || 'General Admission'}</strong> • Joined {joinDate}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Priority Toggle */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => priorityMutation.mutate({
                        registrationId: item._id,
                        isVIP: !item.isVIP,
                        priorityScore: !item.isVIP ? 10 : 0
                      })}
                      disabled={priorityMutation.isPending}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        item.isVIP
                          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          : 'bg-[#FAF8F5] text-stone-600 border-[#EFE8DA] hover:border-[#B45309] hover:text-[#B45309]'
                      }`}
                      title={item.isVIP ? "Downgrade to Standard priority" : "Grant VIP Priority Status"}
                    >
                      {item.isVIP ? '👑 Revoke VIP' : '👑 Grant VIP'}
                    </button>

                    <button
                      onClick={() => setSelectedAttendee(item)}
                      className="px-3.5 py-1.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Zap size={13} /> Promote to Pass
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center space-y-3">
            <Users size={36} className="mx-auto text-stone-300" />
            <h4 className="font-extrabold text-stone-800 text-sm">No Waitlisted Attendees Found</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {search ? 'No waitlisted entries match your search query.' : 'There are currently no delegates in the standby waitlist queue for this conference.'}
            </p>
          </div>
        )}
      </div>

      {/* Manual Promotion Modal */}
      {selectedAttendee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#EFE8DA] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#EFE8DA] pb-3">
              <div className="flex items-center gap-2">
                <Crown className="text-[#B45309]" size={20} />
                <h3 className="font-extrabold text-stone-900 text-base">Promote Waitlisted Delegate</h3>
              </div>
              <button onClick={() => setSelectedAttendee(null)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] space-y-2">
              <p className="text-xs font-bold text-stone-900">{selectedAttendee.attendee?.name}</p>
              <p className="text-xs text-stone-500">{selectedAttendee.attendee?.email}</p>
              <div className="pt-2 border-t border-[#EFE8DA] flex items-center justify-between text-xs">
                <span className="text-stone-500">Tier: {selectedAttendee.ticketCategory?.name}</span>
                <span className="font-bold text-[#B45309]">
                  {selectedAttendee.isVIP ? '👑 VIP Priority' : 'Standard'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrideCapacity}
                  onChange={e => setOverrideCapacity(e.target.checked)}
                  className="rounded text-[#B45309] focus:ring-[#B45309]"
                />
                <span>Allow capacity override if ticket category is at maximum capacity</span>
              </label>

              <p className="text-[11px] text-stone-500">
                Promoting will automatically generate a valid digital pass with QR badge and notify the attendee.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAttendee(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={promoteMutation.isPending}
                onClick={() => promoteMutation.mutate({
                  registrationId: selectedAttendee._id,
                  overrideCapacity
                })}
                className="px-4 py-2 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <CheckCircle size={14} />
                {promoteMutation.isPending ? 'Promoting...' : 'Confirm Promotion'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
