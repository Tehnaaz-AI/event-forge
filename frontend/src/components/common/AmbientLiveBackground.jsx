import React from 'react';

export default function AmbientLiveBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
      
      {/* ========================================================
          LIGHT MODE: Clean Luminous Foundation with Warm Amber Dot Matrix
          ======================================================== */}
      <div className="dark:hidden absolute inset-0 bg-[#FAF8F5]">
        
        {/* Overhead Warm Ambient Spotlight Beam */}
        <div 
          className="absolute inset-0 opacity-100 animate-spotlight-breathe"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.08) 45%, transparent 80%)'
          }}
        />

        {/* High-Definition Warm Amber Dot Matrix Grid */}
        <div 
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: 'radial-gradient(rgba(180, 83, 9, 0.25) 1.5px, transparent 1.5px)',
            backgroundSize: '26px 26px',
            maskImage: 'radial-gradient(ellipse 90% 80% at 50% 20%, black 40%, rgba(0,0,0,0.3) 70%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 20%, black 40%, rgba(0,0,0,0.3) 70%, transparent 95%)'
          }}
        />
      </div>

      {/* ========================================================
          DARK MODE: Deep Obsidian Velvet with Glowing Cyber-Amber Dot Matrix
          ======================================================== */}
      <div className="hidden dark:block absolute inset-0 bg-[#09090B]">
        
        {/* Overhead Glowing Amber Cyber-Spotlight */}
        <div 
          className="absolute inset-0 opacity-100 animate-spotlight-breathe"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(217, 119, 6, 0.32) 0%, rgba(180, 83, 9, 0.14) 50%, transparent 80%)'
          }}
        />

        {/* High-Definition Cyber-Amber Glowing Dot Matrix Grid */}
        <div 
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage: 'radial-gradient(rgba(245, 158, 11, 0.35) 1.5px, transparent 1.5px)',
            backgroundSize: '26px 26px',
            maskImage: 'radial-gradient(ellipse 90% 80% at 50% 20%, black 45%, rgba(0,0,0,0.35) 75%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 20%, black 45%, rgba(0,0,0,0.35) 75%, transparent 95%)'
          }}
        />
      </div>

    </div>
  );
}





