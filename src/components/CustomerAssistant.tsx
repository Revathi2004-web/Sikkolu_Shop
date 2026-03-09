import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const greetings: Record<string, string> = {
  en: "Hi! 👋 I'm your Sikkolu Specials assistant. Ask me about your orders or products!",
  te: "నమస్కారం! 👋 నేను సిక్కోలు స్పెషల్స్ అసిస్టెంట్. మీ ఆర్డర్లు లేదా ఉత్పత్తుల గురించి అడగండి!",
  hi: "नमस्ते! 👋 मैं सिक्कोलू स्पेशल्स असिस्टेंट हूँ। अपने ऑर्डर या उत्पादों के बारे में पूछें!",
};

const placeholders: Record<string, string> = {
  en: "Ask about your orders...",
  te: "మీ ఆర్డర్ల గురించి అడగండి...",
  hi: "अपने ऑर्डर के बारे में पूछें...",
};

const CustomerAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lang } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: greetings[lang] || greetings.en }]);
    }
  }, [open, lang]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const fetchOrders = useCallback(async () => {
    if (!user) return [];
    const { data } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at, customer_name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    return data || [];
  }, [user]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const orders = await fetchOrders();
      const chatHistory = newMessages.filter(m => m.role !== 'assistant' || newMessages.indexOf(m) > 0)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await supabase.functions.invoke('customer-assistant', {
        body: { messages: chatHistory, language: lang, orders },
      });

      if (response.error) throw response.error;
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'te' ? 'క్షమించండి, లోపం సంభవించింది.' : lang === 'hi' ? 'क्षमा करें, एक त्रुटि हुई।' : 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform touch-manipulation"
          aria-label="Chat assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-96 sm:bottom-5 sm:right-5 h-[70vh] sm:h-[500px] bg-background border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">Store Assistant</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Online
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-md">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholders[lang] || placeholders.en}
              className="flex-1 h-10 rounded-xl text-sm"
              disabled={loading}
            />
            <Button size="icon" className="w-10 h-10 rounded-xl shrink-0" onClick={sendMessage} disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerAssistant;
