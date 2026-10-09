import React, { useState } from 'react';
import { Calendar, User, MessageSquareQuote, Check } from 'lucide-react';
import { ActionItem, Urgency, useAppStore } from '../store/appStore';

interface ActionItemCardProps {
  item: ActionItem;
}

const urgencyConfig: Record<Urgency, { class: string; label: string }> = {
  critical: { class: 'badge-critical', label: 'Critical' },
  high: { class: 'badge-high', label: 'High' },
  medium: { class: 'badge-medium', label: 'Medium' },
  low: { class: 'badge-low', label: 'Low' },
};

const ActionItemCard: React.FC<ActionItemCardProps> = ({ item }) => {
  const { updateActionItemStatus, conversations } = useAppStore();
  const [showSource, setShowSource] = useState(false);
  const isCompleted = item.status === 'completed';

  // Find the original message
  const conversation = conversations.find(c => c.id === item.conversationId);
  const sourceMessage = conversation?.messages?.find(m => m.id === item.sourceMessageId);

  const toggleStatus = () => {
    updateActionItemStatus(item.id, isCompleted ? 'pending' : 'completed');
  };

  return (
    <div className={`p-4 rounded-lg border transition-all ${
      isCompleted 
        ? 'bg-[#1a1a2e]/50 border-white/5 opacity-60' 
        : 'bg-[#1a1a2e] border-white/10 hover:border-white/20 hover:shadow-lg shadow-black/20'
    }`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button 
          onClick={toggleStatus}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
            isCompleted 
              ? 'bg-[#22c55e] border-[#22c55e] text-white' 
              : 'border-white/30 bg-black/20 hover:border-[#6366f1]'
          }`}
        >
          {isCompleted && <Check size={14} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className={`text-sm leading-relaxed font-medium ${isCompleted ? 'line-through text-white/50' : 'text-white/90'}`}>
              {item.description}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={urgencyConfig[item.urgency].class}>
                {urgencyConfig[item.urgency].label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-white/50">
            {item.assignee && (
              <div className="flex items-center gap-1.5 bg-[#16213e] px-2 py-1 rounded-md">
                <User size={12} className="text-[#818cf8]" />
                <span className="font-medium text-white/70">{item.assignee}</span>
              </div>
            )}
            
            {item.deadline && (
              <div className="flex items-center gap-1.5 bg-[#16213e] px-2 py-1 rounded-md">
                <Calendar size={12} className="text-[#f59e0b]" />
                <span className="font-medium text-white/70">{item.deadline}</span>
              </div>
            )}

            {sourceMessage && (
              <button 
                onClick={() => setShowSource(!showSource)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ml-auto border ${
                  showSource ? 'bg-[#6366f1]/20 border-[#6366f1]/30 text-[#818cf8]' : 'bg-transparent border-transparent hover:text-[#818cf8] hover:bg-white/5'
                }`}
              >
                <MessageSquareQuote size={12} /> {showSource ? 'Hide Context' : 'Show Source'}
              </button>
            )}
          </div>
          
          {/* Source Message Snippet */}
          {showSource && sourceMessage && (
            <div className="mt-4 p-3 bg-[#0f0f23] rounded border border-white/5 border-l-2 border-l-[#6366f1] animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#818cf8]">{sourceMessage.sender}</span>
                <span className="text-[10px] text-white/30">
                  {sourceMessage.timestamp ? new Date(sourceMessage.timestamp).toLocaleString() : ''}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed italic whitespace-pre-wrap">"{sourceMessage.content}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionItemCard;
