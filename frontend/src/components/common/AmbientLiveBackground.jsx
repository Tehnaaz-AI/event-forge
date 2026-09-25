import React from 'react';

export default function AmbientLiveBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      
      {/* Light theme rich dynamic ambient gradient mesh */}
      <div className="dark:hidden absolute inset-0 bg-gradient-to-br from-[#FAF5EE] via-[#F4ECE0] to-[#FAF2E6]">
        {/* Animated Moving Gradient Base Canvas */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FAF5EE] via-[#F1E5D4]/80 to-[#FAF0DF] animate-canvas-shift opacity-90" />

        {/* Soft Warm Amber Ambient Orb */}
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-[#B45309]/20 via-[#F59E0B]/14 to-transparent blur-[100px] animate-ambient-1" />
        
        {/* Soft Champagne Honey Glow */}
        <div className="absolute top-1/3 -right-32 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-[#E6CA9A]/40 via-[#D97706]/15 to-transparent blur-[110px] animate-ambient-2" />
        
        {/* Soft Sand Dune Horizon Blob */}
        <div className="absolute -bottom-40 left-1/4 w-[750px] h-[750px] rounded-full bg-gradient-to-tr from-[#DFCCA8]/50 via-[#B45309]/15 to-transparent blur-[110px] animate-ambient-3" />

        {/* Floating Accent Blob */}
        <div className="absolute top-2/3 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#FDE68A]/35 via-[#F1E3D0]/60 to-transparent blur-[90px] animate-ambient-4" />
      </div>

      {/* Dark theme rich luminous fluid gradient mesh */}
      <div className="hidden dark:block absolute inset-0 bg-[#0C0A09]">
        {/* Animated Moving Gradient Base Canvas */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C0A09] via-[#1A120B] to-[#0C0A09] animate-canvas-shift opacity-80" />

        {/* Deep Amber Furnace Flame */}
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#B45309]/30 via-[#78350F]/20 to-transparent blur-[140px] animate-ambient-1" />
        
        {/* Molten Gold Beacon */}
        <div className="absolute top-1/4 -right-32 w-[750px] h-[750px] rounded-full bg-gradient-to-bl from-[#F59E0B]/22 via-[#D97706]/15 to-transparent blur-[150px] animate-ambient-2" />
        
        {/* Deep Warm Copper Nebula */}
        <div className="absolute top-2/3 left-1/4 w-[750px] h-[750px] rounded-full bg-gradient-to-tr from-[#9A3412]/25 via-[#B45309]/15 to-transparent blur-[140px] animate-ambient-3" />

        {/* Signature Warm Beige Aura */}
        <div className="absolute -bottom-40 right-1/3 w-[650px] h-[650px] rounded-full bg-gradient-to-tl from-[#D4B996]/15 via-[#78350F]/20 to-transparent blur-[130px] animate-ambient-4" />
      </div>

      {/* Tech Geometry Grid Watermark */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(#1C1917_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#FDE68A_1.2px,transparent_1.2px)] [background-size:28px_28px]" 
      />
    </div>
  );
}
