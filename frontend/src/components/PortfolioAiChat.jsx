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

      setAnswer(data.answer);
      setQuestion('');
    } catch (err) {
      console.error('Full error:', err);
      setAnswer(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 pt-0 pb-12">
      <div className="w-full mx-auto z-20 relative">
        {/* Search Bar Container */}
        <div className="backdrop-blur-lg bg-white/5 border border-white/20 rounded-xl p-3 mb-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me..."
              className="flex-1 px-3 py-2 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition backdrop-blur-sm bg-blue-500/70 hover:bg-blue-600/70 disabled:bg-gray-500/50 border border-white/20 whitespace-nowrap"
            >
              {loading ? '...' : 'Ask'}
            </button>
          </form>
        </div>

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
          <div className="w-full p-8 backdrop-blur-lg bg-white/5 border border-white/20 rounded-2xl min-h-64 max-h-96 overflow-y-auto">
            <p className="text-base text-white font-medium leading-relaxed whitespace-pre-wrap">
              {answer.includes("Error") ? "🚀 AI built-in feature is in progress. Coming soon!" : answer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioAiChat;
