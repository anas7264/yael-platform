'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatBubble } from '@/components/tutor/ChatBubble';
import { ChatInput } from '@/components/tutor/ChatInput';
import { SuggestedTopics } from '@/components/tutor/SuggestedTopics';
import { StreamingMessage } from '@/components/tutor/StreamingMessage';
import { Sparkles, PlusCircle, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingUserMsg, setStreamingUserMsg] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', title: 'جلسة اليوم', lastMessage: 'ابدأ محادثة جديدة', timestamp: new Date() }
  ]);
  const [activeConvId] = useState('1');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  const handleSend = useCallback((text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isStreaming) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    setStreamingUserMsg(content);

    // Update sidebar conversation title from first user message
    if (messages.length === 0) {
      setConversations(prev => prev.map(c =>
        c.id === activeConvId ? { ...c, title: content.slice(0, 40), lastMessage: content } : c
      ));
    }
  }, [input, isStreaming, messages.length, activeConvId]);

  const handleStreamComplete = useCallback((fullText: string) => {
    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: fullText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsStreaming(false);
    setStreamingUserMsg(null);
  }, []);

  const handleNewConversation = () => {
    setMessages([]);
    setIsStreaming(false);
    setStreamingUserMsg(null);
    setInput('');
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'محادثة جديدة',
      lastMessage: 'ابدأ محادثة جديدة',
      timestamp: new Date(),
    };
    setConversations(prev => [newConv, ...prev]);
    setIsSidebarOpen(false);
  };

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <div className="flex h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] gap-0 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
      {/* Sidebar Backdrop (mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-bg-primary/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 z-40 w-72 bg-bg-secondary border-l border-border-subtle flex flex-col transition-transform duration-300
        lg:static lg:translate-x-0 lg:z-auto lg:h-full
        ${isSidebarOpen ? 'translate-x-0 right-0' : 'translate-x-full right-0 lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-border-subtle flex items-center justify-between shrink-0">
          <h2 className="font-bold text-text-primary">المحادثات</h2>
          <button
            onClick={handleNewConversation}
            className="p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary hover:text-primary-500 transition-colors"
            title="محادثة جديدة"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              className={`w-full text-start p-3 rounded-xl transition-colors group ${
                conv.id === activeConvId
                  ? 'bg-primary-500/10 text-primary-600 border border-primary-500/20'
                  : 'hover:bg-bg-tertiary text-text-secondary'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
                <span className="text-sm font-bold truncate">{conv.title}</span>
              </div>
              <p className="text-xs text-text-tertiary truncate pr-6">{conv.lastMessage}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg-primary">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-secondary shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary lg:hidden"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-glow-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-text-primary leading-tight">المعلم الذكي</h1>
              <p className="text-xs text-text-tertiary">مساعدك الشخصي لتعلم العبرية</p>
            </div>
          </div>

          <button
            onClick={handleNewConversation}
            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-tertiary border border-border-subtle text-sm font-bold text-text-secondary hover:border-primary-500 hover:text-primary-600 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            محادثة جديدة
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <SuggestedTopics onSelect={(topic) => handleSend(topic)} />
          ) : (
            <div className="px-4 sm:px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ))}

              {/* Streaming AI response */}
              {isStreaming && streamingUserMsg && (
                <div className="flex w-full justify-start">
                  <div className="flex max-w-[85%] md:max-w-[75%] gap-3 items-end">
                    <div className="w-8 h-8 rounded-full shrink-0 bg-primary-500/20 text-primary-500 flex items-center justify-center mb-1 text-xs font-bold">
                      AI
                    </div>
                    <div>
                      <StreamingMessage
                        userMessage={streamingUserMsg}
                        onComplete={handleStreamComplete}
                      />
                      <p className="text-xs text-text-tertiary mt-1 text-start" dir="ltr">
                        {new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => handleSend()}
          isDisabled={isStreaming}
        />
      </div>
    </div>
  );
}
