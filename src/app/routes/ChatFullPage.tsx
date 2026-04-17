import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { trackEvent } from "../../utils/analytics";
import ReactMarkdown from 'react-markdown';
import { detectMaliciousInput, validateMessageLength, RateLimiter } from '../../utils/security';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const SAMPLE_RESPONSES = [
  "I'm an Associate Consultant at Oracle, currently focused on DevOps practices, backend system integration, and production support.",
  "I work extensively with Kubernetes, debugging pods, analyzing logs with kubectl, and ensuring seamless system communication.",
  "My tech stack includes Bash, Java, Python, and robust database connectivity across diverse hosts using JNDI and multi-data sources.",
  "I love automating repetitive tasks. Recently, I developed bash scripts and utilities like SSO-ADAPTER from scratch to improve our operational efficiency.",
  "I'm continuously exploring AI and modern tooling like Claude and Codex to enhance my debugging processes and infrastructure intuition."
];

export function ChatFullPage() {
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
  const rateLimiterRef = useRef(new RateLimiter(10, 60000));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    // --- FRONTEND GUARDRAILS ---
    const lengthCheck = validateMessageLength(input);
    if (!lengthCheck.valid) {
      const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
      const botMsg: Message = { id: (Date.now() + 1).toString(), text: lengthCheck.error || "Message invalid.", sender: 'ai', timestamp: new Date() };
      setMessages(prev => [...prev, userMsg, botMsg]);
      setInput('');
      return;
    }

    const secCheck = detectMaliciousInput(input);
    if (!secCheck.isSafe) {
      const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
      const botMsg: Message = { id: (Date.now() + 1).toString(), text: secCheck.roastResponse || "Malicious input detected.", sender: 'ai', timestamp: new Date() };
      setMessages(prev => [...prev, userMsg, botMsg]);
      setInput('');
      return;
    }

    const rlCheck = rateLimiterRef.current.attempt();
    if (!rlCheck.allowed) {
      const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
      const botMsg: Message = { id: (Date.now() + 1).toString(), text: "Whoa there, speedster! 🏎️ You're sending messages too fast. Take a breath and try again in a minute.", sender: 'ai', timestamp: new Date() };
      setMessages(prev => [...prev, userMsg, botMsg]);
      setInput('');
      return;
    }
    // ---------------------------

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
    
    trackEvent("chat_sent");

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

      let data;
      const isJson = response.headers.get('content-type')?.includes('application/json');
      if (isJson) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.answer || data?.message || 'API request failed');
      }
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data?.answer || "I'm sorry, I couldn't generate a response.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const isNetworkError = error.message === 'API request failed' || error.message.includes('Failed to fetch') || error.message.includes('not set');
      const textToDisplay = isNetworkError 
        ? "Error: Unable to connect to the terminal API. Please check if VITE_API_URL is set correctly in your .env file."
        : error.message;

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: textToDisplay,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#FFFDF9] text-black font-sans selection:bg-[#FFC900] selection:text-black overflow-hidden">
      {/* Header bar of chat */}
      <div className="bg-[#FFC900] border-b-4 border-black px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link 
            to="/" 
            className="bg-white border-2 border-black p-1.5 sm:p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all group shrink-0"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-black group-hover:-translate-x-1 transition-transform" />
          </Link>
          <h2 className="font-black text-lg sm:text-2xl uppercase tracking-wider sm:tracking-widest drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] sm:drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-white truncate">Chat_Terminal //</h2>
        </div>
        <div className="hidden sm:flex gap-3 shrink-0">
          <div className="w-5 h-5 rounded-full border-2 border-black bg-[#FF90E8] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
          <div className="w-5 h-5 rounded-full border-2 border-black bg-[#38BDF8] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
          <div className="w-5 h-5 rounded-full border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-12 space-y-6 sm:space-y-8 bg-[#FFFDF9]">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
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
                    className={`border-4 border-black px-4 py-3 sm:px-6 sm:py-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col ${
                      message.sender === 'user'
                        ? 'bg-[#38BDF8] text-black text-left'
                        : 'bg-white text-black'
                    }`}
                  >
                    <div className="text-base sm:text-xl font-bold leading-relaxed break-words">
                      {message.sender === 'user' ? (
                        <p>{message.text}</p>
                      ) : (
                        <ReactMarkdown
                          components={{
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-none space-y-3 mb-4 last:mb-0 pl-1" {...props} />,
                            li: ({node, ...props}) => (
                              <li className="flex gap-3 items-start">
                                <span className="text-[#FF90E8] mt-1.5 shrink-0 font-black">▹</span>
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
              <div className="max-w-[90%]">
                <p className="text-xs sm:text-sm font-black uppercase mb-1.5 sm:mb-2 bg-black text-white inline-block px-2 py-0.5 sm:px-3 sm:py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Assistant</p>
                <div className="bg-white border-4 border-black px-4 py-3 sm:px-6 sm:py-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex gap-2">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-4 h-4 bg-[#FF90E8] border-2 border-black"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-4 h-4 bg-[#38BDF8] border-2 border-black"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-4 h-4 bg-[#FFC900] border-2 border-black"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} className="h-8" />
        </div>
      </div>

      {/* Input */}
      <div className="border-t-4 border-black p-3 sm:p-8 bg-[#E5E5E5] shrink-0 z-10">
        <div className="max-w-4xl mx-auto flex gap-2 sm:gap-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me something..."
            className="flex-1 min-w-0 bg-white border-4 border-black px-4 py-3 sm:px-6 sm:py-5 text-black font-bold text-base sm:text-xl placeholder:text-neutral-500 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-[#FF90E8] px-5 sm:px-12 border-4 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] sm:active:translate-x-[6px] sm:active:translate-y-[6px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:disabled:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center group shrink-0"
          >
            <Send className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
