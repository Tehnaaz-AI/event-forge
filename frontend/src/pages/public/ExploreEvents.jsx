import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Calendar, MapPin, Ticket, Sparkles, Filter, 
  ArrowRight, Users, CheckCircle2, Eye, X, Clock, ShieldCheck,
  Award, Building, Layers
} from 'lucide-react';
import { api } from '../../services/api';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import useDocumentTitle from '../../components/common/useDocumentTitle';

export default function ExploreEvents() {
  useDocumentTitle('Explore Global Summits & Conferences', 'Discover and filter upcoming multi-track conferences, AI symposiums, and executive leadership events.');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [quickPeekEvent, setQuickPeekEvent] = useState(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['explore-events-list'],
    queryFn: () => api.get('/events')
  });

  const categories = ['ALL', 'Artificial Intelligence', 'Product & Design', 'Finance & Banking', 'Healthcare & Biotech', 'Cybersecurity'];

  const filteredEvents = events?.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || 
      event.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 text-stone-900 font-sans selection:bg-[#B45309] selection:text-white">
      
      {/* Header Banner in Luxury Warm Sand */}
      <section className="bg-gradient-to-b from-[#FDFAF5] to-[#F5F2EB] border-b border-[#EFE8DA] pt-8 pb-12 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 mb-4">
          <Breadcrumbs items={[{ label: 'Explore Summits' }]} />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-4">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-3.5 py-1 bg-white text-[#B45309] border border-[#EFE8DA] rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-block shadow-xs"
          >
            Global Conference Directory
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight text-stone-900"
          >
            Explore <span className="cursive-accent font-normal text-[#B45309] text-4xl md:text-6xl align-middle inline-block px-1.5">Upcoming Events</span>
          </motion.h1>
          
          <p className="text-sm md:text-base text-stone-600 max-w-xl mx-auto leading-relaxed font-light">
            Discover verified corporate conferences, multi-track exhibitions, and executive masterclasses with digital pass registration.
          </p>

          {/* Search & Filter Bar */}
          <div className="max-w-2xl mx-auto pt-3 space-y-3">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by conference title, keynote topic, or city..."
                className="w-full bg-white border border-[#EFE8DA] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-stone-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#B45309]/30 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Animated Category Filter Chips */}
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {categories.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all relative ${
                      isSelected 
                        ? 'bg-[#B45309] text-white shadow-xs' 
                        : 'bg-white border border-[#EFE8DA] text-stone-600 hover:border-stone-400 hover:text-stone-900'
                    }`}
                  >
                    {cat}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Conference Cards Grid */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-16">
        
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Showing {filteredEvents.length} Verified Conference{filteredEvents.length === 1 ? '' : 's'}
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white p-16 text-center rounded-3xl border border-[#EFE8DA] text-stone-500">
            <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading global summits...
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredEvents.map(event => (
                <motion.div
                  layout
                  key={event._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="bg-white rounded-3xl border border-[#EFE8DA] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#B45309]/40 transition-all flex flex-col justify-between group"
                >
                  <div className="p-8 bg-gradient-to-br from-[#FDFAF5] to-[#F5F2EB] border-b border-[#EFE8DA] space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="px-3.5 py-1.5 bg-white text-[#B45309] border border-[#EFE8DA] rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xs">
                        {event.category || 'Executive'}
                      </span>
                      
                      <button
                        onClick={() => setQuickPeekEvent(event)}
                        className="px-2.5 py-1 rounded-full bg-white hover:bg-[#B45309]/10 text-stone-600 hover:text-[#B45309] border border-[#EFE8DA] text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Eye size={13} /> Quick Peek
                      </button>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 line-clamp-2 leading-snug group-hover:text-[#B45309] transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="space-y-2.5 text-sm font-semibold text-stone-700">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="text-[#B45309]" size={17} />
                        <span>{new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      {event.venue?.name && (
                        <div className="flex items-center gap-2.5">
                          <MapPin className="text-amber-700" size={17} />
                          <span className="truncate">{event.venue.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setQuickPeekEvent(event)}
                        className="w-full bg-white hover:bg-stone-50 text-stone-800 border border-[#EFE8DA] text-center font-bold py-3.5 rounded-2xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Eye size={14} className="text-[#B45309]" />
                        <span>Preview</span>
                      </button>

                      <Link 
                        to={`/e/${event.slug}`}
                        className="w-full bg-[#B45309] hover:bg-[#92400E] text-white text-center font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider shadow-sm shadow-[#B45309]/20"
                      >
                        <span>Passes</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredEvents.length === 0 && (
              <div className="col-span-full bg-white p-16 text-center rounded-3xl border border-dashed border-[#EFE8DA] text-stone-500 space-y-2">
                <p className="text-sm font-bold text-stone-700">No conferences match your search filter</p>
                <p className="text-xs text-stone-400">Try clearing your search keyword or switching category tabs.</p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); }}
                  className="text-[#B45309] font-bold text-xs hover:underline pt-2 block mx-auto"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </motion.div>
        )}

      </section>

      {/* 🌟 INTERACTIVE QUICK PEEK MODAL DRAWER 🌟 */}
      <AnimatePresence>
        {quickPeekEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full border border-[#EFE8DA] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="p-6 bg-gradient-to-r from-[#FDFAF5] to-[#F5F2EB] border-b border-[#EFE8DA] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white text-[#B45309] border border-[#EFE8DA] rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                    {quickPeekEvent.category || 'Conference'}
                  </span>
                  <span className="text-xs font-bold text-stone-500">Quick Agenda Peek</span>
                </div>
                <button
                  onClick={() => setQuickPeekEvent(null)}
                  className="w-8 h-8 rounded-full bg-white border border-[#EFE8DA] text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-stone-900">
                    {quickPeekEvent.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {quickPeekEvent.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFE8DA] text-xs">
                  <div className="space-y-1">
                    <span className="text-stone-400 font-bold uppercase text-[10px]">Date &amp; Schedule</span>
                    <p className="font-bold text-stone-800 flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#B45309]" />
                      {new Date(quickPeekEvent.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-stone-400 font-bold uppercase text-[10px]">Venue Location</span>
                    <p className="font-bold text-stone-800 flex items-center gap-1.5 truncate">
                      <MapPin size={13} className="text-amber-700" />
                      {quickPeekEvent.venue?.name || 'Main Conference Center'}
                    </p>
                  </div>
                </div>

                {/* Keynote Highlights */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#B45309]" />
                    <span>Keynote &amp; Feature Highlights</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white border border-[#EFE8DA] rounded-xl flex items-center justify-between">
                      <span className="font-bold text-stone-800">Zero-Conflict Multi-Track Scheduling</span>
                      <span className="text-emerald-600 font-bold">Enabled</span>
                    </div>
                    <div className="p-3 bg-white border border-[#EFE8DA] rounded-xl flex items-center justify-between">
                      <span className="font-bold text-stone-800">Sub-Second Optical Gate Check-in</span>
                      <span className="text-emerald-600 font-bold">Active</span>
                    </div>
                    <div className="p-3 bg-white border border-[#EFE8DA] rounded-xl flex items-center justify-between">
                      <span className="font-bold text-stone-800">AI Delegate Itinerary Concierge</span>
                      <span className="text-purple-600 font-bold">Available</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer CTA */}
              <div className="p-4 bg-[#FAF8F5] border-t border-[#EFE8DA] flex items-center justify-between gap-4">
                <button
                  onClick={() => setQuickPeekEvent(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#EFE8DA] text-stone-700 hover:bg-stone-100 text-xs font-bold"
                >
                  Close Preview
                </button>
                <Link
                  to={`/e/${quickPeekEvent.slug}`}
                  onClick={() => setQuickPeekEvent(null)}
                  className="bg-[#B45309] hover:bg-[#92400E] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <span>Open Full Event Page &amp; Secure Passes</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
