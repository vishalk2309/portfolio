import { useState } from 'react';

const PortfolioAiChat = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://portfolio-ai-backend-eq0l.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');

    try {
      console.log('Fetching from:', `${BACKEND_URL}/api/questions/ask`);

      const response = await fetch(`${BACKEND_URL}/api/questions/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      const firstLine = data.answer.split('\n')[0];
      setAnswer(firstLine.substring(0, 200));
      setQuestion('');
    } catch (err) {
      console.error('Full error:', err);
      setAnswer(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 pt-0 pb-6">
      <div className="max-w-2xl mx-auto z-20 relative">
        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything about my skills, projects..."
            className="flex-1 px-4 py-3 rounded-xl backdrop-blur-sm bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl font-semibold text-white transition backdrop-blur-sm bg-blue-500/70 hover:bg-blue-600/70 disabled:bg-gray-500/50 border border-white/20 whitespace-nowrap"
          >
            {loading ? '✨ Asking...' : '✨ Ask'}
          </button>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin">
              <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full"></div>
            </div>
            <p className="text-white/50 text-sm mt-2">Processing...</p>
          </div>
        )}

        {/* Answer Display or In Progress Message */}
        {answer && (
          <div className="p-4 backdrop-blur-sm bg-yellow-500/10 border border-yellow-400/30 rounded-xl">
            <p className="text-sm text-yellow-100">
              {answer.includes("Error") ? "🚀 AI built-in feature is in progress. Coming soon!" : answer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioAiChat;
