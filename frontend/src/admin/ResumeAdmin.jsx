import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const RESUME_BUCKET = 'resume';
const RESUME_FILE_NAME = 'vishal-resume.pdf';

export default function ResumeAdmin() {
  const [currentResume, setCurrentResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadCurrentResume();
  }, []);

  const loadCurrentResume = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: listError } = await supabase.storage
        .from(RESUME_BUCKET)
        .list('', { limit: 100 });

      if (listError) throw listError;

      const resumeFile = data?.find((f) => f.name === RESUME_FILE_NAME);
      if (resumeFile) {
        const { data: signedUrl } = await supabase.storage
          .from(RESUME_BUCKET)
          .createSignedUrl(RESUME_FILE_NAME, 3600);

        setCurrentResume({
          name: RESUME_FILE_NAME,
          url: signedUrl.signedUrl,
          lastModified: resumeFile.updated_at,
        });
      } else {
        setCurrentResume(null);
      }
    } catch (err) {
      console.error('Error loading resume:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      setError('Please upload a PDF or document file');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      // Delete old resume if it exists
      try {
        await supabase.storage.from(RESUME_BUCKET).remove([RESUME_FILE_NAME]);
      } catch {
        // File might not exist
      }

      // Upload new resume
      const { error: uploadError } = await supabase.storage
        .from(RESUME_BUCKET)
        .upload(RESUME_FILE_NAME, file, { upsert: true });

      if (uploadError) throw uploadError;

      setSuccess('Resume uploaded successfully!');
      await loadCurrentResume();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the resume?')) return;

    try {
      setUploading(true);
      setError(null);

      const { error: deleteError } = await supabase.storage
        .from(RESUME_BUCKET)
        .remove([RESUME_FILE_NAME]);

      if (deleteError) throw deleteError;

      setSuccess('Resume deleted successfully!');
      setCurrentResume(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Resume Management</h2>
        <p className="mt-1 text-sm text-white/60">Upload and manage your resume</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/50 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/50 p-4 text-sm text-green-400">
          {success}
        </div>
      )}

      {loading ? (
        <p className="text-white/60">Loading...</p>
      ) : (
        <div className="space-y-6">
          {/* Current Resume */}
          {currentResume && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Current Resume</p>
                  <p className="mt-1 text-xs text-white/60">
                    {currentResume.name}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    Last updated: {new Date(currentResume.lastModified).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={currentResume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  📄 View
                </a>
                <button
                  onClick={handleDelete}
                  disabled={uploading}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="rounded-lg border border-dashed border-white/20 p-6 text-center transition hover:border-white/40">
            <div className="mb-4 text-3xl">📎</div>
            <p className="mb-2 text-sm font-semibold text-white">
              {currentResume ? 'Replace Resume' : 'Upload Resume'}
            </p>
            <p className="mb-4 text-xs text-white/60">PDF or Document format</p>
            <label className="inline-block">
              <input
                type="file"
                onChange={handleUpload}
                disabled={uploading}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              <span className="inline-block rounded-lg bg-gradient-btn px-4 py-2 text-sm font-semibold cursor-pointer text-base hover:opacity-90 transition disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Choose File'}
              </span>
            </label>
          </div>

          {/* Info */}
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
            <p className="text-xs text-blue-300">
              <strong>💡 Tip:</strong> The uploaded resume will be available for download on your portfolio. Make sure it's up-to-date with your latest experience and skills.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
