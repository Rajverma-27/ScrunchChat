import React from 'react';
import { useAppStore } from '../store/appStore';
import { MessageSquare, Zap, Clock, ArrowRight, Play, BrainCircuit } from 'lucide-react';
import ActionItemCard from './ActionItemCard';

const ConversationView: React.FC = () => {
  const { 
    conversations, 
    selectedConversationId, 
    processConversation, 
    activeTab, 
    setActiveTab,
    selectConversation 
  } = useAppStore();

  const conversation = conversations.find(c => c.id === selectedConversationId);
  const isGlobal = !conversation;

  const tabs = [
    { id: 'conversations', label: 'Total Conversations', icon: MessageSquare, count: conversations.length },
    { id: 'pending-actions', label: 'Pending Actions', icon: Zap, count: conversations.flatMap(c => c.actionItems).filter(a => a.status === 'pending').length },
    { id: 'upcoming-deadlines', label: 'Upcoming Deadlines', icon: Clock, count: conversations.flatMap(c => c.actionItems).filter(a => a.status === 'pending' && a.deadline).length },
  ];

  if (!isGlobal) {
    tabs.push({ id: 'summary', label: 'AI Summary', icon: BrainCircuit, count: 0 });
    tabs.push({ id: 'messages', label: 'Messages', icon: MessageSquare, count: conversation.messageCount });
  }

  const getActionItems = () => {
    if (isGlobal) {
      return conversations.flatMap(c => c.actionItems).filter(a => a.status === 'pending');
    }
    return conversation.actionItems.filter(a => a.status === 'pending');
  };

  const getDeadlines = () => {
    if (isGlobal) {
      return conversations.flatMap(c => c.actionItems).filter(a => a.status === 'pending' && a.deadline);
    }
    return conversation.actionItems.filter(a => a.status === 'pending' && a.deadline);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-[#16213e]/50 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">
              {isGlobal ? 'Global Overview' : conversation.name}
            </h1>
            {!isGlobal && (
              <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white/60 capitalize font-medium">
                {conversation.platform}
              </span>
            )}
            {!isGlobal && conversation.isUnprocessed && (
              <span className="px-2.5 py-1 bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#f59e0b] rounded-md text-xs font-medium flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse"></div>
                Unprocessed
              </span>
            )}
          </div>
          <p className="text-sm text-[#94a3b8]">
            {isGlobal 
              ? 'Viewing all imported chats and tasks across the app.' 
              : `Last active: ${conversation.lastActivity} • ${conversation.messageCount} messages`}
          </p>
        </div>
        
        {!isGlobal && (
          conversation.isUnprocessed ? (
            <button onClick={() => processConversation(conversation.id)} className="btn-primary">
              <Play size={16} /> Process with AI
            </button>
          ) : (
            <button onClick={() => processConversation(conversation.id)} className="btn-secondary">
              <BrainCircuit size={16} /> Reprocess
            </button>
          )
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 px-6 gap-6 bg-[#16213e]/30 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-4 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-[#6366f1] text-white' 
                : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'
            }`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'text-[#818cf8]' : ''} />
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-[#6366f1]/20 text-[#818cf8]' : 'bg-white/5'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#0f0f23]">
        {!isGlobal && conversation.isUnprocessed && activeTab !== 'messages' ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-[#1a1a2e] rounded-2xl flex items-center justify-center border border-white/10 mb-2">
              <BrainCircuit size={32} className="text-[#6366f1]" />
            </div>
            <h3 className="text-xl font-semibold text-white">AI Processing Required</h3>
            <p className="text-[#94a3b8] text-sm">
              This conversation hasn't been analyzed yet. Process it to extract action items and deadlines.
            </p>
            <button onClick={() => processConversation(conversation.id)} className="btn-primary mt-4 w-full">
              Start Processing
            </button>
          </div>
        ) : (
          <div className="animate-slide-up h-full">
            {activeTab === 'conversations' && (
              <div className="space-y-3 max-w-4xl mx-auto">
                {conversations.map(conv => (
                  <div 
                    key={conv.id} 
                    onClick={() => selectConversation(conv.id)} 
                    className="card p-5 cursor-pointer hover:border-[#6366f1] transition-all hover:bg-[#1a1a2e] flex justify-between items-center group"
                  >
                     <div>
                       <div className="flex items-center gap-3 mb-1">
                         <h3 className="font-semibold text-lg text-white group-hover:text-[#818cf8] transition-colors">{conv.name}</h3>
                         {conv.isUnprocessed && (
                           <span className="px-2 py-0.5 bg-[#f59e0b]/20 text-[#f59e0b] text-xs rounded-full font-medium">Unprocessed</span>
                         )}
                       </div>
                       <p className="text-sm text-[#94a3b8]">
                         <span className="capitalize">{conv.platform}</span> • {conv.messageCount} messages • Last active: {conv.lastActivity}
                       </p>
                     </div>
                     <ArrowRight className="text-white/20 group-hover:text-[#818cf8] transition-colors" />
                  </div>
                ))}
                {conversations.length === 0 && <p className="text-white/40 text-center py-10">No conversations imported yet.</p>}
              </div>
            )}

            {activeTab === 'pending-actions' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-w-5xl mx-auto items-start content-start">
                {getActionItems().map(item => <ActionItemCard key={item.id} item={item} />)}
                {getActionItems().length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/40">
                    <Zap size={48} className="mb-4 opacity-50" />
                    <p>No pending actions found here.</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'upcoming-deadlines' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-w-5xl mx-auto items-start content-start">
                {getDeadlines().map(item => <ActionItemCard key={item.id} item={item} />)}
                {getDeadlines().length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/40">
                    <Clock size={48} className="mb-4 opacity-50" />
                    <p>No upcoming deadlines found here.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'summary' && !isGlobal && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="card p-6 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-[#6366f1]/20">
                   <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                     <BrainCircuit className="text-[#6366f1]" /> Quick Summary
                   </h3>
                   <p className="text-[#e2e8f0] leading-relaxed text-lg">
                     {conversation.summary || "No summary available. Please process the conversation with AI first."}
                   </p>
                </div>
                
                {conversation.detailedSummary && (
                  <div className="card p-6">
                     <h3 className="text-lg font-semibold text-white mb-3">Detailed Notes</h3>
                     <p className="text-[#94a3b8] leading-relaxed whitespace-pre-wrap">
                       {conversation.detailedSummary}
                     </p>
                  </div>
                )}

                {conversation.topics && conversation.topics.length > 0 && (
                  <div className="card p-6">
                     <h3 className="text-lg font-semibold text-white mb-4">Key Topics Discussed</h3>
                     <div className="flex flex-wrap gap-2">
                       {conversation.topics.map((t: string, i: number) => (
                         <span key={i} className="px-3 py-1 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-full text-sm text-[#818cf8]">
                           {t}
                         </span>
                       ))}
                     </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messages' && !isGlobal && (
              <div className="space-y-1 max-w-4xl mx-auto">
                {(conversation.messages ?? []).map((msg: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 py-3 px-4 rounded-lg hover:bg-white/[0.02] transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#c084fc] flex items-center justify-center shrink-0 text-white text-xs font-bold">
                      {(msg.sender || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="font-semibold text-sm text-white">{msg.sender}</span>
                        <span className="text-[10px] text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationView;
