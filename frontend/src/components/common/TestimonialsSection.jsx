import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Dr. Evelyn Martinez',
      role: 'VP of AI Research, Cortex Systems',
      event: 'FutureTech Global Summit 2026',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop',
      comment: 'The zero-latency QR check-in and multi-track AI concierge made navigating 4 simultaneous keynote tracks completely effortless. Best conference experience in years!'
    },
    {
      name: 'Vikram Chandrasekhar',
      role: 'Head of Engineering, CloudScale India',
      event: 'CyberShield Executive Forum',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop',
      comment: 'From 1-click pass checkout with coupon redemption to having my digital entrance pass stored on my phone, EventForge is lightyears ahead of legacy conference tools.'
    },
    {
      name: 'Sarah Jenkins',
      role: 'Principal Architect, NextGen Cloud',
      event: 'Enterprise DevOps & Cloud Summit',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop',
      comment: 'Organizing 1,200 attendees with real-time speaker conflict prevention and live broadcast announcements saved our team weeks of manual spreadsheet coordination.'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-[#B45309] rounded-full text-[11px] font-extrabold uppercase tracking-widest">
          <Quote size={13} />
          <span>Verified Attendee &amp; Organizer Reviews</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
          Trusted by <span className="cursive-accent font-normal text-[#B45309] text-4xl md:text-5xl align-middle px-1.5">Leaders Worldwide</span>
        </h2>
        <p className="text-sm text-stone-600 max-w-lg mx-auto">
          See how leading executives, keynote speakers, and attendees experience summits powered by EventForge.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <div 
            key={idx}
            className="bg-white rounded-3xl p-6 border border-[#EFE8DA] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <p className="text-sm text-stone-700 leading-relaxed font-normal italic">
                "{t.comment}"
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
              <img 
                src={t.avatar} 
                alt={`Photo of ${t.name}`} 
                className="w-11 h-11 rounded-full object-cover border border-[#EFE8DA]"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-stone-900 truncate">{t.name}</p>
                  <CheckCircle size={12} className="text-emerald-600 shrink-0" title="Verified Attendee" />
                </div>
                <p className="text-[11px] text-stone-500 truncate">{t.role}</p>
                <p className="text-[10px] font-bold text-[#B45309] mt-0.5 truncate">{t.event}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
