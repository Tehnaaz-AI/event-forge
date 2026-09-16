import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowRight, Search, Calendar, Sparkles } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import useDocumentTitle from '../../components/common/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('404 Page Not Found', 'The conference or page you are looking for does not exist.');

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-6 py-20 text-center">
      <div className="max-w-xl mx-auto space-y-6">
        <Breadcrumbs items={[{ label: '404 Page Not Found' }]} />

        <div className="w-20 h-20 rounded-3xl bg-amber-100/80 text-[#B45309] flex items-center justify-center mx-auto shadow-inner">
          <Compass size={36} className="animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold text-[#B45309] uppercase tracking-widest bg-white border border-[#EFE8DA] px-3.5 py-1 rounded-full shadow-xs">
            HTTP 404 ERROR
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight">
            Summit <span className="cursive-accent font-normal text-[#B45309] text-5xl md:text-6xl align-middle px-1.5">Not Found</span>
          </h1>
          <p className="text-sm md:text-base text-stone-600 max-w-md mx-auto leading-relaxed">
            The page, pass checkout, or conference session you were trying to reach has moved or is no longer active.
          </p>
        </div>

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
      </div>
    </div>
  );
}
