import React from 'react';
import { MessageSquare, Minus, Maximize2, X } from 'lucide-react';

const Titlebar: React.FC = () => {
  return (
    <div className="h-10 bg-[#1a1a2e] flex items-center justify-between border-b border-white/5 drag-region select-none">
      <div className="flex items-center gap-2 px-4 no-drag-region">
        <MessageSquare size={16} className="text-[#6366f1]" />
        <span className="text-sm font-semibold tracking-wide text-white/90">Scrunch Chat</span>
      </div>
      
      <div className="flex-1" />
      
      <div className="flex h-full no-drag-region">
        <button className="h-full px-4 hover:bg-white/10 transition-colors flex items-center justify-center text-white/60 hover:text-white">
          <Minus size={16} />
        </button>
        <button className="h-full px-4 hover:bg-white/10 transition-colors flex items-center justify-center text-white/60 hover:text-white">
          <Maximize2 size={14} />
        </button>
        <button className="h-full px-4 hover:bg-red-500 transition-colors flex items-center justify-center text-white/60 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Titlebar;
