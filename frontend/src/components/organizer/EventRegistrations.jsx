import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, Search, Filter, ShieldCheck, Crown, Clock, 
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Mail, Phone, Ticket
} from 'lucide-react';
import { api } from '../../services/api';

export default function EventRegistrations({ eventId }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'CONFIRMED' | 'CHECKED_IN' | 'VIP' | 'WAITLISTED' | 'CANCELLED'

  const { data: registrations, isLoading, error, refetch } = useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: () => api.get(`/events/${eventId}/registrations`),
    refetchInterval: 5000,
    refetchOnWindowFocus: true
  });

  if (isLoading) {
    return (
      <div className="p-16 text-center text-stone-500">
        <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading registered delegates directory...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center text-rose-800 bg-rose-50 rounded-3xl border border-rose-200 text-xs font-semibold">
        Failed to load registered attendees. {error.message}
      </div>
    );
  }

  const items = registrations || [];
  const totalCount = items.length;
  const confirmedCount = items.filter(r => r.registrationStatus === 'CONFIRMED').length;
  const checkedInCount = items.filter(r => r.ticket?.status === 'USED').length;
  const vipCount = items.filter(r => r.isVIP).length;
  const waitlistedCount = items.filter(r => r.registrationStatus === 'WAITLISTED').length;

  const filtered = items.filter(item => {
    if (statusFilter === 'CONFIRMED' && item.registrationStatus !== 'CONFIRMED') return false;
    if (statusFilter === 'CHECKED_IN' && item.ticket?.status !== 'USED') return false;
    if (statusFilter === 'VIP' && !item.isVIP) return false;
    if (statusFilter === 'WAITLISTED' && item.registrationStatus !== 'WAITLISTED') return false;
    if (statusFilter === 'CANCELLED' && item.registrationStatus !== 'CANCELLED') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const name = item.attendee?.name?.toLowerCase() || '';
      const email = item.attendee?.email?.toLowerCase() || '';
      const ticketNum = item.ticket?.ticketNumber?.toLowerCase() || '';
      const category = item.ticketCategory?.name?.toLowerCase() || '';
      return name.includes(q) || email.includes(q) || ticketNum.includes(q) || category.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans text-stone-900 animate-in fade-in duration-300">
      
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Registered</span>
            <Users size={16} className="text-[#B45309]" />
          </div>
          <p className="text-2xl font-extrabold text-stone-900">{totalCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Confirmed Passes</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-stone-900">{confirmedCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Door Checked-In</span>
            <ShieldCheck size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-stone-900">{checkedInCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">VIP Tier Attendees</span>
            <Crown size={16} className="text-[#C28E27]" />
          </div>
          <p className="text-2xl font-extrabold text-stone-900">{vipCount}</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by delegate name, email, pass ID, or ticket tier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl text-xs font-medium focus:outline-none focus:border-[#B45309]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: `All (${totalCount})` },
            { id: 'CONFIRMED', label: `Confirmed (${confirmedCount})` },
            { id: 'CHECKED_IN', label: `Checked-In (${checkedInCount})` },
            { id: 'VIP', label: `VIP (${vipCount})` },
            { id: 'WAITLISTED', label: `Waitlist (${waitlistedCount})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? 'bg-[#B45309] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-100 border border-[#EFE8DA]'
              }`}
            >
              {f.label}
            </button>
          ))}

          <button
            onClick={() => refetch()}
            title="Refresh list"
            className="p-2 bg-stone-50 border border-[#EFE8DA] rounded-xl text-stone-600 hover:bg-stone-100 transition-colors shrink-0"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-3xl border border-[#EFE8DA] shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Users size={36} className="mx-auto text-stone-300" />
            <p className="text-xs font-bold text-stone-700">No matching attendees found</p>
            <p className="text-[10px] text-stone-400">Try adjusting your search query or filter tab.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EFE8DA] bg-[#FAF8F5] text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                  <th className="py-3.5 px-6">Delegate</th>
                  <th className="py-3.5 px-4">Pass Tier</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Digital Pass ID</th>
                  <th className="py-3.5 px-4">Check-In</th>
                  <th className="py-3.5 px-6 text-right">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DA] text-xs">
                {filtered.map(reg => {
                  const isCheckedIn = reg.ticket?.status === 'USED';
                  return (
                    <tr key={reg._id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1C1917] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {reg.attendee?.name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-stone-900">{reg.attendee?.name || 'Attendee'}</span>
                              {reg.isVIP && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[9px] font-extrabold">
                                  <Crown size={10} className="text-[#C28E27]" /> VIP
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500">{reg.attendee?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-medium text-stone-800">{reg.ticketCategory?.name || 'Standard Pass'}</span>
                        <p className="text-[10px] text-stone-400 font-mono">${reg.amount || reg.ticketCategory?.price || 0}</p>
                      </td>

                      <td className="py-4 px-4">
                        {reg.registrationStatus === 'CONFIRMED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 size={12} /> Confirmed
                          </span>
                        ) : reg.registrationStatus === 'WAITLISTED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock size={12} /> Standby (#{reg.waitlistPosition || '—'})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                            <XCircle size={12} /> {reg.registrationStatus}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {reg.ticket ? (
                          <span className="font-mono text-[11px] text-stone-700 bg-stone-100 px-2 py-1 rounded-md border border-stone-200">
                            {reg.ticket.ticketNumber}
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic">No pass issued</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            <ShieldCheck size={12} /> Verified at Door
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400">Not scanned</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right font-mono text-[11px] text-stone-500">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
