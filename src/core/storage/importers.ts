import { Conversation, Message } from './database';

export type ImportFormat = 'slack' | 'discord' | 'whatsapp' | 'teams' | 'csv' | 'plaintext' | 'unknown';

export interface ImportResult {
  conversation: Omit<Conversation, 'id' | 'isProcessed' | 'isPinned'>;
  messages: Omit<Message, 'id' | 'conversationId'>[];
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function parseSlackExport(jsonData: any[]): ImportResult {
  const messages: Omit<Message, 'id' | 'conversationId'>[] = [];
  let minTime = Infinity; let maxTime = 0;
  if (!Array.isArray(jsonData)) throw new Error("Invalid Slack export");

  for (const item of jsonData) {
    if (item.type === 'message' && !item.subtype) {
      const ts = parseFloat(item.ts) * 1000;
      minTime = Math.min(minTime, ts); maxTime = Math.max(maxTime, ts);
      messages.push({
        sender: item.user || item.username || 'Unknown',
        content: item.text || '',
        timestamp: ts,
        isRead: true,
        threadId: item.thread_ts ? item.thread_ts : undefined,
        reactions: item.reactions ? JSON.stringify(item.reactions) : undefined
      });
    }
  }
  return {
    conversation: { name: 'Slack Export', platform: 'slack', importedAt: Date.now(), messageCount: messages.length, lastActivity: maxTime === 0 ? Date.now() : maxTime },
    messages
  };
}

export function parseDiscordExport(jsonData: any[]): ImportResult {
  const messages: Omit<Message, 'id' | 'conversationId'>[] = [];
  let minTime = Infinity; let maxTime = 0;
  if (!Array.isArray(jsonData)) throw new Error("Invalid Discord export");

  for (const item of jsonData) {
    const ts = new Date(item.Timestamp || item.timestamp).getTime();
    if (!isNaN(ts)) {
      minTime = Math.min(minTime, ts); maxTime = Math.max(maxTime, ts);
      messages.push({ sender: item.Author || item.author?.username || 'Unknown', content: item.Content || item.content || '', timestamp: ts, isRead: true });
    }
  }
  return {
    conversation: { name: 'Discord Export', platform: 'discord', importedAt: Date.now(), messageCount: messages.length, lastActivity: maxTime === 0 ? Date.now() : maxTime },
    messages
  };
}

export function parseWhatsAppExport(text: string): ImportResult {
  const messages: Omit<Message, 'id' | 'conversationId'>[] = [];
  const lines = text.split('\n');
  let minTime = Infinity; let maxTime = 0;
  const regex1 = /^\[(.*?)\] (.*?): (.*)$/;
  const regex2 = /^(.*?) - (.*?): (.*)$/;
  let currentMsg: any = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let match = trimmed.match(regex1) || trimmed.match(regex2);
    if (match) {
      if (currentMsg) messages.push(currentMsg);
      const ts = new Date(match[1]).getTime();
      if (!isNaN(ts)) { minTime = Math.min(minTime, ts); maxTime = Math.max(maxTime, ts); }
      currentMsg = { sender: match[2], content: match[3], timestamp: isNaN(ts) ? Date.now() : ts, isRead: true };
    } else if (currentMsg) {
      currentMsg.content += '\n' + trimmed;
    }
  }
  if (currentMsg) messages.push(currentMsg);
  return {
    conversation: { name: 'WhatsApp Export', platform: 'whatsapp', importedAt: Date.now(), messageCount: messages.length, lastActivity: maxTime === 0 ? Date.now() : maxTime },
    messages
  };
}

export function parseTeamsExport(jsonData: any[]): ImportResult {
  const messages: Omit<Message, 'id' | 'conversationId'>[] = [];
  let minTime = Infinity; let maxTime = 0;
  if (!Array.isArray(jsonData)) throw new Error("Invalid Teams export");

  for (const item of jsonData) {
    const ts = new Date(item.originalArrivalTime || item.createdDateTime).getTime();
    if (!isNaN(ts)) {
      minTime = Math.min(minTime, ts); maxTime = Math.max(maxTime, ts);
      messages.push({ sender: item.from?.user?.displayName || 'Unknown', content: item.body?.content || '', timestamp: ts, isRead: true });
    }
  }
  return {
    conversation: { name: 'Teams Export', platform: 'teams', importedAt: Date.now(), messageCount: messages.length, lastActivity: maxTime === 0 ? Date.now() : maxTime },
    messages
  };
}

export function parseGenericCSV(csvText: string): ImportResult {
  const messages: Omit<Message, 'id' | 'conversationId'>[] = [];
  const lines = csvText.split('\n');
  if (lines.length < 2) throw new Error("CSV contains no data");
  
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  const tsIdx = headers.findIndex(h => h.includes('time') || h.includes('date'));
  const senderIdx = headers.findIndex(h => h.includes('sender') || h.includes('user') || h.includes('author') || h.includes('from'));
  const contentIdx = headers.findIndex(h => h.includes('message') || h.includes('content') || h.includes('text') || h.includes('body'));

  let minTime = Infinity; let maxTime = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',');
    if (cols.length <= Math.max(tsIdx, senderIdx, contentIdx)) continue;
    const ts = new Date(cols[tsIdx].replace(/^"|"$/g, '')).getTime();
    if (!isNaN(ts)) { minTime = Math.min(minTime, ts); maxTime = Math.max(maxTime, ts); }
    messages.push({ sender: cols[senderIdx].replace(/^"|"$/g, ''), content: cols[contentIdx].replace(/^"|"$/g, ''), timestamp: isNaN(ts) ? Date.now() : ts, isRead: true });
  }
  return {
    conversation: { name: 'CSV Export', platform: 'generic', importedAt: Date.now(), messageCount: messages.length, lastActivity: maxTime === 0 ? Date.now() : maxTime },
    messages
  };
}

export function parsePlainText(text: string): ImportResult {
  const messages: Omit<Message, 'id' | 'conversationId'>[] = [];
  const lines = text.split('\n');
  const regex = /^([^:]+):\s*(.*)$/;
  let currentMsg: any = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(regex);
    if (match) {
      if (currentMsg) messages.push(currentMsg);
      currentMsg = { sender: match[1].trim(), content: match[2], timestamp: Date.now(), isRead: true };
    } else if (currentMsg) {
      currentMsg.content += '\n' + trimmed;
    }
  }
  if (currentMsg) messages.push(currentMsg);
  return {
    conversation: { name: 'Plain Text Export', platform: 'plaintext', importedAt: Date.now(), messageCount: messages.length, lastActivity: Date.now() },
    messages
  };
}

export function detectFormat(data: string): ImportFormat {
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (parsed[0].ts && parsed[0].type) return 'slack';
      if (parsed[0].Author || parsed[0].author) return 'discord';
      if (parsed[0].originalArrivalTime || parsed[0].createdDateTime) return 'teams';
    }
  } catch (e) {}

  const lines = data.split('\n').filter(l => l.trim().length > 0);
  if (lines.length > 0) {
    const first = lines[0];
    if (first.match(/^\[(.*?)\] (.*?): (.*)$/) || first.match(/^(.*?) - (.*?): (.*)$/)) return 'whatsapp';
    if (first.includes(',') && first.toLowerCase().includes('time') && first.toLowerCase().includes('message')) return 'csv';
    if (first.match(/^([^:]+):\s*(.*)$/)) return 'plaintext';
  }
  return 'unknown';
}
