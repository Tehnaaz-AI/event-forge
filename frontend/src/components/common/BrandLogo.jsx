import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function BrandLogo({ 
  to = '/', 
  size = 'default', // 'small' | 'default' | 'large' | 'hero'
  showIcon = true,
  className = '',
  asSpan = false,
  variant = 'default' // 'default' | 'onDark'
}) {
  const iconSizes = {
    small: 'w-7 h-7 rounded-xl text-xs',
    default: 'w-8 sm:w-9 h-8 sm:h-9 rounded-full text-sm',
    large: 'w-11 sm:w-12 h-11 sm:h-12 rounded-2xl text-base',
    hero: 'w-14 h-14 rounded-3xl text-lg'
  };

  const calendarSizes = {
    small: 14,
    default: 16,
    large: 22,
    hero: 28
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

  const forgeColor = variant === 'onDark' 
    ? 'text-white' 
    : 'text-stone-900 dark:text-stone-100 dark:group-hover:text-amber-200';

  const content = (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 group shrink-0 select-none ${className}`}>
      {showIcon && (
        <div className={`${iconSizes[size] || iconSizes.default} bg-gradient-to-br from-amber-600 to-amber-500 dark:from-amber-500 dark:to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-600/25 dark:shadow-amber-500/20 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 shrink-0 border border-amber-400/30`}>
          <Calendar size={calendarSizes[size] || 16} className="font-bold drop-shadow-sm" />
        </div>
      )}
      <div className="flex items-baseline leading-none">
        <span className={`logo-cursive ${cursiveSizes[size] || cursiveSizes.default} font-extrabold text-amber-700 dark:text-amber-400 mr-0.5 tracking-normal transition-colors duration-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]`}>
          Event
        </span>
        <span className={`font-black ${forgeColor} ${forgeSizes[size] || forgeSizes.default} tracking-wider uppercase transition-colors duration-200 font-sans`}>
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
