import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Ticket, Plus, Trash2, Edit3, DollarSign, Users, 
  CheckCircle2, X, RefreshCcw, Tag, ShieldCheck, 
  Layers, Percent, TrendingUp 
} from 'lucide-react';
import { api } from '../../services/api';

export default function TicketManager({ eventId }) {
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState(199);
  const [capacity, setCapacity] = useState(100);
  const [description, setDescription] = useState('');

  // Fetch Ticket Categories
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', eventId],
    queryFn: () => api.get(`/events/${eventId}/tickets`)
  });

  // Mutations
  const createTicketMutation = useMutation({
    mutationFn: (newTier) => api.post(`/events/${eventId}/tickets`, newTier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-analytics', eventId] });
      setAddModalOpen(false);
      setName('');
      setPrice(199);
      setCapacity(100);
      setDescription('');
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ categoryId, data }) => api.patch(`/events/${eventId}/tickets/${categoryId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-analytics', eventId] });
      setEditModalOpen(false);
      setSelectedCategory(null);
    }
  });

  const deleteTicketMutation = useMutation({
    mutationFn: (categoryId) => api.delete(`/events/${eventId}/tickets/${categoryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-analytics', eventId] });
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name) return;
    createTicketMutation.mutate({
      name,
      price: Number(price),
      capacity: Number(capacity),
      description
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    updateTicketMutation.mutate({
      categoryId: selectedCategory._id,
      data: {
        name,
        price: Number(price),
        capacity: Number(capacity),
        description
      }
    });
  };

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setName(cat.name || '');
    setPrice(cat.price ?? 0);
    setCapacity(cat.capacity ?? 100);
    setDescription(cat.description || '');
    setEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-stone-500">
        <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading ticket categories &amp; pricing tiers...
      </div>
    );
  }

  const totalSeats = tickets.reduce((acc, t) => acc + (t.capacity || 0), 0);
  const totalAvailable = tickets.reduce((acc, t) => acc + (t.availableQuantity || 0), 0);
  const totalSold = totalSeats - totalAvailable;
  const totalPotentialRevenue = tickets.reduce((acc, t) => acc + ((t.capacity || 0) * (t.price || 0)), 0);

  return (
    <div className="space-y-8 animate-in fade-in font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Ticket size={20} className="text-[#B45309]" /> Tickets &amp; Admission Pricing Tiers
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure pass prices, delegate seat capacities, early bird rates, and included admission perks.
          </p>
        </div>
        <button
          onClick={() => {
            setName('');
            setPrice(199);
            setCapacity(100);
            setDescription('');
            setAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded-2xl text-xs font-bold shadow-sm shadow-[#B45309]/20 transition-all shrink-0"
        >
          <Plus size={14} /> Add Ticket Tier
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Seating Quota</p>
            <p className="text-2xl font-black text-stone-900 mt-0.5">{totalSeats} <span className="text-xs text-stone-400 font-medium">seats</span></p>
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Passes Sold</p>
            <p className="text-2xl font-black text-[#B45309] mt-0.5">{totalSold} <span className="text-xs text-stone-400 font-medium">/ {totalSeats}</span></p>
          </div>
          <div className="w-10 h-10 bg-[#B45309]/10 rounded-xl flex items-center justify-center text-[#B45309]">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Gross Revenue Potential</p>
            <p className="text-2xl font-black text-stone-900 mt-0.5">${totalPotentialRevenue.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
            <DollarSign size={18} />
          </div>
        </div>
      </div>

      {/* Ticket Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tickets.map(cat => {
          const sold = (cat.capacity || 0) - (cat.availableQuantity || 0);
          const percentSold = cat.capacity > 0 ? Math.min(100, Math.round((sold / cat.capacity) * 100)) : 0;

          return (
            <div 
              key={cat._id}
              className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#B45309] to-[#C28E27]"></div>

              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-base font-extrabold text-stone-900">{cat.name}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1 text-stone-400 hover:text-stone-800 transition-colors"
                      title="Edit Price / Capacity"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${cat.name}" category?`)) {
                          deleteTicketMutation.mutate(cat._id);
                        }
                      }}
                      className="p-1 text-stone-300 hover:text-rose-600 transition-colors"
                      title="Delete Tier"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-extrabold text-[#B45309]">
                    {cat.price > 0 ? `$${Number(cat.price).toLocaleString()}` : 'Free'}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">/ delegate</span>
                </div>

                {cat.description ? (
                  <p className="text-xs text-stone-600 mb-4 line-clamp-2 leading-relaxed">{cat.description}</p>
                ) : (
                  <p className="text-xs text-stone-400 italic mb-4">Standard admission access.</p>
                )}

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-4 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EFE8DA]">
                  <div className="flex justify-between text-[11px] font-bold text-stone-700">
                    <span>{sold} sold</span>
                    <span className="text-stone-500">{cat.availableQuantity} available</span>
                  </div>
                  <div className="h-2 w-full bg-stone-200/70 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#B45309] to-[#C28E27] rounded-full transition-all duration-500" 
                      style={{ width: `${percentSold}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>0</span>
                    <span>{cat.capacity} max cap</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFE8DA] flex justify-between items-center text-xs">
                <span className="font-bold text-stone-500">
                  Total Tier Cap: {cat.capacity}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  cat.availableQuantity > 0 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {cat.availableQuantity > 0 ? 'On Sale' : 'Sold Out'}
                </span>
              </div>
            </div>
          );
        })}

        {tickets.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-[#EFE8DA] space-y-3">
            <Ticket size={40} className="mx-auto text-stone-300" />
            <h4 className="text-sm font-extrabold text-stone-800">No Ticket Tiers Configured</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Create admission pricing tiers (e.g. VIP All-Access, Early Bird, General Pass) so attendees can purchase tickets on your public page.
            </p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#B45309]/20 transition-all"
            >
              <Plus size={13} /> Add First Ticket Tier
            </button>
          </div>
        )}
      </div>

      {/* MODAL: ADD TICKET TIER */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFE8DA] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#EFE8DA] pb-3">
              <div className="flex items-center gap-2">
                <Ticket size={18} className="text-[#B45309]" />
                <h3 className="font-extrabold text-base text-stone-900">Add Ticket Pricing Tier</h3>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tier Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Executive VIP All-Access"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Pass Price ($) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Total Capacity (Seats) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description &amp; Included Access</label>
                <textarea
                  rows="3"
                  placeholder="All-day keynote access, VIP lounge catering, multi-track breakout pass..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="w-1/2 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTicketMutation.isPending}
                  className="w-1/2 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold shadow-md shadow-[#B45309]/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {createTicketMutation.isPending ? <RefreshCcw size={13} className="animate-spin" /> : <Plus size={13} />}
                  {createTicketMutation.isPending ? 'Saving...' : 'Create Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TICKET TIER */}
      {editModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFE8DA] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#EFE8DA] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-[#B45309]" />
                <h3 className="font-extrabold text-base text-stone-900">Edit Ticket Tier</h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tier Name *</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Pass Price ($) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Total Capacity (Seats) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description &amp; Included Access</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="w-1/2 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateTicketMutation.isPending}
                  className="w-1/2 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold shadow-md shadow-[#B45309]/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {updateTicketMutation.isPending ? <RefreshCcw size={13} className="animate-spin" /> : <Edit3 size={13} />}
                  {updateTicketMutation.isPending ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
