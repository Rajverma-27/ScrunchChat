import Dexie, { Table } from 'dexie';

export interface Conversation {
  id: string;
  name: string;
  platform: string;
  channelName?: string;
  importedAt: number;
  messageCount: number;
  lastActivity: number;
  isProcessed: boolean;
  isPinned: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  threadId?: string;
  reactions?: string;
}

export interface Summary {
  id: string;
  conversationId: string;
  shortSummary: string;
  detailedSummary: string;
  topicsCovered: string[];
  generatedAt: number;
}

export interface ActionItem {
  id: string;
  conversationId: string;
  task: string;
  assignee?: string;
  deadline?: string | number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'dismissed';
  sourceMessageId: string;
  createdAt: number;
}

export interface Decision {
  id: string;
  conversationId: string;
  description: string;
  decidedBy?: string;
  timestamp: number;
  sourceMessageId: string;
}

export interface Mention {
  id: string;
  conversationId: string;
  mentionedUser: string;
  context: string;
  sourceMessageId: string;
  timestamp: number;
}

export interface Deadline {
  id: string;
  conversationId: string;
  date: number;
  description: string;
  sourceMessageId: string;
  daysUntil?: number;
}

export interface UserSetting {
  key: string;
  value: any;
}

export class ScrunchDatabase extends Dexie {
  conversations!: Table<Conversation, string>;
  messages!: Table<Message, string>;
  summaries!: Table<Summary, string>;
  actionItems!: Table<ActionItem, string>;
  decisions!: Table<Decision, string>;
  mentions!: Table<Mention, string>;
  deadlines!: Table<Deadline, string>;
  userSettings!: Table<UserSetting, string>;

  constructor() {
    super('ScrunchDatabase');
    this.version(2).stores({
      conversations: 'id, name, platform, importedAt, lastActivity',
      messages: 'id, conversationId, timestamp',
      summaries: 'id, conversationId',
      actionItems: 'id, conversationId, urgency, status',
      decisions: 'id, conversationId',
      mentions: 'id, conversationId',
      deadlines: 'id, conversationId, date',
      userSettings: 'key'
    });
  }
}

export const db = new ScrunchDatabase();
