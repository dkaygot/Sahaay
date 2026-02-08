
import React, { useState } from 'react';
import { Message, Role } from '../types';
import { User, Bot, ExternalLink, MapPin, ChevronDown, ChevronUp, Globe } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  userCoords?: { latitude: number; longitude: number } | null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const [isMapExpanded, setIsMapExpanded] = useState(true);

  // Use the first map chunk to generate a focused embedded map view
  const primaryLocation = message.mapChunks && message.mapChunks.length > 0 
    ? message.mapChunks[0] 
    : null;

  const mapQuery = primaryLocation ? encodeURIComponent(primaryLocation.title) : null;

  return (
    <div className={`flex w-full mb-5 sm:mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex w-full max-w-[92%] sm:max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-sm ${
          isUser ? 'bg-green-600 text-white ml-2 sm:ml-3' : 'bg-white border border-green-100 text-green-700 mr-2 sm:mr-3'
        }`}>
          {isUser ? <User size={16} className="sm:size-[20px]" /> : <Bot size={16} className="sm:size-[20px]" />}
        </div>
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full overflow-hidden`}>
          <div className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-sm text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser 
              ? 'bg-green-600 text-white rounded-tr-none' 
              : 'bg-white text-gray-800 border border-green-50/50 rounded-tl-none'
          }`}>
            {message.content}
            
            {/* Embedded Map Visualization for the First Result */}
            {mapQuery && !isUser && (
              <div className="mt-3.5 sm:mt-4 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 -mx-1 sm:mx-0">
                <button 
                  onClick={() => setIsMapExpanded(!isMapExpanded)}
                  className="w-full flex items-center justify-between px-3 py-2.5 sm:py-2 bg-gray-100/50 hover:bg-gray-100 transition-colors text-[10px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-tight active:bg-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <Globe size={12} className="text-blue-500" />
                    Map: {primaryLocation?.title}
                  </div>
                  {isMapExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                
                {isMapExpanded && (
                  <div className="w-full h-44 sm:h-64 relative bg-gray-200">
                    <iframe
                      title="Primary Relief Location Map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                  </div>
                )}
              </div>
            )}

            {/* List of Navigation Buttons for all found locations */}
            {message.mapChunks && message.mapChunks.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2.5 flex items-center gap-1.5">
                  <MapPin size={11} className="text-red-500" />
                  Nearby Resources
                </p>
                <div className="flex flex-col gap-2">
                  {message.mapChunks.map((chunk, i) => (
                    <a 
                      key={i} 
                      href={chunk.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-[11px] sm:text-xs bg-white hover:bg-red-50 text-gray-700 p-2.5 sm:p-3 rounded-xl border border-gray-100 hover:border-red-200 transition-all group shadow-sm active:scale-[0.98]"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-bold truncate text-gray-800">{chunk.title}</span>
                        <span className="text-[9px] text-gray-400">Open in Maps</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 font-bold uppercase text-[9px] text-red-600 bg-red-50 px-2 py-1.5 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                        GO
                        <ExternalLink size={10} />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Sources</p>
                <div className="flex flex-wrap gap-1.5">
                  {message.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[10px] bg-gray-50 hover:bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 transition-colors active:bg-green-100"
                    >
                      <span className="truncate max-w-[120px] sm:max-w-[150px]">{source.title}</span>
                      <ExternalLink size={10} className="ml-1" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] text-gray-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
