import { useState } from 'react';

const PortfolioAiChat = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://portfolio-ai-backend.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/questions/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) throw new Error(`Backend error: ${response.status}`);

      const data = await response.json();
      setChatHistory([...chatHistory, { question: data.question, answer: data.answer }]);
      setQuestion('');
    } catch (err) {
      setError(`Failed to get response: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Ask Me Anything</h2>

        {/* Chat Container - Glassmorphic */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="mb-8 max-h-96 overflow-y-auto space-y-4 pr-2">
              {chatHistory.map((item, index) => (
                <div key={index} className="space-y-3">
                  <div className="backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-300">Q: {item.question}</p>
                  </div>
                  <div className="backdrop-blur-sm bg-emerald-500/20 border border-emerald-400/30 rounded-lg p-4 ml-4">
                    <p className="text-sm text-emerald-100">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me about my skills, projects, or experience..."
              className="w-full p-4 rounded-xl backdrop-blur-sm bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 resize-none transition"
              rows="3"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white transition duration-200 backdrop-blur-sm bg-gradient-to-r from-blue-500/70 to-purple-500/70 hover:from-blue-600/70 hover:to-purple-600/70 disabled:from-gray-500/50 disabled:to-gray-500/50 border border-white/20"
            >
              {loading ? '✨ Thinking...' : '🚀 Ask AI'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-xl backdrop-blur-sm bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mt-6 p-6 text-center">
              <div className="inline-block animate-spin mb-3">
                <div className="w-6 h-6 border-3 border-blue-400/30 border-t-blue-400 rounded-full"></div>
              </div>
              <p className="text-white/70">AI is thinking...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PortfolioAiChat;
