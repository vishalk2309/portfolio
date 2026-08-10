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
          <div className="w-full md:max-w-2xl md:rounded-2xl rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 border border-white/10 shadow-2xl flex flex-col h-screen md:h-auto md:max-h-96">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-white font-semibold">AI Assistant</h3>
              <button
                onClick={closeChat}
                className="text-white/50 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white/10 text-white rounded-bl-none'
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
            <div className="border-t border-white/10 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask me..."
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold transition"
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
