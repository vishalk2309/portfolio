import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEOManager = () => {
  const location = useLocation();

  useEffect(() => {
    // Determine if the current page should be indexed
    const isAdminPath = location.pathname.startsWith('/admin');

    // Update robots meta tag
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }

    if (isAdminPath) {
      robotsMeta.content = 'noindex, nofollow';
    } else {
      robotsMeta.content = 'index, follow';
    }

    // Update canonical tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }

    // Set canonical URL based on current path
    const baseUrl = 'https://vishalworks.co.in';
    canonicalLink.href = `${baseUrl}${location.pathname}`;

  }, [location.pathname]);

  return null;
};

export default SEOManager;
