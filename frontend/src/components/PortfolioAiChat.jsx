import { useState, useEffect, useRef } from 'react';

const PortfolioAiChat = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const messagesEndRef = useRef(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://portfolio-ai-backend-eq0l.onrender.com';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedAnswer]);

  // Typing effect for AI response
  useEffect(() => {
    if (!loading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content !== displayedAnswer) {
        let index = 0;
        const fullText = lastMessage.content;
        setDisplayedAnswer('');

        const typeInterval = setInterval(() => {
          if (index < fullText.length) {
            setDisplayedAnswer(fullText.slice(0, index + 1));
            index++;
          } else {
            clearInterval(typeInterval);
          }
        }, 10);

        return () => clearInterval(typeInterval);
      }
    }
  }, [loading, messages, displayedAnswer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = question.trim();
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setDisplayedAnswer('');
    setIsOpen(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/questions/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!response.ok) throw new Error('Backend error');

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      console.error('Error:', err);
      setMessages((prev) => [...prev, { role: 'assistant', content: '❌ Error: Unable to get response' }]);
    } finally {
      setLoading(false);
    }
  };

  const closeChat = () => {
    setMessages([]);
    setQuestion('');
    setDisplayedAnswer('');
    setIsOpen(false);
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

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-20 flex items-end md:items-center justify-center md:pb-0 pb-0">
          <div className="w-full md:max-w-2xl md:rounded-2xl rounded-2xl bg-gradient-to-b from-slate-800/90 via-slate-700/90 to-slate-800/90 backdrop-blur-xl border border-blue-400/30 shadow-2xl flex flex-col h-screen md:h-auto md:max-h-96">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-blue-400/20 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
              <h3 className="text-white font-bold text-lg">💬 AI Chat</h3>
              <button
                onClick={closeChat}
                className="text-white/60 hover:text-white transition text-xl"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/40">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                        : 'bg-white/15 backdrop-blur-sm text-white rounded-bl-none border border-white/20'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">
                      {msg.role === 'assistant' && idx === messages.length - 1 ? displayedAnswer : msg.content}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-4 py-2 rounded-lg">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-blue-400/20 p-4 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask me..."
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/30 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold shadow-lg transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Open Chat Button */}
      {!isOpen && (
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/30 rounded-full p-1.5 shadow-lg hover:shadow-xl transition"
          >
            <div className="flex gap-1 items-center px-5 py-2.5">
              <span className="text-lg">💬</span>
              <span className="text-white text-sm">Ask me anything...</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default PortfolioAiChat;
