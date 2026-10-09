import React from 'react';
import { Zap, MessageSquare, Clock } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Dashboard: React.FC = () => {
  const { conversations, userSettings, setView, setActiveTab, selectConversation } = useAppStore();

  const allActionItems = conversations.flatMap(c => c.actionItems).filter(item => item.status === 'pending');
  const deadlines = allActionItems.filter(i => i.deadline);

  const openGlobalView = (tab: 'conversations' | 'pending-actions' | 'upcoming-deadlines') => {
    selectConversation(null);
    setView('conversation');
    setActiveTab(tab);
  };

  return (
    <div className="h-full animate-slide-up flex flex-col max-w-5xl mx-auto justify-center">
      <div className="flex flex-col gap-2 mb-12 text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-3">
          Welcome back, {userSettings.displayName} <span className="text-3xl">👋</span>
        </h1>
        <p className="text-[#94a3b8] text-lg">What would you like to review today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Conversations Button */}
        <button 
          onClick={() => openGlobalView('conversations')}
          className="card p-8 hover:bg-[#1a1a2e] hover:border-[#6366f1] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all group flex flex-col items-center text-center gap-4"
        >
          <div className="p-4 bg-[#6366f1]/10 rounded-2xl group-hover:bg-[#6366f1]/20 group-hover:scale-110 transition-all">
            <MessageSquare className="text-[#818cf8]" size={36} />
          </div>
          <div>
            <span className="text-4xl font-bold text-white block mb-1">{conversations.length}</span>
            <h3 className="text-lg font-medium text-[#94a3b8] group-hover:text-white transition-colors">Total Conversations</h3>
          </div>
        </button>
        
        {/* Pending Actions Button */}
        <button 
          onClick={() => openGlobalView('pending-actions')}
          className="card p-8 hover:bg-[#1a1a2e] hover:border-[#f59e0b] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all group flex flex-col items-center text-center gap-4"
        >
          <div className="p-4 bg-[#f59e0b]/10 rounded-2xl group-hover:bg-[#f59e0b]/20 group-hover:scale-110 transition-all">
            <Zap className="text-[#f59e0b]" size={36} />
          </div>
          <div>
            <span className="text-4xl font-bold text-white block mb-1">{allActionItems.length}</span>
            <h3 className="text-lg font-medium text-[#94a3b8] group-hover:text-white transition-colors">Pending Actions</h3>
          </div>
        </button>

        {/* Upcoming Deadlines Button */}
        <button 
          onClick={() => openGlobalView('upcoming-deadlines')}
          className="card p-8 hover:bg-[#1a1a2e] hover:border-[#ef4444] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all group flex flex-col items-center text-center gap-4"
        >
          <div className="p-4 bg-[#ef4444]/10 rounded-2xl group-hover:bg-[#ef4444]/20 group-hover:scale-110 transition-all">
            <Clock className="text-[#ef4444]" size={36} />
          </div>
          <div>
            <span className="text-4xl font-bold text-white block mb-1">
              {deadlines.length}
            </span>
            <h3 className="text-lg font-medium text-[#94a3b8] group-hover:text-white transition-colors">Upcoming Deadlines</h3>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
