import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { supabase, type ChatMessage, type Profile } from '../lib/supabase';
import { chatWithAI } from '../lib/gemini';
import { toast } from 'react-hot-toast';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setProfile(profile);
        } else {
          setShowNamePrompt(true);
        }
        loadChatHistory(user.id);
      }
    };
    getUser();
  }, []);

  const loadChatHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Failed to load chat history');
      return;
    }

    setMessages(data as ChatMessage[]);
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: userName.trim()
        });

      if (error) throw error;

      setProfile({
        id: userId,
        name: userName.trim(),
        created_at: new Date().toISOString()
      });
      setShowNamePrompt(false);
      
      // Add welcome message
      const welcomeMessage = `Hello ${userName.trim()}! I'm your plant care assistant. Feel free to ask me anything about plants, gardening, or plant care!`;
      const { error: chatError } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          content: welcomeMessage,
          role: 'assistant'
        });

      if (chatError) throw chatError;
      loadChatHistory(userId);
    } catch (error) {
      toast.error('Failed to save your name');
      console.error(error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      // Optimistically add user message to UI
      const userMessageObj = {
        id: crypto.randomUUID(),
        user_id: userId,
        content: userMessage,
        role: 'user' as const,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessageObj]);

      // Save user message to Supabase
      const { error: userError } = await supabase
        .from('chat_history')
        .insert(userMessageObj);

      if (userError) throw userError;

      // Get AI response
      const aiResponse = await chatWithAI(userMessage);

      // Create AI message object
      const aiMessageObj = {
        id: crypto.randomUUID(),
        user_id: userId,
        content: aiResponse,
        role: 'assistant' as const,
        created_at: new Date().toISOString()
      };

      // Save AI response to Supabase
      const { error: aiError } = await supabase
        .from('chat_history')
        .insert(aiMessageObj);

      if (aiError) throw aiError;

      // Update UI with AI response
      setMessages(prev => [...prev, aiMessageObj]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      // Remove the optimistically added message on error
      setMessages(prev => prev.filter(msg => msg.content !== userMessage));
    } finally {
      setLoading(false);
    }
  };

  if (showNamePrompt) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Bot className="w-8 h-8 text-emerald-500" />
            <h2 className="text-2xl font-semibold">Welcome to Plant Expert AI!</h2>
          </div>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Before we start, please tell me your name so I can provide a more personalized experience.
          </p>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Start Chatting
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-[600px] flex flex-col">
      <div className="p-4 bg-emerald-500 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Plant Expert AI</h2>
        </div>
        {profile && (
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span className="text-sm font-medium">{profile.name}</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-2 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              {message.content}
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about plant care, facts, or get gardening advice..."
            className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}