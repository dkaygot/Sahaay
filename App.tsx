
import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { sendMessageToGemini } from './services/geminiService';
import { Message, Role } from './types';
import { Send, Menu, X, Volume2, LifeBuoy, MapPin, Navigation } from 'lucide-react';

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: Role.MODEL,
  content: "Namaste. I am Sahaay's Relief Support AI. I've automatically detected your location to help you find the closest shelters and aid points faster. \n\nHow can I help you today?",
  timestamp: new Date(),
};

const SUGGESTED_QUESTIONS = [
  "Where are relief camps near me?",
  "Safety tips for current situation",
  "Is there a flood risk here?",
  "Nearby emergency hospitals"
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation permission denied or unavailable:", error.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(messages, input, coords || undefined);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex h-screen h-[100dvh] bg-gray-50 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col relative bg-[#fcfdfc] w-full">
        {/* Header */}
        <header className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-gray-100 z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg active:bg-gray-100"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                <LifeBuoy size={16} className="sm:size-[18px]" />
              </div>
              <h2 className="font-bold text-gray-800 text-sm sm:text-base whitespace-nowrap">Sahaay AI</h2>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold bg-green-100 text-green-700 uppercase">Live</span>
            </div>
          </div>
          
          <div className="flex items-center">
            {coords ? (
              <div className="flex items-center text-[10px] sm:text-xs text-green-700 bg-green-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-green-100">
                <div className="relative flex mr-1.5 sm:mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <MapPin size={12} className="relative inline-flex sm:size-[14px]" />
                </div>
                GPS
              </div>
            ) : (
              <div className="flex items-center text-[10px] sm:text-xs text-gray-400 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-100">
                <Navigation size={12} className="mr-1 sm:mr-1.5 text-gray-400 sm:size-[14px]" />
                <span className="hidden xs:inline">Locating...</span>
                <span className="xs:hidden">...</span>
              </div>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3 sm:px-4 py-6 sm:py-8 custom-scrollbar scroll-smooth"
        >
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="flex items-center bg-white border border-green-50 p-3 sm:p-4 rounded-2xl shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="ml-3 text-[10px] sm:text-xs text-gray-400 font-medium italic">Searching map resources...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Suggested Actions */}
        {messages.length < 20 && !isLoading && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 overflow-x-auto no-scrollbar shrink-0">
            <div className="max-w-3xl mx-auto flex gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(q)}
                  className="whitespace-nowrap bg-white border border-green-100 hover:border-green-300 text-green-700 text-[11px] sm:text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-sm transition-all hover:bg-green-50 active:scale-95 active:bg-green-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] shrink-0 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-end gap-2 sm:gap-3">
            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all p-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 640) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask for help or search..."
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-700 px-3 py-2.5 min-h-[44px] max-h-[120px] resize-none"
                rows={1}
              />
              <div className="flex items-center justify-between px-2 pb-1.5 text-gray-400">
                <div className="flex gap-1">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-800 rounded text-[9px] font-bold border border-green-100">
                    <MapPin size={10} />
                    MAPS ACTIVE
                  </div>
                </div>
                <div className="sm:hidden">
                   <button type="button" className="p-1 text-gray-400 active:text-green-600">
                      <Volume2 size={14} />
                   </button>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg ${
                !input.trim() || isLoading 
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700 active:scale-90 shadow-green-100'
              }`}
            >
              <Send size={18} className="sm:size-[20px]" />
            </button>
          </form>
          <p className="text-[9px] sm:text-[10px] text-center text-gray-400 mt-3 px-2">
            Stay safe. For medical emergencies dial <b>112</b>.
          </p>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
            <div className="absolute left-0 top-0 bottom-0 w-64 xs:w-72 bg-white shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-left duration-300">
              <div className="flex justify-end p-2 shrink-0">
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-full active:bg-gray-200"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
