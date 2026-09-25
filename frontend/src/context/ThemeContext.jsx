import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('eventforge_theme');
    if (saved) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const isDarkMode = theme === 'dark';
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('eventforge_theme', theme);

    // Dynamically update browser tab favicon on theme change
    try {
      const iconHref = isDarkMode ? '/favicon-dark.svg' : '/favicon-light.svg';
      const themeColor = isDarkMode ? '#0E0C0A' : '#FAF5EC';
      
      const iconLinks = document.querySelectorAll("link[rel*='icon']");
      if (iconLinks && iconLinks.length > 0) {
        iconLinks.forEach(el => {
          // If media query is specified, leave it for browser auto-detect, otherwise update default
          if (!el.getAttribute('media')) {
            el.setAttribute('href', iconHref);
          }
        });
      }
      
      const themeColorMeta = document.querySelector("meta[name='theme-color']");
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', themeColor);
      }
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
