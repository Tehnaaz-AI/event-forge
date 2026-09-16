import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useSiteAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Record client-side route view telemetry
    try {
      const stats = JSON.parse(localStorage.getItem('eventforge_site_analytics') || '{"views":{}, "sessions":1}');
      const path = location.pathname;
      stats.views[path] = (stats.views[path] || 0) + 1;
      stats.lastActive = new Date().toISOString();
      localStorage.setItem('eventforge_site_analytics', JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [location.pathname]);
}

export default useSiteAnalytics;
