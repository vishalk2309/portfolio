import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEOManager = () => {
  const location = useLocation();

  useEffect(() => {
    const isAdminPath = location.pathname.startsWith('/admin');

    // Update robots meta tag
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }

    robotsMeta.content = isAdminPath ? 'noindex, nofollow' : 'index, follow';

    // Skip canonical tag updates for admin routes (they're not indexed anyway)
    if (!isAdminPath) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      const baseUrl = 'https://vishalworks.co.in';
      canonicalLink.href = `${baseUrl}${location.pathname}`;
    }

  }, [location.pathname]);

  return null;
};

export default SEOManager;
