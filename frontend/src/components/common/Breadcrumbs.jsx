import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs font-semibold text-stone-500 py-3">
      <ol className="flex items-center flex-wrap gap-1.5">
        <li className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center gap-1 text-stone-500 hover:text-[#B45309] transition-colors"
          >
            <Home size={13} />
            <span>Home</span>
          </Link>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-stone-300 shrink-0" />
              {isLast || !item.path ? (
                <span className="text-stone-800 font-bold max-w-[240px] truncate" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.path} 
                  className="text-stone-500 hover:text-[#B45309] transition-colors max-w-[200px] truncate"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
