import { useEffect } from 'react';

export const useStructuredData = (data) => {
  useEffect(() => {
    if (!data) return;

    // Remove all dynamic schema scripts we've added (marked with our attribute)
    document.querySelectorAll('script[data-dynamic-ld-json="true"]').forEach(el => el.remove());

    // Create new structured data script with proper type
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-dynamic-ld-json', 'true');
    script.innerHTML = JSON.stringify(data);

    // Always append to document.head
    const headElement = document.querySelector('head');
    if (headElement) {
      headElement.appendChild(script);
    }
  }, [data]);
};
