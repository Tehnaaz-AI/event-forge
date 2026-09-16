import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, Clock, Shield, Sparkles } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import useDocumentTitle from '../../components/common/useDocumentTitle';

export default function ContactPage() {
  useDocumentTitle('Contact Us & Support', 'Reach out to the EventForge enterprise conference team.');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Enterprise Summit Inquiry',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 max-w-6xl mx-auto">
      <Breadcrumbs items={[{ label: 'Contact & Support' }]} />

      <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#B45309]/10 text-[#B45309] rounded-full text-[11px] font-extrabold uppercase tracking-widest">
          <MessageSquare size={13} />
          <span>Get in Touch</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-stone-900 tracking-tight">
          How Can We Help Your Summit?
        </h1>
        <p className="text-sm md:text-base text-stone-600 leading-relaxed">
          Whether you're organizing an executive conference, seeking custom enterprise integrations, or have attendee ticketing questions, our team is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#EFE8DA] shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-stone-900">Direct Contacts</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-[#B45309] flex items-center justify-center shrink-0">
                  <Mail size={15} />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Enterprise Inquiries</p>
                  <a href="mailto:enterprise@eventforge.demo" className="text-stone-500 hover:text-[#B45309]">
                    enterprise@eventforge.demo
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-[#B45309] flex items-center justify-center shrink-0">
                  <Phone size={15} />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Global Hotline</p>
                  <p className="text-stone-500">+1 (888) 492-3848</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-[#B45309] flex items-center justify-center shrink-0">
                  <Clock size={15} />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Support Hours</p>
                  <p className="text-stone-500">24/7 Gate &amp; Live Conference Support</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-[#B45309] flex items-center justify-center shrink-0">
                  <MapPin size={15} />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Global Headquarters</p>
                  <p className="text-stone-500">San Francisco, CA &amp; Mumbai, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-6 shadow-xl space-y-3">
            <div className="w-8 h-8 rounded-xl bg-[#B45309] text-white flex items-center justify-center">
              <Shield size={16} />
            </div>
            <h4 className="text-sm font-bold">Enterprise SLAs &amp; Gate Security</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Hosting a multi-day conference with over 5,000 attendees? Our dedicated on-site logistics engineers provide full turnkey support.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-[#EFE8DA] shadow-sm">
          {submitted ? (
            <div className="text-center py-16 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-extrabold text-stone-900">Message Dispatched!</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Thank you for reaching out, {formData.name || 'Friend'}. An EventForge conference specialist will get back to you within 2 business hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-bold text-[#B45309] hover:underline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-xl font-extrabold text-stone-900">Send an Inquiry</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#B45309]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Business Email</label>
                  <input
                    type="email"
                    required
                    placeholder="maya@enterprise.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#B45309]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Inquiry Topic</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#B45309]"
                >
                  <option>Enterprise Summit Inquiry</option>
                  <option>Speaker Keynote Pitch</option>
                  <option>Sponsorship &amp; Partner Booths</option>
                  <option>Ticket Pass &amp; Refund Assistance</option>
                  <option>Platform Technical Support</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Your Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe your event requirements, expected attendee headcount, or specific questions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl p-3.5 text-xs text-stone-900 focus:outline-none focus:border-[#B45309]"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold py-3 px-8 rounded-xl shadow-md shadow-[#B45309]/20 transition-all flex items-center justify-center gap-2"
              >
                <Send size={14} />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
