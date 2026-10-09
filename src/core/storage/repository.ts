import { db, Conversation, Message, Summary, ActionItem, Decision, Deadline, Mention, UserSetting } from './database';

export interface MessageSearchOptions {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ActionItemFilters {
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'in-progress' | 'completed' | 'dismissed';
  conversationId?: string;
}

export class ConversationRepository {
  async saveConversation(conv: Conversation, messages: Message[]): Promise<string> {
    return await db.transaction('rw', db.conversations, db.messages, async () => {
      await db.conversations.put(conv);
      await db.messages.bulkPut(messages);
      return conv.id;
    });
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<void> {
    await db.conversations.update(id, updates);
  }

  async getConversations(): Promise<Conversation[]> {
    return await db.conversations.orderBy('lastActivity').reverse().toArray();
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return await db.conversations.get(id);
  }

  async getMessages(conversationId: string, options?: MessageSearchOptions): Promise<Message[]> {
    let collection = db.messages.where('conversationId').equals(conversationId);
    
    if (options?.search) {
      const lowerSearch = options.search.toLowerCase();
      collection = collection.filter(msg => msg.content.toLowerCase().includes(lowerSearch));
    }
    
    const messages = await collection.toArray();
    messages.sort((a, b) => a.timestamp - b.timestamp);

    let result = messages;
    if (options?.offset !== undefined) result = result.slice(options.offset);
    if (options?.limit !== undefined) result = result.slice(0, options.limit);
    
    return result;
  }

  async saveSummary(conversationId: string, summary: any): Promise<string> {
    return await db.transaction('rw', db.summaries, async () => {
      const existing = await db.summaries.where('conversationId').equals(conversationId).first();
      if (existing && existing.id) {
        // Strip out any new ID to prevent primary key modification errors
        const { id, ...updateData } = summary;
        await db.summaries.update(existing.id, updateData);
        return existing.id;
      }
      
      const newSummary = {
        ...summary,
        id: summary.id || crypto.randomUUID()
      };
      await db.summaries.put(newSummary);
      return newSummary.id;
    });
  }

  async getSummary(conversationId: string): Promise<Summary | undefined> {
    return await db.summaries.where('conversationId').equals(conversationId).first();
  }

  async saveActionItems(conversationId: string, items: ActionItem[]): Promise<void> {
    await db.transaction('rw', db.actionItems, async () => {
      await db.actionItems.where('conversationId').equals(conversationId).delete();
      await db.actionItems.bulkPut(items);
    });
  }

  async getActionItems(filters?: ActionItemFilters): Promise<ActionItem[]> {
    let collection = db.actionItems.toCollection();
    if (filters) {
      collection = collection.filter(item => {
        if (filters.urgency && item.urgency !== filters.urgency) return false;
        if (filters.status && item.status !== filters.status) return false;
        if (filters.conversationId && item.conversationId !== filters.conversationId) return false;
        return true;
      });
    }
    return await collection.toArray();
  }

  async updateActionItemStatus(id: string, status: ActionItem['status']): Promise<number> {
    return await db.actionItems.update(id, { status });
  }

  async saveDecisions(conversationId: string, decisions: Decision[]): Promise<void> {
    await db.transaction('rw', db.decisions, async () => {
      await db.decisions.where('conversationId').equals(conversationId).delete();
      await db.decisions.bulkPut(decisions);
    });
  }

  async getDecisions(conversationId: string): Promise<Decision[]> {
    return await db.decisions.where('conversationId').equals(conversationId).toArray();
  }

  async saveDeadlines(conversationId: string, deadlines: Deadline[]): Promise<void> {
    await db.deadlines.bulkPut(deadlines);
  }

  async saveMentions(conversationId: string, mentions: Mention[]): Promise<void> {
    await db.mentions.bulkPut(mentions);
  }

  async deleteConversation(id: string): Promise<void> {
    await db.transaction('rw', [
      db.conversations, db.messages, db.summaries, db.actionItems, db.decisions, db.mentions, db.deadlines
    ], async () => {
      await db.conversations.delete(id);
      await Promise.all([
        db.messages.where('conversationId').equals(id).delete(),
        db.summaries.where('conversationId').equals(id).delete(),
        db.actionItems.where('conversationId').equals(id).delete(),
        db.decisions.where('conversationId').equals(id).delete(),
        db.mentions.where('conversationId').equals(id).delete(),
        db.deadlines.where('conversationId').equals(id).delete()
      ]);
    });
  }

  async getUserSetting(key: string): Promise<any | undefined> {
    const setting = await db.userSettings.get(key);
    return setting?.value;
  }

  async setUserSetting(key: string, value: any): Promise<string> {
    await db.userSettings.put({ key, value });
    return key;
  }
}

export const repository = new ConversationRepository();
