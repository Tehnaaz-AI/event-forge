import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Calendar, MapPin, Ticket, Sparkles, Filter, 
  ArrowRight, Users, CheckCircle2 
} from 'lucide-react';
import { api } from '../../services/api';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import useDocumentTitle from '../../components/common/useDocumentTitle';

export default function ExploreEvents() {
  useDocumentTitle('Explore Global Summits & Conferences', 'Discover and filter upcoming multi-track conferences, AI symposiums, and executive leadership events.');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

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
    <div className="min-h-screen bg-[#FAF8F5] pb-24 text-stone-900 font-sans">
      
      {/* Header Banner in Luxury Warm Sand */}
      <section className="bg-gradient-to-b from-[#FDFAF5] to-[#F5F2EB] border-b border-[#EFE8DA] pt-6 pb-10 px-6">
        <div className="max-w-5xl mx-auto px-4 mb-4">
          <Breadcrumbs items={[{ label: 'Explore Summits' }]} />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="px-3.5 py-1 bg-white text-[#B45309] border border-[#EFE8DA] rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-block shadow-xs">
            Global Conference Directory
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-stone-900">
            Explore <span className="cursive-masterpiece font-normal text-[#B45309] text-5xl md:text-7xl align-middle inline-block px-1">Upcoming Summits</span>
          </h1>
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
                className="w-full bg-white border border-[#EFE8DA] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-stone-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#B45309]/30"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === cat 
                      ? 'bg-[#B45309] text-white shadow-xs' 
                      : 'bg-white border border-[#EFE8DA] text-stone-600 hover:border-stone-400 hover:text-stone-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Conference Cards Grid - Reduced gap from top */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
              <div
                key={event._id}
                className="bg-white rounded-3xl border border-[#EFE8DA] overflow-hidden hover-lift flex flex-col justify-between"
              >
                <div className="p-8 bg-gradient-to-br from-[#FDFAF5] to-[#F5F2EB] border-b border-[#EFE8DA] space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-white text-[#B45309] border border-[#EFE8DA] rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                      {event.category || 'Executive'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase">
                      Registration Open
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-stone-900 line-clamp-2 leading-snug">
                    {event.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>
                </div>

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
                    className="w-full bg-[#FAF8F5] hover:bg-[#B45309] text-stone-900 hover:text-white border border-[#EFE8DA] hover:border-[#B45309] text-center font-extrabold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-xs hover:shadow-md"
                  >
                    <span>Explore Conference &amp; Passes</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}

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
          </div>
        )}

      </section>

    </div>
  );
}
