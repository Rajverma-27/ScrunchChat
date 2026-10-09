import { create } from 'zustand';
import { repository } from '../../core/storage/repository';
import { detectFormat, parsePlainText, parseWhatsAppExport, parseSlackExport, parseDiscordExport, parseTeamsExport, parseGenericCSV, generateId } from '../../core/storage/importers';

export type Urgency = 'critical' | 'high' | 'medium' | 'low';
export type ViewState = 'dashboard' | 'conversation' | 'settings';
export type TabState = 'conversations' | 'pending-actions' | 'upcoming-deadlines' | 'messages' | 'summary';

export interface ActionItem {
  id: string;
  conversationId: string;
  description: string;
  urgency: Urgency;
  assignee: string | null;
  deadline: string | null;
  status: 'pending' | 'completed';
  sourceMessageId: string;
}

export interface Conversation {
  id: string;
  name: string;
  platform: 'slack' | 'discord' | 'whatsapp' | 'teams' | 'csv' | 'txt' | 'plaintext' | 'unknown';
  messageCount: number;
  lastActivity: string;
  isUnprocessed: boolean;
  summary?: string;
  detailedSummary?: string;
  topics?: string[];
  actionItems: ActionItem[];
  decisions: any[];
  timeline: any[];
  messages: any[];
}

export interface AppState {
  conversations: Conversation[];
  selectedConversationId: string | null;
  currentView: ViewState;
  activeTab: TabState;
  summary: any | null;
  actionItems: ActionItem[];
  isProcessing: boolean;
  processingProgress: number;
  searchQuery: string;
  userSettings: {
    displayName: string;
    modelQuality: 'fast' | 'balanced' | 'thorough';
    autoProcess: boolean;
  };
  
  initStore: () => Promise<void>;
  importFromFile: (file: File, platform?: string | null) => Promise<void>;
  setConversations: (conversations: Conversation[]) => void;
  selectConversation: (id: string | null) => void;
  setView: (view: ViewState) => void;
  setActiveTab: (tab: TabState) => void;
  processConversation: (id: string) => Promise<void>;
  updateActionItemStatus: (id: string, status: 'pending' | 'completed') => void;
  setSearchQuery: (query: string) => void;
  updateSettings: (settings: Partial<AppState['userSettings']>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  conversations: [],
  selectedConversationId: null,
  currentView: 'dashboard',
  activeTab: 'conversations',
  summary: null,
  actionItems: [],
  isProcessing: false,
  processingProgress: 0,
  searchQuery: '',
  userSettings: {
    displayName: 'User',
    modelQuality: 'balanced',
    autoProcess: false,
  },
  
  initStore: async () => {
    try {
      const dbConvs = await repository.getConversations();
      const convs = await Promise.all(dbConvs.map(async (c) => {
        const actionItems = await repository.getActionItems({ conversationId: c.id });
        const summary = await repository.getSummary(c.id);
        const decisions = await repository.getDecisions(c.id);
        const messages = await repository.getMessages(c.id);
        return {
          id: c.id,
          name: c.name,
          platform: c.platform as any,
          messageCount: c.messageCount,
          lastActivity: new Date(c.lastActivity).toLocaleString(),
          isUnprocessed: !c.isProcessed,
          summary: summary?.shortSummary,
          detailedSummary: summary?.detailedSummary,
          topics: summary?.topicsCovered || [],
          actionItems: actionItems.map(a => ({
             id: a.id,
             conversationId: a.conversationId,
             description: a.task,
             urgency: a.urgency as Urgency,
             assignee: a.assignee || null,
             deadline: a.deadline ? new Date(a.deadline).toLocaleString() : null,
             status: a.status as 'pending' | 'completed',
             sourceMessageId: a.sourceMessageId
          })),
          decisions: decisions,
          timeline: [],
          messages: messages
        };
      }));
      set({ conversations: convs });
    } catch (e) {
      console.error("Failed to init store:", e);
    }
  },

  importFromFile: async (file, forcePlatform) => {
    const text = await file.text();
    const format = forcePlatform || detectFormat(text);
    
    let result;
    switch(format) {
      case 'whatsapp': result = parseWhatsAppExport(text); break;
      case 'slack': result = parseSlackExport(JSON.parse(text)); break;
      case 'discord': result = parseDiscordExport(JSON.parse(text)); break;
      case 'teams': result = parseTeamsExport(JSON.parse(text)); break;
      case 'csv': result = parseGenericCSV(text); break;
      default: result = parsePlainText(text); break;
    }

    const convId = generateId();
    const convData = {
      id: convId,
      name: file.name.replace(/\.[^/.]+$/, ""),
      platform: result.conversation.platform,
      importedAt: result.conversation.importedAt,
      messageCount: result.conversation.messageCount,
      lastActivity: result.conversation.lastActivity,
      isProcessed: false,
      isPinned: false
    };

    const messages = result.messages.map(m => ({ ...m, id: generateId(), conversationId: convId }));

    await repository.saveConversation(convData as any, messages as any);

    const newConv: Conversation = {
      id: convData.id,
      name: convData.name,
      platform: convData.platform as any,
      messageCount: convData.messageCount,
      lastActivity: new Date(convData.lastActivity).toLocaleString(),
      isUnprocessed: true,
      actionItems: [],
      decisions: [],
      timeline: [],
      messages: messages
    };

    set(state => ({
      conversations: [newConv, ...state.conversations],
      selectedConversationId: newConv.id,
      currentView: 'conversation',
      activeTab: 'messages'
    }));

    if (get().userSettings.autoProcess) {
      get().processConversation(newConv.id);
    }
  },

  setConversations: (conversations) => set({ conversations }),
  
  selectConversation: (id) => {
    set({ selectedConversationId: id, currentView: id ? 'conversation' : 'dashboard', activeTab: id ? 'messages' : 'conversations' });
  },
  
  setView: (view) => set({ currentView: view }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  processConversation: async (id) => {
    set({ isProcessing: true, processingProgress: 0 });
    
    try {
      const state = get();
      const conv = state.conversations.find(c => c.id === id);
      if (!conv) return;

      const { ScrunchAIPipeline } = await import('../../core/ai/pipeline');
      
      const pipeline = new ScrunchAIPipeline((progress) => {
        set({ processingProgress: progress.percent });
      });
      
      const chatMessages = conv.messages.map((m: any) => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        timestamp: new Date(m.timestamp),
        channel: '',
        isRead: false,
      }));
      
      const summary = await pipeline.summarize(chatMessages);
      const extracted = await pipeline.extractKeyInfo(chatMessages, state.userSettings.displayName);
      const prioritized = await pipeline.prioritize(extracted.actionItems);
      
      await repository.saveSummary(id, {
         conversationId: id,
         shortSummary: summary.shortSummary,
         detailedSummary: summary.detailedSummary,
         topicsCovered: summary.topicsCovered,
         generatedAt: Date.now()
      } as any);

      const dbActionItems = prioritized.map(p => ({
        id: p.item.id,
        conversationId: id,
        task: (p.item as any).task || 'Action Item',
        assignee: (p.item as any).assignee,
        deadline: (p.item as any).deadline ? new Date((p.item as any).deadline).getTime() : undefined,
        urgency: p.score >= 80 ? 'critical' : p.score >= 50 ? 'high' : p.score >= 20 ? 'medium' : 'low',
        status: 'pending' as const,
        sourceMessageId: p.item.sourceMessageId,
        createdAt: Date.now()
      }));
      await repository.saveActionItems(id, dbActionItems as any);

      const dbDecisions = extracted.decisions.map(d => ({
        id: d.id,
        conversationId: id,
        description: d.description,
        decidedBy: d.decidedBy,
        timestamp: new Date(d.timestamp).getTime(),
        sourceMessageId: d.sourceMessageId
      }));
      await repository.saveDecisions(id, dbDecisions as any);

      await repository.updateConversation(id, { isProcessed: true });

      await get().initStore();
      set({ isProcessing: false, processingProgress: 100 });
    } catch (error) {
      console.error('Processing failed:', error);
      set({ isProcessing: false, processingProgress: 0 });
    }
  },
  
  updateActionItemStatus: async (id, status) => {
    await repository.updateActionItemStatus(id, status);
    get().initStore();
  },
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  updateSettings: (settings) => set((state) => ({
    userSettings: { ...state.userSettings, ...settings }
  }))
}));
