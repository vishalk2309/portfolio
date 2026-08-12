import { useState, useEffect } from 'react';

export default function ResumeDownload() {
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumeUrl = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://portfolio-ai-backend-eq0l.onrender.com';
        const response = await fetch(`${backendUrl}/api/resume/download`, { signal: AbortSignal.timeout(3000) });

        if (!response.ok) {
          throw new Error('Failed to fetch resume URL');
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setResumeUrl(data.url);
      } catch (err) {
        console.error('Error fetching resume URL, using fallback:', err);
        // Fallback to direct Supabase URL
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lvglryvlvfixwueujbxr.supabase.co';
        const fallbackUrl = `${supabaseUrl}/storage/v1/object/public/resume/vishal-resume.pdf`;
        setResumeUrl(fallbackUrl);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeUrl();
  }, []);

  if (loading) {
    return (
      <span className="inline-block rounded-full border border-white/20 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur-md transition-transform opacity-50 cursor-not-allowed">
        Loading Resume...
      </span>
    );
  }

  if (!resumeUrl) {
    return null;
  }

  return (
    <a
      href={resumeUrl}
      download="Vishal_Kushwaha_Resume.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-full border border-white/20 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur-md transition-transform hover:scale-105"
    >
      📄 My Resume
    </a>
  );
}
