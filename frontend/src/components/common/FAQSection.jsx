import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does digital badge generation & on-site QR check-in work?',
      a: 'When you purchase or claim a conference pass on EventForge, a cryptographic digital badge with a high-resolution QR code is instantly generated and stored in your Attendee Dashboard. On the day of the event, door staff scan your pass with the zero-latency EventForge Optical Scanner for instant admission without manual badge printing lines.'
    },
    {
      q: 'Can I transfer my conference pass or reassign it to a colleague?',
      a: 'Yes. From your Attendee Portal, you can transfer your confirmed ticket to another attendee’s email address or update attendee details up to 24 hours prior to the conference start date.'
    },
    {
      q: 'How does the EventForge AI Schedule Concierge recommend sessions?',
      a: 'Our AI Concierge synthesizes your professional interests, technical focus areas, and schedule constraints to curate a personalized multi-track agenda. It detects room conflicts in real time and highlights recommended keynote breakouts across all tracks.'
    },
    {
      q: 'What happens if a ticket tier is sold out?',
      a: 'If a ticket category reaches full capacity and the event organizer has waitlists enabled, you will automatically be placed on the priority waitlist. When additional seats become available or cancellations occur, waitlisted guests are automatically notified to claim their passes.'
    },
    {
      q: 'How can organizations host their own summit on EventForge?',
      a: 'Organizers can create an enterprise account, configure ticket tiers, set up multi-room schedules, assign speakers, manage sponsors, and broadcast live announcements to attendees from the all-in-one Executive Dashboard.'
    },
    {
      q: 'What refund and cancellation policies apply to ticket passes?',
      a: 'Refunds depend on the specific organizer’s policy. Most conferences offer full refunds up to 7 days before the event commencement. Attendees can also submit refund requests directly via their Attendee Dashboard.'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B45309]/10 text-[#B45309] rounded-full text-[11px] font-extrabold uppercase tracking-widest">
          <HelpCircle size={14} />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
          Everything You Need to <span className="cursive-accent font-normal text-[#B45309] text-4xl md:text-5xl align-middle px-1.5">Know</span>
        </h2>
        <p className="text-sm text-stone-600 max-w-xl mx-auto">
          Clear answers about ticketing, badges, AI concierge, schedule management, and enterprise hosting.
        </p>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx}
              className="bg-white rounded-3xl border border-[#EFE8DA] overflow-hidden shadow-xs hover:border-[#B45309]/30 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full text-left p-6 flex items-center justify-between gap-4 font-bold text-stone-900 text-base"
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <div className={`w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EFE8DA] flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-[#B45309] text-white' : 'text-stone-500'}`}>
                  <ChevronDown size={16} />
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-1 text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-[#FAF8F5]/50 animate-in fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
