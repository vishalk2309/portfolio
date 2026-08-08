import { useState } from 'react';

const PortfolioAiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://portfolio-ai-backend.onrender.com';

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

      const firstLine = data.answer.split('\n')[0];
      setAnswer(firstLine.substring(0, 150));
      setQuestion('');
    } catch (err) {
      setAnswer('Sorry, I had an error. Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Circular Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full backdrop-blur-md bg-gradient-to-r from-blue-500/70 to-purple-500/70 border border-white/30 flex items-center justify-center text-white text-2xl hover:scale-110 transition transform z-40 shadow-2xl"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Widget - Circular */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 w-80 backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl z-40">

          {/* Chat Display */}
          <div className="mb-4 min-h-20 max-h-32 overflow-y-auto">
            {answer ? (
              <div className="backdrop-blur-sm bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-4">
                <p className="text-sm text-emerald-100">{answer}</p>
              </div>
            ) : (
              <p className="text-white/50 text-sm text-center py-4">Ask me anything...</p>
            )}
            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin">
                  <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me..."
              className="w-full p-3 rounded-xl backdrop-blur-sm bg-white/5 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-xl font-semibold text-white text-sm transition backdrop-blur-sm bg-blue-500/70 hover:bg-blue-600/70 disabled:bg-gray-500/50 border border-white/20"
            >
              {loading ? '...' : 'Ask'}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default PortfolioAiChat;
