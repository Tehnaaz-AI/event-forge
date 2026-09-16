import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, ArrowRight, Search, Calendar, Sparkles } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import useDocumentTitle from '../../components/common/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('404 Page Not Found', 'The conference or page you are looking for does not exist.');

  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-6 py-20 text-center font-sans selection:bg-[#B45309] selection:text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto space-y-6"
      >
        <Breadcrumbs items={[{ label: '404 Page Not Found' }]} />

        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-3xl bg-amber-100/80 text-[#B45309] flex items-center justify-center mx-auto shadow-inner"
        >
          <Compass size={36} />
        </motion.div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold text-[#B45309] uppercase tracking-widest bg-white border border-[#EFE8DA] px-3.5 py-1 rounded-full shadow-xs">
            HTTP 404 ERROR
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight">
            Summit <span className="cursive-accent font-normal text-[#B45309] text-5xl md:text-6xl align-middle px-1.5">Not Found</span>
          </h1>
          <p className="text-sm md:text-base text-stone-600 max-w-md mx-auto leading-relaxed font-light">
            The page, pass checkout, or conference session you were trying to reach has moved or is no longer active.
          </p>
        </div>

        {/* Quick Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto relative pt-2">
          <input
            type="text"
            placeholder="Search for summit by title, keynote, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#EFE8DA] rounded-2xl pl-11 pr-24 py-3.5 text-xs text-stone-900 shadow-xs focus:outline-none focus:border-[#B45309]"
          />
          <Search size={16} className="absolute left-4 top-5.5 text-stone-400" />
          <button
            type="submit"
            className="absolute right-2 top-3.5 bg-[#B45309] hover:bg-[#92400E] text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all"
          >
            Find Summit
          </button>
        </form>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-[#B45309]/20 transition-all flex items-center justify-center gap-2"
          >
            <Home size={15} />
            <span>Return to Homepage</span>
          </Link>

          <Link
            to="/explore"
            className="w-full sm:w-auto bg-white hover:bg-stone-50 border border-[#EFE8DA] text-stone-800 text-xs font-bold py-3.5 px-6 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Calendar size={15} className="text-[#B45309]" />
            <span>Browse All Summits</span>
          </Link>
        </div>

        <div className="pt-8 border-t border-[#EFE8DA] text-xs text-stone-400">
          Need help? <Link to="/contact" className="text-[#B45309] font-bold hover:underline">Contact EventForge Support</Link>
        </div>
      </motion.div>
    </div>
  );
}
