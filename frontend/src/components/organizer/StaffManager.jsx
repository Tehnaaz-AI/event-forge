import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, UserPlus, Trash2, ShieldCheck, QrCode, Mail, 
  Phone, Key, CheckCircle2, AlertCircle, Sparkles, X, 
  Copy, ExternalLink, RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

export default function StaffManager({ eventId }) {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'StaffPass123!',
    role: 'CHECK_IN',
    phone: ''
  });

  const { data: staffList, isLoading, error } = useQuery({
    queryKey: ['event-staff', eventId],
    queryFn: () => api.get(`/events/${eventId}/staff`)
  });

  const addStaffMutation = useMutation({
    mutationFn: (data) => api.post(`/events/${eventId}/staff`, data),
    onSuccess: (newStaff) => {
      queryClient.invalidateQueries({ queryKey: ['event-staff', eventId] });
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: 'StaffPass123!', role: 'CHECK_IN', phone: '' });
      setFeedbackMsg({ 
        type: 'success', 
        text: `Staff member "${newStaff.user?.name || formData.name}" added successfully! They can log in immediately at /login.` 
      });
      setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 6000);
    },
    onError: (err) => {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to add staff member' });
      setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 6000);
    }
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (staffId) => api.delete(`/events/${eventId}/staff/${staffId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-staff', eventId] });
      setFeedbackMsg({ type: 'success', text: 'Staff member removed from this conference.' });
      setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 4000);
    },
    onError: (err) => {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Failed to remove staff member' });
      setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 4000);
    }
  });

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2500);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'MANAGER':
        return { label: 'Floor Manager', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'SUPPORT':
        return { label: 'Support Desk', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      default:
        return { label: 'Gatekeeper / QR Scanner', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE8DA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B45309]/10 text-[#B45309] rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            <QrCode size={13} /> On-Site Operations Crew
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Door Staff &amp; Check-In Gatekeepers</h2>
          <p className="text-xs text-stone-500 max-w-xl">
            Authorize event staff to operate optical camera scanners, validate attendee QR passes at venue entrances, and manage check-in queues.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#B45309] hover:bg-[#92400E] text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-md shadow-[#B45309]/20 transition-all shrink-0"
        >
          <UserPlus size={16} /> Add Door Staff
        </button>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMsg.text && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
          feedbackMsg.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span className="font-semibold">{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg({ type: '', text: '' })} className="hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Instructions Card for Organizers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EFE8DA] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h4 className="font-bold text-xs text-stone-900">1. Provision Account</h4>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Create an account with their email and temporary password (`StaffPass123!`).
          </p>
        </div>

        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EFE8DA] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h4 className="font-bold text-xs text-stone-900">2. Staff Login</h4>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Staff navigate to <span className="font-mono text-stone-900 font-bold">/login</span> on their smartphone, tablet, or handheld terminal.
          </p>
        </div>

        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EFE8DA] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h4 className="font-bold text-xs text-stone-900">3. Optical Scanning</h4>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            System automatically routes staff to the live camera scanner at <span className="font-mono text-stone-900 font-bold">/dashboard/staff</span>.
          </p>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-white border border-[#EFE8DA] rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#EFE8DA] flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
            <Users size={16} className="text-[#B45309]" /> Assigned Event Staff ({staffList?.length || 0})
          </h3>
          <span className="text-[11px] text-stone-400">Real-time gatekeeper access</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-stone-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin" /> Loading assigned staff...
          </div>
        ) : staffList?.length === 0 ? (
          <div className="p-16 text-center text-stone-400 space-y-3">
            <Users size={40} className="mx-auto text-stone-300" />
            <p className="text-xs font-bold text-stone-800">No staff members assigned to this event yet</p>
            <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
              Click "Add Door Staff" above to authorize gatekeepers or support personnel for check-in day.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-beige">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#EFE8DA] text-stone-600 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="py-3.5 px-6">Staff Member</th>
                  <th className="py-3.5 px-6">Assigned Duty</th>
                  <th className="py-3.5 px-6">Contact / Phone</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DA]">
                {staffList.map((item) => {
                  const u = item.user || {};
                  const roleBadge = getRoleBadge(item.role);
                  return (
                    <tr key={item._id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                            alt={u.name || 'Staff'} 
                            className="w-9 h-9 rounded-full object-cover border border-[#EFE8DA]"
                          />
                          <div>
                            <div className="font-extrabold text-stone-900">{u.name || 'Staff Member'}</div>
                            <div className="text-[11px] text-stone-500 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${roleBadge.bg}`}>
                          {roleBadge.label}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-stone-600 font-mono text-[11px]">
                        {u.phone || '—'}
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopy(`${u.email} | StaffPass123!`, u.email)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Copy staff login credentials"
                          >
                            <Copy size={14} />
                          </button>

                          <button
                            disabled={deleteStaffMutation.isPending}
                            onClick={() => {
                              if (confirm(`Remove "${u.name || u.email}" from this conference's door staff?`)) {
                                deleteStaffMutation.mutate(item._id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove staff assignment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ADD DOOR STAFF */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFE8DA] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#EFE8DA] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900">Add Door Staff Member</h3>
                <p className="text-xs text-stone-500">Authorize a staff gatekeeper for this conference.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-900">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addStaffMutation.mutate(formData); }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Full Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Staff Email Address *</label>
                <input 
                  type="email"
                  required
                  placeholder="staff.name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Initial Password</label>
                  <input 
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Operational Duty</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                  >
                    <option value="CHECK_IN">Gatekeeper (Scanner)</option>
                    <option value="SUPPORT">Support Desk</option>
                    <option value="MANAGER">Floor Lead</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Direct Mobile Phone</label>
                <input 
                  type="tel"
                  placeholder="+1 (555) 019-2831"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EFE8DA]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addStaffMutation.isPending}
                  className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  {addStaffMutation.isPending ? 'Adding Staff...' : 'Authorize & Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
