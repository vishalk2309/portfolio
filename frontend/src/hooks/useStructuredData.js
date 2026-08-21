import { useEffect } from 'react';

export const useStructuredData = (data) => {
  useEffect(() => {
    if (!data) return;

    // Remove old structured data script if it exists
    const existing = document.querySelector('script[data-structured-data="true"]');
    if (existing) {
      existing.remove();
    }

    // Create new structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'true');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      // Cleanup is handled by the new script replacing the old one
    };
  }, [data]);
};
