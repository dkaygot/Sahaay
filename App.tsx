
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
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col relative bg-[#fcfdfc]">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-100 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                <LifeBuoy size={18} />
              </div>
              <h2 className="font-semibold text-gray-800">Relief Support AI</h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">Live</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {coords ? (
              <div className="flex items-center text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <div className="relative flex mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <MapPin size={14} className="relative inline-flex" />
                </div>
                GPS Active
              </div>
            ) : (
              <div className="flex items-center text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <Navigation size={14} className="mr-1.5 text-gray-400" />
                Locating...
              </div>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar scroll-smooth"
        >
          <div className="max-w-4xl mx-auto px-2">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="flex items-center bg-white border border-green-50 p-4 rounded-2xl shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="ml-3 text-xs text-gray-400 font-medium italic">Searching map resources...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Suggested Actions */}
        {messages.length < 20 && !isLoading && (
          <div className="px-4 pb-4 overflow-x-auto no-scrollbar">
            <div className="max-w-4xl mx-auto flex gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(q)}
                  className="whitespace-nowrap bg-white border border-green-100 hover:border-green-300 text-green-700 text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all hover:bg-green-50 active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3">
            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all p-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Describe your emergency or search for help..."
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-700 p-3 min-h-[50px] max-h-[150px] resize-none"
                rows={1}
              />
              <div className="flex items-center justify-between px-2 pb-1 text-gray-400">
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-800 rounded text-[10px] font-medium">
                    <MapPin size={10} />
                    Maps Integration Active
                  </div>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg ${
                !input.trim() || isLoading 
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700 active:scale-90 shadow-green-200'
              }`}
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-3">
            Sahaay AI uses localized data. For immediate medical emergencies, please dial <b>112</b>.
          </p>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
              <div className="flex justify-end p-4">
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400">
                  <X size={24} />
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
