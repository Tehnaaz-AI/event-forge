import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building, Plus, AlertCircle, Trash2, Link as LinkIcon, 
  CheckCircle2, DollarSign, X, Layers, Award, ShieldCheck, 
  ExternalLink, Mail, RefreshCcw 
} from 'lucide-react';
import { api } from '../../services/api';

export default function SponsorManager({ eventId }) {
  const queryClient = useQueryClient();

  // Modals state
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);

  // Package Form State
  const [pkgName, setPkgName] = useState('');
  const [pkgPrice, setPkgPrice] = useState(5000);
  const [pkgSpots, setPkgSpots] = useState(5);
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgBenefits, setPkgBenefits] = useState('Keynote stage banner\nLogo on digital badges\nVIP delegate passes');

  // Sponsor Form State
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [website, setWebsite] = useState('');

  // Fetch Sponsors & Packages
  const { data: sponsors = [], isLoading: isLoadingSponsors } = useQuery({
    queryKey: ['sponsors', eventId],
    queryFn: () => api.get(`/events/${eventId}/sponsors`)
  });

  const { data: packages = [], isLoading: isLoadingPackages } = useQuery({
    queryKey: ['sponsor-packages', eventId],
    queryFn: () => api.get(`/events/${eventId}/sponsors/packages`)
  });

  // Mutations
  const createPackageMutation = useMutation({
    mutationFn: (newPkg) => api.post(`/events/${eventId}/sponsors/packages`, newPkg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-packages', eventId] });
      setPackageModalOpen(false);
      setPkgName('');
      setPkgPrice(5000);
      setPkgSpots(5);
      setPkgDesc('');
    }
  });

  const deletePackageMutation = useMutation({
    mutationFn: (pkgId) => api.delete(`/events/${eventId}/sponsors/packages/${pkgId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-packages', eventId] });
    }
  });

  const addSponsorMutation = useMutation({
    mutationFn: (newSponsor) => api.post(`/events/${eventId}/sponsors`, newSponsor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors', eventId] });
      setSponsorModalOpen(false);
      setCompanyName('');
      setContactEmail('');
      setWebsite('');
    }
  });

  const removeSponsorMutation = useMutation({
    mutationFn: (sponsorId) => api.delete(`/events/${eventId}/sponsors/${sponsorId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors', eventId] });
    }
  });

  const handleCreatePackage = (e) => {
    e.preventDefault();
    if (!pkgName) return;
    const benefitsArray = pkgBenefits
      .split('\n')
      .map(b => b.trim())
      .filter(Boolean);

    createPackageMutation.mutate({
      name: pkgName,
      price: Number(pkgPrice),
      availableSpots: Number(pkgSpots),
      description: pkgDesc,
      benefits: benefitsArray
    });
  };

  const handleAddSponsor = (e) => {
    e.preventDefault();
    if (!companyName || !selectedPackageId) return;
    addSponsorMutation.mutate({
      companyName,
      contactEmail: contactEmail || undefined,
      website: website || undefined,
      packageId: selectedPackageId
    });
  };

  if (isLoadingSponsors || isLoadingPackages) {
    return (
      <div className="p-16 text-center text-stone-500">
        <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading sponsor deliverables &amp; packages...
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in font-sans">
      
      {/* 1. Sponsorship Packages Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              <Award size={20} className="text-[#B45309]" /> Sponsorship Packages &amp; Tiers
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Define corporate partnership tiers, pricing, deliverables, and spot quotas.
            </p>
          </div>
          <button
            onClick={() => setPackageModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded-2xl text-xs font-bold shadow-sm shadow-[#B45309]/20 transition-all shrink-0"
          >
            <Plus size={14} /> Create Package Tier
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div 
              key={pkg._id} 
              className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#B45309] to-[#C28E27]"></div>
              
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-base font-extrabold text-stone-900">{pkg.name}</h4>
                  <button
                    onClick={() => deletePackageMutation.mutate(pkg._id)}
                    title="Delete Package"
                    className="text-stone-300 hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-extrabold text-[#B45309]">${Number(pkg.price).toLocaleString()}</span>
                  <span className="text-xs text-stone-400 font-medium">/ package</span>
                </div>

                {pkg.description && (
                  <p className="text-xs text-stone-600 mb-4 line-clamp-2 leading-relaxed">{pkg.description}</p>
                )}

                {pkg.benefits?.length > 0 && (
                  <div className="space-y-2 mb-6 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EFE8DA]">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tier Deliverables</p>
                    <ul className="space-y-1.5">
                      {pkg.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-stone-700">
                          <CheckCircle2 size={14} className="text-[#B45309] shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#EFE8DA] flex justify-between items-center text-xs">
                <span className="font-bold text-stone-500">
                  {pkg.availableSpots > 0 ? `${pkg.availableSpots} spots available` : 'Unlimited spots'}
                </span>
                <span className="text-[10px] font-extrabold bg-[#B45309]/10 text-[#B45309] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Tier Active
                </span>
              </div>
            </div>
          ))}

          {packages.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-[#EFE8DA] space-y-3">
              <Award size={36} className="mx-auto text-stone-300" />
              <p className="text-xs font-bold text-stone-600">No sponsorship tiers configured yet</p>
              <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                Create packages (e.g. Platinum, Gold, Track Partner) to begin onboarding corporate sponsors.
              </p>
              <button
                onClick={() => setPackageModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAF8F5] border border-[#EFE8DA] hover:border-[#B45309] text-stone-700 hover:text-[#B45309] rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Plus size={13} /> Add First Tier
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. Active Event Sponsors Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              <Building size={20} className="text-[#B45309]" /> Active Corporate Sponsors
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Companies supporting this summit and their confirmed sponsorship packages.
            </p>
          </div>
          <button
            onClick={() => {
              if (packages.length === 0) {
                alert('Please create at least one sponsorship tier package before adding sponsors.');
                setPackageModalOpen(true);
                return;
              }
              setSelectedPackageId(packages[0]._id);
              setSponsorModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold shadow-sm transition-all shrink-0"
          >
            <Plus size={14} /> Add Sponsor Partner
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sponsors.map(sponsor => (
            <div 
              key={sponsor._id} 
              className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-sm flex items-center justify-between hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl flex items-center justify-center text-[#B45309] font-extrabold text-lg shadow-xs shrink-0">
                  {sponsor.organization?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-base">{sponsor.organization?.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      {sponsor.package?.name || 'Sponsor Partner'}
                    </span>
                    {sponsor.organization?.contactEmail && (
                      <span className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                        <Mail size={11} /> {sponsor.organization.contactEmail}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeSponsorMutation.mutate(sponsor._id)}
                title="Remove Sponsor"
                className="text-stone-300 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {sponsors.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-[#EFE8DA] space-y-3">
              <Building size={36} className="mx-auto text-stone-300" />
              <p className="text-xs font-bold text-stone-600">No active sponsors onboarded</p>
              <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                Onboard brand partners and assign them to your sponsorship packages.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* MODAL: Create Sponsorship Package */}
      {packageModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFE8DA] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#EFE8DA] pb-3">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#B45309]" />
                <h3 className="font-extrabold text-base text-stone-900">New Sponsorship Package</h3>
              </div>
              <button 
                onClick={() => setPackageModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Package Tier Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Platinum Title Partner"
                  value={pkgName}
                  onChange={e => setPkgName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Package Price ($) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={pkgPrice}
                    onChange={e => setPkgPrice(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Available Spots</label>
                  <input
                    type="number"
                    min="0"
                    value={pkgSpots}
                    onChange={e => setPkgSpots(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief summary of partner exposure"
                  value={pkgDesc}
                  onChange={e => setPkgDesc(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Deliverables &amp; Benefits (1 per line)</label>
                <textarea
                  rows="3"
                  value={pkgBenefits}
                  onChange={e => setPkgBenefits(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                  placeholder="Keynote stage branding&#10;VIP booth placement&#10;5 All-access passes"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPackageModalOpen(false)}
                  className="w-1/2 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPackageMutation.isPending}
                  className="w-1/2 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold shadow-md shadow-[#B45309]/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {createPackageMutation.isPending ? <RefreshCcw size={13} className="animate-spin" /> : <Plus size={13} />}
                  {createPackageMutation.isPending ? 'Saving...' : 'Create Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 💼 SPONSOR BOOTH LEAD CAPTURE & ROI STUDIO 💼 */}
      <div className="bg-white rounded-3xl border border-[#EFE8DA] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE8DA] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-black uppercase">
                Enterprise ROI Module
              </span>
              <h3 className="font-extrabold text-stone-900 text-lg">Sponsor Booth Lead Capture Studio</h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Simulate brand booth badge scans, qualify attendee leads, and export lead sheets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const sampleLeads = [
                  { name: 'Dr. Sarah Chen', title: 'VP of AI Systems', company: 'Apex Dynamics', email: 'sarah.c@apex.ai', grade: 'HOT', notes: 'Interested in $50k enterprise pilot.' },
                  { name: 'Marcus Vance', title: 'Director of Infrastructure', company: 'CloudScale Inc', email: 'm.vance@cloudscale.io', grade: 'HOT', notes: 'Schedule product demo next Tuesday.' },
                  { name: 'Elena Rostova', title: 'Senior Product Manager', company: 'FinTech Global', email: 'elena@fintech.org', grade: 'WARM', notes: 'Evaluate API specs with engineering lead.' },
                  { name: 'David Kim', title: 'Lead Architect', company: 'Horizon Labs', email: 'dkim@horizon.dev', grade: 'COLD', notes: 'General interest in newsletter updates.' }
                ];
                const csvHeader = 'Name,Title,Company,Email,Lead Grade,Notes\n';
                const csvRows = sampleLeads.map(l => `"${l.name}","${l.title}","${l.company}","${l.email}","${l.grade}","${l.notes}"`).join('\n');
                const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', 'EventForge_Sponsor_Leads.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#B45309] hover:text-white border border-[#EFE8DA] text-stone-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <ExternalLink size={13} /> Export Leads CSV
            </button>
          </div>
        </div>

        {/* Lead ROI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Total Scanned Leads</span>
            <p className="text-2xl font-black text-stone-900 mt-1">24 Leads</p>
            <span className="text-[10px] text-emerald-600 font-bold">+18% vs avg summit</span>
          </div>

          <div className="p-4 bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Hot Decision Makers</span>
            <p className="text-2xl font-black text-[#B45309] mt-1">11 CXO / VP</p>
            <span className="text-[10px] text-[#B45309] font-bold">45.8% Conversion Target</span>
          </div>

          <div className="p-4 bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Estimated Pipeline Value</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">$420,000</p>
            <span className="text-[10px] text-stone-500 font-medium">8 Enterprise Opportunities</span>
          </div>
        </div>

        {/* Verified Lead Stream */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">Recent Sponsor Booth Interactions</h4>
          
          <div className="space-y-2">
            {[
              { name: 'Dr. Sarah Chen', title: 'VP of AI Systems', company: 'Apex Dynamics', email: 'sarah.c@apex.ai', grade: 'HOT', notes: 'Interested in $50k enterprise pilot.' },
              { name: 'Marcus Vance', title: 'Director of Infrastructure', company: 'CloudScale Inc', email: 'm.vance@cloudscale.io', grade: 'HOT', notes: 'Schedule product demo next Tuesday.' },
              { name: 'Elena Rostova', title: 'Senior Product Manager', company: 'FinTech Global', email: 'elena@fintech.org', grade: 'WARM', notes: 'Evaluate API specs with engineering lead.' }
            ].map((lead, idx) => (
              <div key={idx} className="p-3.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-stone-900">{lead.name}</span>
                    <span className="text-stone-400">•</span>
                    <span className="text-stone-600 font-medium">{lead.title} at {lead.company}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">{lead.notes}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    lead.grade === 'HOT' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {lead.grade} LEAD
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">{lead.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL: Add Event Sponsor */}
      {sponsorModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFE8DA] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#EFE8DA] pb-3">
              <div className="flex items-center gap-2">
                <Building size={18} className="text-[#B45309]" />
                <h3 className="font-extrabold text-base text-stone-900">Add Brand Sponsor</h3>
              </div>
              <button 
                onClick={() => setSponsorModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSponsor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Company / Sponsor Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Anthropic, Google Cloud, Stripe"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Sponsorship Tier Package *</label>
                <select
                  required
                  value={selectedPackageId}
                  onChange={e => setSelectedPackageId(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                >
                  {packages.map(pkg => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.name} (${Number(pkg.price).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  placeholder="partner@company.com"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Company Website</label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSponsorModalOpen(false)}
                  className="w-1/2 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSponsorMutation.isPending}
                  className="w-1/2 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold shadow-md shadow-[#B45309]/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {addSponsorMutation.isPending ? <RefreshCcw size={13} className="animate-spin" /> : <Plus size={13} />}
                  {addSponsorMutation.isPending ? 'Adding...' : 'Onboard Sponsor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
