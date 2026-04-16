import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const SAMPLE_RESPONSES = [
  "I'm a full-stack developer specializing in React, TypeScript, and scalable web applications. My work focuses on clean architecture and user-centered design.",
  "Recent projects include building real-time collaboration tools, designing component systems, and optimizing performance for production applications.",
  "I approach problems by understanding user needs first, then architecting solutions that are both technically sound and maintainable.",
  "My technical stack includes React, Node.js, PostgreSQL, and modern deployment platforms. I believe in choosing the right tool for each problem.",
  "Currently exploring AI integration, distributed systems, and advanced frontend patterns. Always interested in challenging projects."
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! Ask me anything about my work, experience, or approach to building software.",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    const history = messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('VITE_API_URL is not set in .env');
      }

      const endpoint = apiUrl.endsWith('/') ? `${apiUrl}ask` : `${apiUrl}/ask`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.text,
          tone: "professional",
          conversationHistory: history
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer || "I'm sorry, I couldn't generate a response.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Error: Unable to connect to the terminal API. Please check if VITE_API_URL is set correctly in your .env file.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[650px] overflow-hidden">
      {/* Header bar of chat */}
      <div className="bg-[#FFC900] border-b-4 border-black px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0">
        <h2 className="font-black text-lg sm:text-xl uppercase tracking-wider sm:tracking-widest drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] sm:drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-white truncate">Chat_Terminal //</h2>
        <div className="hidden sm:flex gap-2 shrink-0">
          <div className="w-4 h-4 rounded-full border-2 border-black bg-[#FF90E8]" />
          <div className="w-4 h-4 rounded-full border-2 border-black bg-[#38BDF8]" />
          <div className="w-4 h-4 rounded-full border-2 border-black bg-white" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 bg-[#FFFDF9]">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] sm:max-w-[75%] ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {message.sender === 'ai' && (
                  <p className="text-xs sm:text-sm font-black uppercase mb-1.5 sm:mb-2 bg-black text-white inline-block px-2 py-0.5 sm:px-3 sm:py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Assistant</p>
                )}
                {message.sender === 'user' && (
                  <p className="text-xs sm:text-sm font-black uppercase mb-1.5 sm:mb-2 bg-black text-white inline-block px-2 py-0.5 sm:px-3 sm:py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">You</p>
                )}
                <div
                  className={`border-4 border-black px-4 py-3 sm:px-5 sm:py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col ${
                    message.sender === 'user'
                      ? 'bg-[#38BDF8] text-black text-left'
                      : 'bg-white text-black'
                  }`}
                >
                  <div className="text-base sm:text-lg font-bold leading-relaxed break-words">
                    {message.sender === 'user' ? (
                      <p>{message.text}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-none space-y-3 mb-4 last:mb-0 pl-1" {...props} />,
                          li: ({node, ...props}) => (
                            <li className="flex gap-3 items-start">
                              <span className="text-[#FF90E8] mt-1 shrink-0 font-black">▹</span>
                              <span className="flex-1">{props.children}</span>
                            </li>
                          ),
                          strong: ({node, ...props}) => <strong className="font-black bg-[#FFC900]/50 border-b-2 border-black px-1" {...props} />
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[90%] sm:max-w-[85%]">
              <p className="text-xs sm:text-sm font-black uppercase mb-1.5 sm:mb-2 bg-black text-white inline-block px-2 py-0.5 sm:px-3 sm:py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Assistant</p>
              <div className="bg-white border-4 border-black px-4 py-3 sm:px-5 sm:py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex gap-2">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-3 h-3 bg-[#FF90E8] border-2 border-black"
                  />
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-3 h-3 bg-[#38BDF8] border-2 border-black"
                  />
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-3 h-3 bg-[#FFC900] border-2 border-black"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input */}
      <div className="border-t-4 border-black p-3 sm:p-6 bg-[#E5E5E5] shrink-0">
        <div className="flex gap-2 sm:gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me something..."
            className="flex-1 min-w-0 bg-white border-4 border-black px-3 py-2.5 sm:px-4 sm:py-3 text-black font-bold text-sm sm:text-base placeholder:text-neutral-500 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-[#FF90E8] px-4 sm:px-6 border-4 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}