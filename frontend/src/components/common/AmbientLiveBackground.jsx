import React from 'react';

export default function AmbientLiveBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Light theme subtle glow orbs */}
      <div className="dark:hidden">
        {/* Orb 1: Warm Amber / Terracotta */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#B45309]/10 via-[#F59E0B]/8 to-transparent blur-3xl animate-ambient-1" />
        
        {/* Orb 2: Champagne Gold */}
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#FDE68A]/25 via-[#D97706]/10 to-transparent blur-3xl animate-ambient-2" />
        
        {/* Orb 3: Soft Ivory / Ochre */}
        <div className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-[#EFE8DA]/60 via-[#B45309]/5 to-transparent blur-3xl animate-ambient-3" />
      </div>

      {/* Dark theme luminous ambient flow */}
      <div className="hidden dark:block">
        {/* Orb 1: Deep Amber Furnace Glow */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#B45309]/18 via-[#78350F]/12 to-transparent blur-3xl animate-ambient-1" />
        
        {/* Orb 2: Molten Gold Beacon */}
        <div className="absolute top-1/4 -right-40 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-[#F59E0B]/14 via-[#D97706]/8 to-transparent blur-3xl animate-ambient-2" />
        
        {/* Orb 3: Subtle Warm Obsidian Nebula */}
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#292524]/40 via-[#B45309]/10 to-transparent blur-3xl animate-ambient-3" />
      </div>

      {/* Ultra Subtle Grid Overlay for tech elegance */}
      <div 
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] bg-[radial-gradient(#1C1917_1px,transparent_1px)] dark:bg-[radial-gradient(#FEF3C7_1px,transparent_1px)] [background-size:24px_24px]" 
      />
    </div>
  );
}
