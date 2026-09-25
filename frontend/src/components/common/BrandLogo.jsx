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
    : 'text-stone-900 dark:text-white';

  const content = (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 group shrink-0 ${className}`}>
      {showIcon && (
        <div className={`${iconSizes[size] || iconSizes.default} bg-gradient-to-br from-[#B45309] to-[#D97706] flex items-center justify-center text-white shadow-sm shadow-[#B45309]/20 group-hover:scale-105 transition-transform shrink-0`}>
          <Calendar size={calendarSizes[size] || 16} className="font-bold" />
        </div>
      )}
      <div className="flex items-baseline leading-none">
        <span className={`logo-cursive ${cursiveSizes[size] || cursiveSizes.default} font-extrabold text-[#B45309] dark:text-[#F59E0B] mr-0.5 tracking-normal transition-colors`}>
          Event
        </span>
        <span className={`font-extrabold ${forgeColor} ${forgeSizes[size] || forgeSizes.default} tracking-tight uppercase transition-colors`}>
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
