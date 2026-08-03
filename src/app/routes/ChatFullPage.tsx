import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { trackEvent } from '../../utils/analytics';
import { SafeMarkdown } from '../../components/SafeMarkdown';
import {
  askChat,
  buildConversationHistory,
  ChatApiError,
  CHAT_UNAVAILABLE_MESSAGE,
  MAX_QUESTION_LENGTH,
} from '../../utils/chatApi';
import { fireConfetti } from '../../utils/confetti';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

function makeMessage(text: string, sender: 'user' | 'ai'): Message {
  return {
    id: `${Date.now()}-${sender}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    sender,
    timestamp: new Date(),
  };
}

export function ChatFullPage() {
  const [messages, setMessages] = useState<Message[]>([
    makeMessage(
      'Hi! Ask me anything about my work, experience, or approach to building software.',
      'ai'
    ),
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    // Easter egg: sudo hire dhruv
    if (trimmed.toLowerCase() === 'sudo hire dhruv') {
      setMessages((prev) => [
        ...prev,
        makeMessage(trimmed, 'user'),
        makeMessage(
          'Permission granted. 🎉\n\n**Hiring initiated.**\n\nOffer letter dispatched to bhagatkardhruv2003@gmail.com.\nCompensation: one portfolio visit and a GitHub star.\n\nDownloading resume for onboarding...',
          'ai'
        ),
      ]);
      setInput('');
      fireConfetti();
      trackEvent('easter_egg', { egg: 'sudo_hire_dhruv' });
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = '/Dhruv_Bhagatkar_Resume.pdf';
        a.download = 'Dhruv_Bhagatkar_Resume.pdf';
        a.click();
      }, 1500);
      return;
    }

    const userMessage = makeMessage(trimmed, 'user');
    const history = buildConversationHistory(messages);

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    trackEvent('chat_sent');

    try {
      const { answer } = await askChat({
        question: userMessage.text,
        tone: 'professional',
        conversationHistory: history,
      });
      setMessages((prev) => [...prev, makeMessage(answer, 'ai')]);
    } catch (error) {
      const text =
        error instanceof ChatApiError ? error.message : CHAT_UNAVAILABLE_MESSAGE;
      setMessages((prev) => [...prev, makeMessage(text, 'ai')]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#FFFDF9] text-black font-sans selection:bg-[#FFC900] selection:text-black overflow-hidden">
      <div className="bg-[#FFC900] border-b-4 border-black px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            to="/"
            className="bg-white border-2 border-black p-1.5 sm:p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all group shrink-0"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-black group-hover:-translate-x-1 transition-transform" />
          </Link>
          <h2 className="font-black text-lg sm:text-2xl uppercase tracking-wider sm:tracking-widest drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] sm:drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-white truncate">
            Chat_Terminal //
          </h2>
        </div>
        <div className="hidden sm:flex gap-3 shrink-0">
          <div className="w-5 h-5 rounded-full border-2 border-black bg-[#FF90E8] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
          <div className="w-5 h-5 rounded-full border-2 border-black bg-[#38BDF8] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
          <div className="w-5 h-5 rounded-full border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
        </div>
      </div>

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
                <div
                  className={`max-w-[90%] sm:max-w-[75%] ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <p className="text-xs sm:text-sm font-black uppercase mb-1.5 sm:mb-2 bg-black text-white inline-block px-2 py-0.5 sm:px-3 sm:py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      Assistant
                    </p>
                  )}
                  {message.sender === 'user' && (
                    <p className="text-xs sm:text-sm font-black uppercase mb-1.5 sm:mb-2 bg-black text-white inline-block px-2 py-0.5 sm:px-3 sm:py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      You
                    </p>
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
                        <SafeMarkdown>{message.text}</SafeMarkdown>
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
                <p className="text-xs sm:text-sm font-black uppercase mb-1.5 sm:mb-2 bg-black text-white inline-block px-2 py-0.5 sm:px-3 sm:py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Assistant
                </p>
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

      <div className="border-t-4 border-black p-3 sm:p-8 bg-[#E5E5E5] shrink-0 z-10">
        <div className="max-w-4xl mx-auto flex gap-2 sm:gap-6">
          <input
            type="text"
            value={input}
            maxLength={MAX_QUESTION_LENGTH}
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
