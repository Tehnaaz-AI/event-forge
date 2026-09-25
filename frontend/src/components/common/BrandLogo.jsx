import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function BrandLogo({ 
  to = '/', 
  size = 'default', // 'small' | 'default' | 'large' | 'hero'
  showIcon = true,
  className = '',
  asSpan = false,
  variant = 'default' // 'default' | 'onDark'
}) {
  let isDark = false;
  try {
    const themeCtx = useTheme();
    isDark = themeCtx?.isDark || false;
  } catch (e) {
    // Fallback if rendered outside ThemeContext
    isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  }

  const iconSizes = {
    small: 'w-7 h-7 rounded-xl',
    default: 'w-8 sm:w-9 h-8 sm:h-9 rounded-xl',
    large: 'w-11 sm:w-12 h-11 sm:h-12 rounded-2xl',
    hero: 'w-14 h-14 rounded-2xl'
  };

  const svgIconSizes = {
    small: 18,
    default: 22,
    large: 28,
    hero: 34
  };

  const cursiveSizes = {
    small: 'text-xl sm:text-2xl',
    default: 'text-2xl sm:text-3xl',
    large: 'text-3xl sm:text-4xl',
    hero: 'text-4xl sm:text-5xl'
  };

  const forgeSizes = {
    small: 'text-base sm:text-lg',
    default: 'text-lg sm:text-xl',
    large: 'text-2xl sm:text-3xl',
    hero: 'text-3xl sm:text-4xl'
  };

  // Light theme: Event in warm beige/amber-copper (#D4B996 / #B45309), FORGE in deep obsidian (#1C1917)
  // Dark theme: Event in signature warm BEIGE (#D4B996 / #E5D2B8), FORGE in crisp white (#FFFFFF)
  const isDarkEffective = variant === 'onDark' || isDark;

  const eventTextColor = isDarkEffective 
    ? 'text-[#D4B996]' // Warm signature beige matching light theme
    : 'text-[#B45309]'; // Amber copper beige

  const forgeTextColor = isDarkEffective 
    ? 'text-white' 
    : 'text-[#1C1917]';

  const iconDimension = svgIconSizes[size] || svgIconSizes.default;

  const content = (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 group shrink-0 select-none ${className}`}>
      {showIcon && (
        <div 
          className={`${iconSizes[size] || iconSizes.default} flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-1 shrink-0 ${
            isDarkEffective 
              ? 'bg-gradient-to-br from-[#292524] to-[#1C1917] border border-stone-700/60 shadow-lg shadow-black/40' 
              : 'bg-gradient-to-br from-[#B45309] to-[#92400E] border border-amber-500/30 shadow-md shadow-amber-900/20 text-white'
          }`}
        >
          {/* Custom EventForge Anvil & Quantum Spark Emblem */}
          <svg 
            width={iconDimension} 
            height={iconDimension} 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 group-hover:scale-110"
          >
            {/* Anvil Horn and Top Stage Bar */}
            <path 
              d="M6 10C6 8.89543 6.89543 8 8 8H24C25.1046 8 26 8.89543 26 10V12C26 12.5523 25.5523 13 25 13H7C6.44772 13 6 12.5523 6 12V10Z" 
              fill={isDarkEffective ? '#F5EBE0' : '#FFFFFF'} 
            />
            {/* Anvil Waist / Crucible */}
            <path 
              d="M9 13H23C23 13 21.5 19 19 21H13C10.5 19 9 13 9 13Z" 
              fill={isDarkEffective ? '#E7E5E4' : '#FDE68A'} 
              fillOpacity={0.9} 
            />
            {/* Anvil Base Plate */}
            <path 
              d="M7 23C7 22.4477 7.44772 22 8 22H24C24.5523 22 25 22.4477 25 23V25C25 25.5523 24.5523 26 24 26H8C7.44772 26 7 25.5523 7 25V23Z" 
              fill={isDarkEffective ? '#D6D3D1' : '#FFFFFF'} 
            />
            {/* Event Forge Kinetic Star Spark */}
            <path 
              d="M16 14L16.8 16.2L19 17L16.8 17.8L16 20L15.2 17.8L13 17L15.2 16.2L16 14Z" 
              fill={isDarkEffective ? '#F59E0B' : '#B45309'} 
            />
            {/* Live Micro-Beacons */}
            <circle cx="11" cy="6" r="1.2" fill={isDarkEffective ? '#F59E0B' : '#FEF3C7'} />
            <circle cx="21" cy="6" r="1.2" fill={isDarkEffective ? '#F59E0B' : '#FEF3C7'} />
          </svg>
        </div>
      )}
      <div className="flex items-baseline leading-none">
        <span className={`logo-cursive ${cursiveSizes[size] || cursiveSizes.default} font-extrabold ${eventTextColor} mr-0.5 tracking-normal transition-colors duration-200`}>
          Event
        </span>
        <span className={`font-black ${forgeTextColor} ${forgeSizes[size] || forgeSizes.default} tracking-wider uppercase transition-colors duration-200 font-sans`}>
          FORGE
        </span>
      </div>
    </div>
  );

  if (asSpan || !to) {
    return content;
  }

  return (
    <Link to={to} className="inline-flex items-center">
      {content}
    </Link>
  );
}
