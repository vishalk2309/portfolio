import { useState } from 'react';

const PortfolioAiChat = () => {
  const [showDropdown, setShowDropdown] = useState(false);
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
      const response = await fetch(`${BACKEND_URL}/api/questions/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) throw new Error(`Backend error: ${response.status}`);
      const data = await response.json();

      const firstLine = data.answer.split('\n')[0];
      setAnswer(firstLine.substring(0, 200));
      setShowDropdown(true);
      setQuestion('');
    } catch (err) {
      console.error('Chat error:', err);
      setAnswer(`Error: ${err.message}`);
      setShowDropdown(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center mb-8">
      <div className="relative">
        {/* AI Chat Label */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="text-white/70 hover:text-white transition font-medium text-sm flex items-center gap-2"
        >
          <span className="text-lg">✨</span>
          Ask AI about me
          <span className={`transition transform ${showDropdown ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {/* Dropdown Answer */}
        {showDropdown && (
          <div className="absolute top-full mt-3 w-96 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">

            {/* Answer Display */}
            {answer && !loading && (
              <div className="mb-4 p-4 backdrop-blur-sm bg-emerald-500/10 border border-emerald-400/30 rounded-xl">
                <p className="text-sm text-emerald-100">{answer}</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin">
                  <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full"></div>
                </div>
                <p className="text-white/50 text-xs mt-2">Thinking...</p>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What do you want to know?"
                className="w-full p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 rounded-lg font-semibold text-white text-sm transition backdrop-blur-sm bg-blue-500/70 hover:bg-blue-600/70 disabled:bg-gray-500/50 border border-white/20"
              >
                {loading ? '...' : 'Ask'}
              </button>
            </form>

            {/* Close Button */}
            <button
              onClick={() => setShowDropdown(false)}
              className="absolute top-2 right-2 text-white/50 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioAiChat;
