import { differenceInDays, parse, isValid, addDays, nextDay, Day } from 'date-fns';
import { ActionItem, Deadline, Decision, Mention } from './types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function extractActionItems(text: string, sourceMessageId: string): ActionItem[] {
  const items: ActionItem[] = [];
  const patterns = [
    /(?:TODO|ACTION ITEM|ACTION):?\s*(.+)/gi,
    /(?:please|could you|would you)\s+(?:do|take care of|handle|look into|follow up on)\s+(.+)/gi,
    /(?:need to|we should|someone should)\s+(.+)/gi,
    /assigned to (@[\w]+):\s*(.+)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const task = match[1] || match[2];
      const assignee = match[1]?.startsWith('@') ? match[1].substring(1) : undefined;
      
      if (!task) continue;

      items.push({
        id: generateId(),
        task: task.trim(),
        assignee,
        urgency: calculateUrgencyLevel(text),
        sourceMessageId,
        status: 'pending'
      });
    }
  }
  return items;
}

export function extractDeadlines(text: string, sourceMessageId: string): Deadline[] {
  const deadlines: Deadline[] = [];
  
  const patterns = [
    /by (today|tomorrow|eod|end of day)/gi,
    /by (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
    /due (today|tomorrow|eod|end of day)/gi,
    /due (?:on |by )?(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const dateStr = match[1].toLowerCase();
      let targetDate: Date | null = null;
      const today = new Date();

      if (dateStr === 'today' || dateStr === 'eod' || dateStr === 'end of day') {
        targetDate = new Date();
      } else if (dateStr === 'tomorrow') {
        targetDate = addDays(today, 1);
      } else if (['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].includes(dateStr)) {
        const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
        const targetDay = days.indexOf(dateStr) as Day;
        targetDate = nextDay(today, targetDay);
      } else {
        let parsed = parse(dateStr, 'MM/dd/yyyy', today);
        if (!isValid(parsed)) parsed = parse(dateStr, 'MM/dd', today);
        if (isValid(parsed)) targetDate = parsed;
      }

      if (targetDate) {
        deadlines.push({
          id: generateId(),
          date: targetDate,
          description: text.substring(Math.max(0, match.index - 30), match.index + 30).trim(),
          sourceMessageId,
          daysUntil: differenceInDays(targetDate, today)
        });
      }
    }
  }

  return deadlines;
}

export function extractDecisions(text: string, sourceMessageId: string, author: string, timestamp: Date): Decision[] {
  const decisions: Decision[] = [];
  const patterns = [
    /(?:decided|agreed|confirmed) (?:to|that) (.+)/gi,
    /(?:let's go with|going with|final answer:?) (.+)/gi,
    /(?:approved) (.+)/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) {
        decisions.push({
          id: generateId(),
          description: match[1].trim(),
          decidedBy: author,
          timestamp,
          sourceMessageId
        });
      }
    }
  }
  return decisions;
}

export function extractMentions(text: string, currentUser: string, sourceMessageId: string, timestamp: Date): Mention[] {
  const mentions: Mention[] = [];
  const mentionPattern = /@(\w+)/g;
  let match;
  
  while ((match = mentionPattern.exec(text)) !== null) {
    const mentionedUser = match[1];
    if (mentionedUser === currentUser) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(text.length, match.index + 50);
      mentions.push({
        id: generateId(),
        mentionedUser,
        context: text.substring(start, end).trim(),
        sourceMessageId,
        timestamp
      });
    }
  }
  return mentions;
}

export function calculateUrgencyScore(item: any): number {
  let score = 0;
  const text = (item.task || item.description || item.context || '').toLowerCase();
  
  if (text.includes('urgent') || text.includes('asap') || text.includes('critical')) score += 50;
  if (text.includes('priority')) score += 30;
  
  const capsCount = (text.match(/[A-Z]{2,}/g) || []).length;
  score += Math.min(20, capsCount * 5);
  
  const bangCount = (text.match(/!/g) || []).length;
  score += Math.min(10, bangCount * 2);

  if (item.deadline) {
    const days = differenceInDays(new Date(item.deadline), new Date());
    if (days < 0) score += 40;
    else if (days === 0) score += 30;
    else if (days <= 2) score += 20;
    else if (days <= 7) score += 10;
  } else if (item.date) {
    const days = differenceInDays(new Date(item.date), new Date());
    if (days < 0) score += 40;
    else if (days === 0) score += 30;
    else if (days <= 2) score += 20;
    else if (days <= 7) score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

function calculateUrgencyLevel(text: string): 'critical' | 'high' | 'medium' | 'low' {
  const score = calculateUrgencyScore({ task: text });
  if (score >= 80) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 20) return 'medium';
  return 'low';
}
