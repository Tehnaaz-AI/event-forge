import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Ticket, Sparkles, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function FloatingJourneyDock() {
  const [showDock, setShowDock] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      
      if (totalScroll > 0) {
        setScrollProgress(Math.round((currentScroll / totalScroll) * 100));
      }
      
      if (currentScroll > 250) {
        setShowDock(true);
      } else {
        setShowDock(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {showDock && (
        <motion.aside 
          aria-label="Quick navigation and page actions"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-stone-900/90 backdrop-blur-xl border border-white/15 p-2 rounded-full shadow-2xl text-white"
        >
          {location.pathname !== '/explore' && (
            <Link
              to="/explore"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#B45309] text-xs font-bold transition-all"
              title="Explore all summits"
            >
              <Compass size={14} className="text-[#C28E27]" />
              <span className="hidden sm:inline">Explore</span>
            </Link>
          )}

          <Link
            to="/waitlist"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold transition-all shadow-md shadow-[#B45309]/30"
            title="Join VIP priority waitlist"
          >
            <Ticket size={13} />
            <span className="hidden sm:inline">VIP Pass</span>
          </Link>

          {/* Theme Switcher */}
          <ThemeToggle className="!w-8 !h-8 !border-white/10 !bg-white/10 hover:!bg-white/20 !text-white" />

          {/* Scroll to Top with Radial / Numeric Progress */}
          <button
            onClick={scrollToTop}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer group relative"
            title="Back to top"
            aria-label="Scroll back to top"
          >
            <ArrowUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
            <span className="sr-only">Scroll to top</span>
          </button>

          {/* Mini Percentage Pill */}
          <span className="text-[10px] font-mono text-stone-400 pr-1.5 font-bold" aria-hidden="true">
            {scrollProgress}%
          </span>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
