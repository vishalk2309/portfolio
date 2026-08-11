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
      <a href="#" className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition opacity-50 cursor-not-allowed">
        <span>📄</span>
        Loading Resume...
      </a>
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
      className="inline-flex items-center gap-2 rounded-lg bg-gradient-btn px-4 py-2 text-sm font-semibold text-base hover:opacity-90 transition shadow-lg hover:shadow-xl"
    >
      <span>📄</span>
      Download Resume
    </a>
  );
}
