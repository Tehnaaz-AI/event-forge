import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, Calendar, ShieldCheck, Users, Sparkles, CheckCircle2, 
  ArrowRight, QrCode, TrendingUp, Layers, Lock, Compass 
} from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: <Calendar size={28} className="text-[#B45309]" />,
      title: 'Conflict-Free Multi-Track Scheduling',
      description: 'Zero speaker double-booking and room overlap guarantees. The scheduling engine validates time ranges and room capacities in real-time across parallel tracks.'
    },
    {
      icon: <Cpu size={28} className="text-[#B45309]" />,
      title: 'AI Marketing & Content Studio',
      description: 'Generate multi-channel marketing campaigns (LinkedIn, X/Twitter, and Email blasts), speaker bios, and AI-curated attendee agendas in seconds.'
    },
    {
      icon: <QrCode size={28} className="text-[#B45309]" />,
      title: 'WebRTC Optical QR Door Scanner',
      description: 'High-speed hands-free badge scanning directly from staff mobile or webcam devices, with instant audio chimes and duplicate entry prevention.'
    },
    {
      icon: <ShieldCheck size={28} className="text-[#B45309]" />,
      title: 'Atomic Inventory & Ticket Tiers',
      description: 'MongoDB transaction-safe reservations preventing overselling, tiered pricing with coupon codes (`SAVE20`), and automated waitlist pipelines.'
    },
    {
      icon: <Users size={28} className="text-[#B45309]" />,
      title: 'Sponsor ROI & Deliverable Tracking',
      description: 'Tiered sponsorship package allocation (Titanium, Platinum, Gold) and real-time deliverable milestone status checklists.'
    },
    {
      icon: <TrendingUp size={28} className="text-[#B45309]" />,
      title: 'Recharts Real-Time Telemetry',
      description: 'Interactive registration velocity area charts, ticket tier share donuts, live door scanned ratios, and attendee star review feeds.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 text-stone-900 font-sans">
      
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#FDFAF5] to-[#F5F2EB] border-b border-[#EFE8DA] pt-16 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="px-3.5 py-1 bg-white text-[#B45309] border border-[#EFE8DA] rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-block shadow-xs">
            Architecture &amp; Capabilities
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-stone-900">
            Enterprise Event <span className="cursive-accent font-normal text-[#B45309] text-5xl md:text-7xl align-middle px-1.5">Infrastructure</span>
          </h1>
          <p className="text-sm md:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed font-light">
            Engineered from the ground up for high-scale corporate conferences, multi-track exhibitions, and global summits.
          </p>
        </div>
      </section>

      {/* Grid of 6 Core Pillars */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div 
              key={idx}
              className="bg-white p-8 rounded-3xl border border-[#EFE8DA] shadow-sm hover-lift space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#B45309]/10 flex items-center justify-center font-bold">
                {feat.icon}
              </div>
              <h3 className="text-xl font-extrabold text-stone-900 leading-snug">{feat.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Card in Luxury Ivory */}
        <div className="mt-16 bg-white border border-[#EFE8DA] rounded-3xl p-10 text-center shadow-lg max-w-3xl mx-auto space-y-6">
          <span className="px-3 py-1 bg-[#B45309]/10 text-[#B45309] rounded-full text-xs font-extrabold uppercase tracking-wider">
            Ready to Plan Your Next Summit?
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Launch Your <span className="cursive-accent font-normal text-[#B45309] text-4xl md:text-5xl align-middle px-1">Conference Workspace</span> in Minutes
          </h2>
          <div className="flex justify-center gap-4">
            <Link
              to="/login?tab=register"
              className="bg-[#B45309] hover:bg-[#92400E] text-white px-8 py-3.5 rounded-2xl font-bold text-xs shadow-md uppercase tracking-wider flex items-center gap-2"
            >
              Get Started Free <ArrowRight size={14} />
            </Link>
            <Link
              to="/explore"
              className="bg-[#FAF8F5] border border-[#EFE8DA] text-stone-700 px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-stone-100"
            >
              Explore Conferences
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
