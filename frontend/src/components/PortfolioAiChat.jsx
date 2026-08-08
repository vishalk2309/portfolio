import { useState } from 'react';

const PortfolioAiChat = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // Use environment variable or default to deployed backend URL
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://portfolio-ai-backend.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/questions/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      setAnswer(data.answer);

      // Add to chat history
      setChatHistory([
        ...chatHistory,
        { question: data.question, answer: data.answer }
      ]);

      setQuestion('');
    } catch (err) {
      setError(`Failed to get response: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-white mb-6">Ask Me Anything</h2>

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="mb-6 max-h-64 overflow-y-auto bg-slate-700 rounded-lg p-4">
          {chatHistory.map((item, index) => (
            <div key={index} className="mb-4">
              <p className="text-sm font-semibold text-blue-400">Q: {item.question}</p>
              <p className="text-sm text-gray-300 mt-1">A: {item.answer}</p>
              {index < chatHistory.length - 1 && <hr className="my-3 border-slate-600" />}
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything about my skills, experience, or projects..."
            className="w-full p-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          {loading ? 'Thinking...' : 'Get Answer'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-900 text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Current Answer */}
      {answer && !loading && (
        <div className="mt-6 p-4 bg-slate-700 rounded-lg">
          <p className="text-green-400 font-semibold mb-2">Answer:</p>
          <p className="text-gray-100">{answer}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-6 p-4 bg-slate-700 rounded-lg text-center">
          <div className="inline-block animate-spin">
            <svg className="w-5 h-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-300 mt-2">AI is thinking...</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioAiChat;
