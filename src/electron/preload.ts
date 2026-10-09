import { contextBridge, ipcRenderer } from 'electron';

// Type definitions for data passing
export interface ConversationData {
  id: string;
  title: string;
  updatedAt: number;
  messages: MessageData[];
}

export interface MessageData {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// Expose safe, typed APIs to the renderer process
const scrunchAPI = {
  window: {
    minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
    maximize: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
    close: (): Promise<void> => ipcRenderer.invoke('window:close'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),
  },
  storage: {
    getConversations: (): Promise<ConversationData[]> => ipcRenderer.invoke('storage:getConversations'),
    saveConversation: (data: ConversationData): Promise<void> => ipcRenderer.invoke('storage:saveConversation', data),
    deleteConversation: (id: string): Promise<void> => ipcRenderer.invoke('storage:deleteConversation', id),
  },
  ai: {
    summarize: (messages: MessageData[]): Promise<string> => ipcRenderer.invoke('ai:summarize', messages),
    extractActionItems: (messages: MessageData[]): Promise<string[]> => ipcRenderer.invoke('ai:extractActionItems', messages),
    prioritize: (items: string[]): Promise<string[]> => ipcRenderer.invoke('ai:prioritize', items),
  },
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
    getPlatform: (): Promise<string> => ipcRenderer.invoke('app:getPlatform'),
  }
};

contextBridge.exposeInMainWorld('scrunchAPI', scrunchAPI);

// Type declaration for the global window object in the renderer
declare global {
  interface Window {
    scrunchAPI: typeof scrunchAPI;
  }
}
