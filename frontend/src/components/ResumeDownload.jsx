import { useState, useEffect } from 'react';

export default function ResumeDownload() {
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResumeUrl = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL || 'https://portfolio-ai-backend-eq0l.onrender.com'}/api/resume/download`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch resume URL');
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setResumeUrl(data.url);
      } catch (err) {
        console.error('Error fetching resume URL:', err);
        setError(err.message);
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

  if (error || !resumeUrl) {
    return null; // Silently fail if resume is not available
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
