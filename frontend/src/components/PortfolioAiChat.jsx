import { useState } from 'react';

const PortfolioAiChat = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://portfolio-ai-backend-eq0l.onrender.com';

  const closeChat = () => {
    setAnswer('');
    setQuestion('');
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/questions/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) throw new Error('Backend error');

      const data = await response.json();
      setAnswer(data.answer);
      setQuestion('');
      setIsOpen(true);
    } catch (err) {
      console.error('Error:', err);
      setAnswer(`❌ ${err.message}`);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 pt-0 pb-12">
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10"
          onClick={closeChat}
        />
      )}

      <div className="w-full mx-auto z-20 relative">
        {/* Search Bar Container */}
        <div className="max-w-2xl mx-auto backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/30 rounded-full p-1.5 mb-8 shadow-lg">
          <form onSubmit={handleSubmit} className="flex gap-1 items-center">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-5 py-2.5 rounded-full backdrop-blur-sm bg-white/10 border-0 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full font-semibold text-sm text-white transition bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-500 disabled:to-gray-600 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              {loading ? '✨' : '✨'}
            </button>
          </form>
        </div>

        {/* Answer Display Modal */}
        {answer && isOpen && (
          <div className="w-full relative max-w-2xl mx-auto">
            <div className="w-full p-8 backdrop-blur-lg bg-gradient-to-b from-slate-950/80 via-slate-900/80 to-slate-950/80 border border-purple-500/20 rounded-2xl min-h-64 max-h-96 overflow-y-auto shadow-2xl">
              <button
                onClick={closeChat}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition text-xl"
              >
                ✕
              </button>
              <p className="text-base text-white font-medium leading-relaxed whitespace-pre-wrap pr-6">
                {answer.includes("Error") ? "🚀 AI built-in feature is in progress. Coming soon!" : answer}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioAiChat;
