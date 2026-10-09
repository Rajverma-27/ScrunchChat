import React, { useState } from 'react';
import { Search, Upload, MessageSquare, Settings as SettingsIcon, Home, Zap, Clock, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import ImportModal from './ImportModal';

const Sidebar: React.FC = () => {
  const { conversations, selectedConversationId, selectConversation, setView, currentView, searchQuery, setSearchQuery } = useAppStore();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Stats calculation
  const totalActionItems = conversations.reduce((acc, conv) => acc + conv.actionItems.filter(i => i.status === 'pending').length, 0);

  return (
    <div className="w-72 bg-[#1a1a2e] border-r border-white/5 flex flex-col h-full animate-fade-in relative z-50">
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f0f23] border border-white/5 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6366f1] transition-all placeholder:text-white/30 text-white/90"
          />
        </div>
        
        <button 
          onClick={() => setIsImportModalOpen(true)}
          className="w-full btn-primary text-sm shadow-lg shadow-[#6366f1]/20"
        >
          <Upload size={16} />
          <span>Import Chat</span>
        </button>
      </div>
      
      <div className="px-2 py-2 flex flex-col gap-1">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'bg-[#6366f1]/10 text-[#818cf8]' : 'text-white/60 hover:bg-white/5 hover:text-white/90'}`}
        >
          <Home size={18} />
          Dashboard
        </button>
        <button 
          onClick={() => setView('settings')}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'settings' ? 'bg-[#6366f1]/10 text-[#818cf8]' : 'text-white/60 hover:bg-white/5 hover:text-white/90'}`}
        >
          <SettingsIcon size={18} />
          Settings
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="px-3 pb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
          Conversations
        </div>
        
        <div className="flex flex-col gap-1">
          {conversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`flex flex-col gap-1 p-3 rounded-md text-left transition-all ${
                selectedConversationId === conv.id 
                  ? 'bg-[#16213e] border border-white/10 shadow-md' 
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium truncate pr-2 ${selectedConversationId === conv.id ? 'text-[#818cf8]' : 'text-white/90'}`}>
                  {conv.name}
                </span>
                {conv.isUnprocessed && (
                  <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse"></div>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-white/40">
                <span className="capitalize">{conv.platform}</span>
                <span>{conv.lastActivity}</span>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-white/40 flex flex-col items-center gap-2">
              <MessageSquare size={24} className="opacity-50" />
              <p>No conversations yet</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-[#16213e] border-t border-white/5">
        <div className="flex justify-between items-center text-xs text-white/60">
          <div className="flex items-center gap-1.5" title="Total Chats">
            <MessageSquare size={14} className="text-[#6366f1]" />
            <span>{conversations.length}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Pending Action Items">
            <Zap size={14} className="text-[#f59e0b]" />
            <span>{totalActionItems}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Upcoming Deadlines">
            <Clock size={14} className="text-[#ef4444]" />
            <span>0</span>
          </div>
        </div>
      </div>
      
      {isImportModalOpen && <ImportModal onClose={() => setIsImportModalOpen(false)} />}
    </div>
  );
};

export default Sidebar;
