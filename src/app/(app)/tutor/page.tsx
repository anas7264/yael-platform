'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'مرحباً! أنا المعلم الذكي. كيف يمكنني مساعدتك في تعلم العبرية اليوم؟',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Dummy Groq response placeholder
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'هذا رد تجريبي من المعلم الذكي. سيتم ربط Groq API لاحقاً.',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-glow-primary">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">المعلم الذكي</h1>
          <p className="text-sm text-text-tertiary">مساعدك الشخصي لتعلم العبرية بذكاء اصطناعي</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden border-border-subtle bg-bg-secondary/50 relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
              >
                <div className={cn('flex max-w-[85%] md:max-w-[75%] gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1',
                      isUser ? 'bg-bg-tertiary text-text-secondary' : 'bg-primary-500/20 text-primary-500'
                    )}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                  <div
                    className={cn(
                      'p-4 rounded-2xl',
                      isUser
                        ? 'bg-primary-500 text-white rounded-tl-sm'
                        : 'bg-bg-tertiary text-text-primary rounded-tr-sm'
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[85%] gap-3 flex-row">
                <div className="w-8 h-8 rounded-full shrink-0 bg-primary-500/20 text-primary-500 flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl rounded-tr-sm bg-bg-tertiary text-text-primary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border-subtle bg-bg-secondary shrink-0">
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                placeholder="اسأل المعلم الذكي..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="h-12 bg-bg-primary"
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-12 px-6"
              rightIcon={<Send className="w-4 h-4 rtl-flip" />}
            >
              <span className="hidden sm:inline">إرسال</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
