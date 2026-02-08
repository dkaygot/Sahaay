
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
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full shadow-sm ${
          isUser ? 'bg-green-600 text-white ml-3' : 'bg-white border border-green-100 text-green-700 mr-3'
        }`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
            isUser 
              ? 'bg-green-600 text-white rounded-tr-none' 
              : 'bg-white text-gray-800 border border-green-50/50 rounded-tl-none'
          }`}>
            {message.content}
            
            {/* Embedded Map Visualization for the First Result */}
            {mapQuery && !isUser && (
              <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                <button 
                  onClick={() => setIsMapExpanded(!isMapExpanded)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-100/50 hover:bg-gray-100 transition-colors text-[11px] font-bold text-gray-600 uppercase tracking-tight"
                >
                  <div className="flex items-center gap-2">
                    <Globe size={12} className="text-blue-500" />
                    Map View: {primaryLocation?.title}
                  </div>
                  {isMapExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                
                {isMapExpanded && (
                  <div className="w-full h-48 sm:h-64 relative bg-gray-200">
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
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center gap-1">
                  <MapPin size={10} className="text-red-500" />
                  Relief Center Locations
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {message.mapChunks.map((chunk, i) => (
                    <a 
                      key={i} 
                      href={chunk.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-xs bg-white hover:bg-red-50 text-gray-700 p-3 rounded-xl border border-gray-100 hover:border-red-200 transition-all group shadow-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold truncate max-w-[180px] sm:max-w-[240px]">{chunk.title}</span>
                        <span className="text-[9px] text-gray-400">Open in Maps App</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold uppercase text-[9px] text-red-600 bg-red-50 px-2 py-1 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                        Maps
                        <ExternalLink size={10} />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Web Resources</p>
                <div className="flex flex-wrap gap-2">
                  {message.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[10px] bg-gray-50 hover:bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 transition-colors"
                    >
                      <span className="truncate max-w-[150px]">{source.title}</span>
                      <ExternalLink size={10} className="ml-1" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
