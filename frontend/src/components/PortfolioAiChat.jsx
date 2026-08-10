import { useState, useEffect, useRef } from 'react';

const PortfolioAiChat = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingIntervalRef = useRef(null);

  const TYPING_SPEED = 20; // milliseconds per character
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://portfolio-ai-backend-eq0l.onrender.com';

  // Typewriter effect
  useEffect(() => {
    if (!answer) {
      setDisplayedAnswer('');
      setIsTyping(false);
      return;
    }

    setDisplayedAnswer('');
    setIsTyping(true);
    let index = 0;

    const startTyping = () => {
      typingIntervalRef.current = setInterval(() => {
        if (index < answer.length) {
          setDisplayedAnswer(answer.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typingIntervalRef.current);
          setIsTyping(false);
        }
      }, TYPING_SPEED);
    };

    startTyping();

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [answer]);

  const closeChat = () => {
    setAnswer('');
    setQuestion('');
    setDisplayedAnswer('');
    setIsOpen(false);
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
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

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Backend error response:', errorData);
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI Response:', data);
      setAnswer(data.answer);
      setQuestion('');
      setIsOpen(true);
    } catch (err) {
      console.error('Error:', err);
      const errorMsg = err.message || 'Network error - please try again';
      setAnswer(`❌ ${errorMsg}`);
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
          onClick={closeChat}
        />
      )}

      <div className="w-full mx-auto z-20 relative">
        {/* Search Bar Container */}
        <div className="max-w-2xl mx-auto backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/30 dark:border-gray-700/30 rounded-full p-1.5 mb-8 shadow-lg dark:bg-gradient-to-r dark:from-purple-500/5 dark:to-blue-500/5">
          <form onSubmit={handleSubmit} className="flex gap-1 items-center">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-5 py-2.5 rounded-full backdrop-blur-sm bg-white/10 dark:bg-white/5 border-0 text-sm text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full font-semibold text-sm text-white transition bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              {loading ? '✨' : '✨'}
            </button>
          </form>
        </div>

        {/* Answer Display Modal */}
        {answer && isOpen && (
          <div className="w-full relative max-w-2xl mx-auto">
            <div className="w-full p-8 backdrop-blur-md bg-base/40 border border-white/10 rounded-2xl min-h-64 max-h-96 overflow-y-auto shadow-lg">
              <button
                onClick={closeChat}
                className="absolute top-4 right-4 text-white/50 hover:text-white/80 transition text-xl"
              >
                ✕
              </button>
              <p className="text-base text-white/90 font-medium leading-relaxed whitespace-pre-wrap pr-6">
                {answer.startsWith("❌") ? "🚀 Something went wrong. Please try again!" : displayedAnswer}
                {isTyping && <span className="inline-block w-1.5 h-5 ml-1 bg-white/90 animate-pulse align-text-bottom">▋</span>}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioAiChat;
