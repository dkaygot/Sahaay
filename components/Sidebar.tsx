
import React from 'react';
import { MessageSquare } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">Sahaay</h1>
            <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Empowering India</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] uppercase font-bold text-gray-400 px-3 mb-2">Active Service</p>
        <div
          className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl bg-green-50 text-green-700 font-semibold ring-1 ring-green-100"
        >
          <div className="p-1.5 rounded-lg bg-green-100 text-green-600">
            <MessageSquare size={18} />
          </div>
          <span className="text-sm">Support Chat</span>
        </div>
      </nav>

      <div className="p-4 bg-gray-50 m-4 rounded-2xl">
        <h4 className="text-xs font-bold text-gray-700 mb-1">Stay Prepared</h4>
        <p className="text-[10px] text-gray-500">Keep your phone charged and listen to local radio bulletins for real-time updates from official sources.</p>
      </div>
    </aside>
  );
};
