export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  channel: string;
  isRead: boolean;
  threadId?: string;
}

export interface Summary {
  shortSummary: string;
  detailedSummary: string;
  topicsCovered: string[];
  messageCount: number;
  timeSpan: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
}

export interface ActionItem {
  id: string;
  task: string;
  assignee?: string;
  deadline?: Date;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  sourceMessageId: string;
  status: 'pending' | 'done' | 'dismissed';
}

export interface Decision {
  id: string;
  description: string;
  decidedBy: string;
  timestamp: Date;
  sourceMessageId: string;
}

export interface Mention {
  id: string;
  mentionedUser: string;
  context: string;
  sourceMessageId: string;
  timestamp: Date;
}

export interface Deadline {
  id: string;
  date: Date;
  description: string;
  sourceMessageId: string;
  daysUntil: number;
}

export interface ExtractedInfo {
  actionItems: ActionItem[];
  decisions: Decision[];
  mentions: Mention[];
  deadlines: Deadline[];
  summary?: Summary;
}

export interface PrioritizedItem {
  item: ActionItem | Decision | Mention | Deadline;
  score: number;
  category: 'actionItem' | 'decision' | 'mention' | 'deadline';
  reasoning: string;
}

export interface ProcessingProgress {
  stage: string;
  percent: number;
  message: string;
}
