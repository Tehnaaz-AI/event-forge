import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, MapPin, Sparkles, ArrowRight, ShieldCheck, Cpu, 
  Ticket, TrendingUp, Plus 
} from 'lucide-react';
import { api } from '../services/api';

export default function Home() {
  const user = JSON.parse(localStorage.getItem('eventforge_user') || 'null');

  const { data: events, isLoading } = useQuery({
    queryKey: ['public-events-list'],
    queryFn: () => api.get('/events')
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-[#B45309] selection:text-white">
      
      {/* Editorial Luxury Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden border-b border-[#EFE8DA] bg-gradient-to-b from-[#FDFAF5] via-[#FAF8F5] to-[#F5F2EB]">
        
        {/* Subtle Ambient Warm Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#B45309]/5 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#EFE8DA] rounded-full text-[#B45309] text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles size={14} className="text-[#C28E27] animate-spin" />
            <span>AI-Driven Corporate Event Operating System</span>
          </div>
          
          {/* Editorial Headline with Cursive Accent */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-stone-900 leading-[1.15]">
            Curate, Scale &amp; <span className="logo-cursive font-normal text-[#B45309] text-6xl md:text-8xl">Masterpiece</span> <br />
            <span className="font-serif italic font-normal text-stone-800">
              World-Class Conferences
            </span>
          </h1>

          <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed font-light">
            Unifying enterprise multi-track summits, global symposiums, and corporate exhibitions with intelligent schedule orchestration and high-speed optical verification.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="bg-[#B45309] hover:bg-[#92400E] text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-[#B45309]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Ticket size={18} /> Open {user.role === 'ATTENDEE' ? 'Attendee Hub' : user.role === 'STAFF' ? 'Door Scanner' : 'Organizer Workspace'} <ArrowRight size={16} />
                </Link>
                <a 
                  href="#featured-events" 
                  className="bg-white hover:bg-stone-50 text-stone-800 px-8 py-4 rounded-2xl font-bold text-sm border border-[#EFE8DA] transition-all shadow-sm flex items-center gap-2"
                >
                  Browse Conferences
                </a>
              </>
            ) : (
              <>
                <Link 
                  to="/login?tab=register" 
                  className="bg-[#B45309] hover:bg-[#92400E] text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-[#B45309]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Get Started as Organizer <ArrowRight size={16} />
                </Link>
                <Link 
                  to="/login" 
                  className="bg-white hover:bg-stone-50 text-stone-800 px-8 py-4 rounded-2xl font-bold text-sm border border-[#EFE8DA] transition-all shadow-sm flex items-center gap-2"
                >
                  Sign In to Account
                </Link>
              </>
            )}
          </div>

          {/* High-Level Trust Badges */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-white p-4 rounded-2xl border border-[#EFE8DA] shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center font-bold shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">Multi-Track</p>
                <p className="text-[10px] text-stone-500">Zero-conflict scheduling</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EFE8DA] shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
                <Cpu size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">AI Synthesis</p>
                <p className="text-[10px] text-stone-500">Agendas &amp; Content</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EFE8DA] shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">Optical Check-In</p>
                <p className="text-[10px] text-stone-500">Live Camera Scanner</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EFE8DA] shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold shrink-0">
                <TrendingUp size={18} className="text-[#C28E27]" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">Live Telemetry</p>
                <p className="text-[10px] text-stone-500">Real-time attendance</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Conferences Grid in Warm Ivory */}
      <section id="featured-events" className="max-w-7xl mx-auto px-6 py-24 w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-widest block mb-1">
              Curated Portfolio
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
              Featured Flagship <span className="logo-cursive font-normal text-[#B45309] text-4xl md:text-5xl">Conferences</span>
            </h2>
            <p className="text-stone-500 text-xs md:text-sm mt-1">
              Explore upcoming corporate conferences with live registration, tiered passes, and speaker lineups
            </p>
          </div>

          <Link 
            to="/explore"
            className="text-xs font-bold text-[#B45309] hover:underline flex items-center gap-1"
          >
            Explore All Conferences &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-white p-16 text-center rounded-3xl border border-[#EFE8DA] text-stone-500 shadow-sm">
            <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading active conferences...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events?.map((event) => (
              <div 
                key={event._id} 
                className="bg-white rounded-3xl border border-[#EFE8DA] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#B45309]/40 transition-all group flex flex-col justify-between"
              >
                
                {/* Event Card Top Banner in Ivory/Sand */}
                <div className="p-8 bg-gradient-to-br from-[#FDFAF5] to-[#F5F2EB] border-b border-[#EFE8DA] space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-white text-[#B45309] border border-[#EFE8DA] rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                      {event.category || 'Technology'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase">
                      Open
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-stone-900 line-clamp-2 leading-snug group-hover:text-[#B45309] transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Event Card Bottom Body */}
                <div className="p-6 space-y-5">
                  <div className="space-y-2 text-xs font-medium text-stone-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-[#B45309]" size={15} />
                      <span>{new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {event.venue?.name && (
                      <div className="flex items-center gap-2">
                        <MapPin className="text-amber-700" size={15} />
                        <span className="truncate">{event.venue.name}</span>
                      </div>
                    )}
                  </div>

                  <Link 
                    to={`/e/${event.slug}`}
                    className="w-full bg-[#FAF8F5] hover:bg-[#B45309] text-stone-900 hover:text-white border border-[#EFE8DA] hover:border-[#B45309] text-center font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs shadow-xs group-hover:shadow-md uppercase tracking-wider"
                  >
                    View Agenda &amp; Book Passes <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}

            {(!events || events.length === 0) && (
              <div className="col-span-full bg-white p-16 text-center rounded-3xl border border-[#EFE8DA] shadow-xs text-stone-600 space-y-4 max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center mx-auto">
                  <Calendar size={28} />
                </div>
                <h3 className="text-xl font-extrabold text-stone-900">No Conferences Published Yet</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Be the first to publish a world-class conference. Sign up as an Organizer or Admin to create multi-track summits, speaker lineups, and tiered passes.
                </p>
                <div className="pt-2">
                  <Link
                    to={user ? "/dashboard/organizer/events/new" : "/login?tab=register"}
                    className="inline-flex items-center gap-2 bg-[#B45309] hover:bg-[#92400E] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-md shadow-[#B45309]/20 transition-all"
                  >
                    <Plus size={16} /> Create First Conference
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  );
}
