import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Save, CheckCircle, AlertCircle, RefreshCw, Building, Mail, Globe, DollarSign } from 'lucide-react';
import { api } from '../../services/api';

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('eventforge_user') || '{}');
  const org = user.organization || {};

  const [formData, setFormData] = useState({
    name: org.name || 'TechConf Global',
    contactEmail: org.contactEmail || user.email || 'admin@techconf.io',
    timezone: org.settings?.timezone || 'America/New_York',
    currency: org.settings?.currency || 'USD',
    supportEmail: org.settings?.supportEmail || user.email || 'support@techconf.io'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (data) => api.patch('/auth/organization', {
      name: data.name,
      contactEmail: data.contactEmail,
      settings: {
        timezone: data.timezone,
        currency: data.currency,
        supportEmail: data.supportEmail
      }
    }),
    onSuccess: (updatedOrg) => {
      // Update local storage user object with new organization details
      const updatedUser = { ...user, organization: updatedOrg };
      localStorage.setItem('eventforge_user', JSON.stringify(updatedUser));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Organization Settings</h1>
        <p className="text-slate-500 mt-1">Manage platform preferences, support emails, and company details</p>
      </div>

      {savedSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
          <CheckCircle size={20} /> Organization settings updated successfully!
        </div>
      )}

      {saveMutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle size={20} /> {saveMutation.error?.message || 'Failed to update organization settings'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <Building className="text-brand" size={24} />
          <div>
            <h3 className="text-lg font-bold text-slate-900">Organization Profile</h3>
            <p className="text-xs text-slate-500">Configure your company identity and system preferences</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Building size={16} className="text-slate-400" /> Organization Legal Name
              </label>
              <input 
                required
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Mail size={16} className="text-slate-400" /> Primary Contact Email
              </label>
              <input 
                required
                type="email" 
                value={formData.contactEmail} 
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Globe size={16} className="text-slate-400" /> Default Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand focus:border-brand"
              >
                <option value="America/New_York">Eastern Time (US &amp; Canada)</option>
                <option value="America/Chicago">Central Time (US &amp; Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US &amp; Canada)</option>
                <option value="Europe/London">London (GMT / UTC)</option>
                <option value="Asia/Kolkata">India (IST / UTC+5:30)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <DollarSign size={16} className="text-slate-400" /> Currency
              </label>
              <select
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand focus:border-brand"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Mail size={16} className="text-slate-400" /> Attendee Support Email
              </label>
              <input 
                required
                type="email" 
                value={formData.supportEmail} 
                onChange={e => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              <span className="font-semibold text-slate-700">Subscription Tier:</span> {org.plan || 'ENTERPRISE'}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Account Role:</span> {user.role || 'ORGANIZER'}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={saveMutation.isPending}
            className="bg-brand text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand/20 hover:bg-brand/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saveMutation.isPending ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {saveMutation.isPending ? 'Saving...' : 'Save Organization Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
