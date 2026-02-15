import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Hello! I am your MediGuard AI assistant. I can help you understand your medical history, analyze reports, or answer health-related questions. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          patient_context: {} // Backend will fetch real context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = {
          role: 'bot',
          content: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Failed to get response from AI');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'bot',
        content: 'I am sorry, I am having trouble connecting to the backend right now. Please try again later.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-green bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="text-primary" />
            MediGuard AI Assistant
          </h1>
          <p className="text-gray-600">Personalized health insights based on your medical records</p>
        </div>
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white rounded-2xl shadow-card border border-gray-100 mb-4 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === 'user' ? 'bg-primary text-white' : 'bg-accent/10 text-primary'
                  }`}>
                    {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div>
                    <div className={`p-4 rounded-2xl ${
                      message.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className={`text-[10px] mt-1 text-gray-400 font-medium ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3 items-center text-gray-400 italic text-sm">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary" size={20} />
                </div>
                MediGuard AI is thinking...
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your reports, blood group, or health concerns..."
              className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                !input.trim() || isLoading 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-primary hover:bg-primary/10'
              }`}
            >
              <Send size={24} />
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-400 mt-2">
            MediGuard AI provides helpful insights but should not replace professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
