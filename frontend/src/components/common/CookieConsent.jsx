import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Check, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('eventforge_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('eventforge_cookie_consent', JSON.stringify({ analytics: true, functional: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('eventforge_cookie_consent', JSON.stringify({ analytics: false, functional: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 left-5 md:left-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md border border-[#EFE8DA] p-5 rounded-3xl shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center shrink-0">
              <Cookie size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Privacy &amp; Cookie Preferences</h4>
              <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Enterprise Security</p>
            </div>
          </div>
          <button 
            onClick={handleDecline} 
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
            aria-label="Dismiss cookie notice"
          >
            <X size={15} />
          </button>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          EventForge utilizes essential and anonymized analytics cookies to enhance badge check-in speed, preserve your schedule preferences, and deliver personalized session recommendations.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAcceptAll}
            className="flex-1 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-[#B45309]/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Check size={14} />
            <span>Accept All</span>
          </button>

          <button
            onClick={handleDecline}
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold py-2.5 px-3.5 rounded-xl transition-colors"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
