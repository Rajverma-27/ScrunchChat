import { ChatMessage, Summary, ExtractedInfo, PrioritizedItem, ProcessingProgress, ActionItem, Decision, Mention, Deadline } from './types';
import { extractActionItems, extractDeadlines, extractDecisions, extractMentions, calculateUrgencyScore } from './extractors';

export class ScrunchAIPipeline {
  private onProgress: (progress: ProcessingProgress) => void;

  constructor(onProgress?: (progress: ProcessingProgress) => void) {
    this.onProgress = onProgress || (() => {});
  }

  private emitProgress(stage: string, percent: number, message: string) {
    this.onProgress({ stage, percent, message });
  }

  public async summarize(messages: ChatMessage[]): Promise<Summary> {
    if (!messages || messages.length === 0) {
      return {
        shortSummary: 'No messages to summarize.',
        detailedSummary: 'No messages provided.',
        topicsCovered: [],
        messageCount: 0,
        timeSpan: { start: new Date(), end: new Date() },
        generatedAt: new Date()
      };
    }

    this.emitProgress('summarization', 20, 'Analyzing message content...');
    await new Promise(r => setTimeout(r, 300));

    // Filter out WhatsApp auto-generated media/deleted messages so they don't skew the summary
    const validMessages = messages.filter(m => {
        const text = m.content.toLowerCase().trim();
        return text && 
               !text.includes('omitted') && 
               !text.includes('<media') && 
               !text.includes('deleted');
    });

    // Extract senders
    const senders = Array.from(new Set(messages.map(m => m.sender).filter(Boolean)));
    const senderText = senders.length > 2 
        ? `${senders.slice(0, 2).join(', ')} and ${senders.length - 2} others`
        : senders.join(' and ');

    // Word frequency to find key topics (ignoring numbers and short/common words)
    const stopWords = new Set(['about','above','after','again','against','all','also','always','am','an','and','any','are','aren','as','at','be','because','been','before','being','below','between','both','but','by','can','cannot','could','couldn','did','didn','do','does','doesn','doing','don','down','during','each','few','for','from','further','get','give','go','good','had','hadn','has','hasn','have','haven','having','he','he','hello','her','here','hers','herself','hey','hi','him','himself','his','how','http','https','i','if','image','in','into','is','isn','it','its','itself','just','know','like','look','make','me','media','message','more','most','much','mustn','my','myself','new','no','nor','not','now','of','off','ok','okay','omitted','on','once','only','or','other','our','ours','ourselves','out','over','own','people','really','same','see','she','should','shouldn','so','some','sticker','such','take','than','thank','thanks','that','the','their','theirs','them','themselves','then','there','these','they','think','this','those','through','time','to','too','under','until','up','very','video','want','was','wasn','way','we','well','were','weren','what','when','where','which','while','who','whom','why','will','with','won','work','would','wouldn','www','yeah','year','yes','you','your','yours','yourself','yourselves']);
    
    const wordCounts: Record<string, number> = {};
    validMessages.forEach(m => {
        // ONLY allow a-z (removes all numbers 0-9 to stop random numbers appearing)
        const words = m.content.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
        words.forEach(w => {
            // Only keep substantial words (length > 4 is usually better for topics)
            if (w.length > 4 && !stopWords.has(w)) {
                wordCounts[w] = (wordCounts[w] || 0) + 1;
            }
        });
    });

    const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
    const topicsCovered = sortedWords.slice(0, 5).map(e => e[0].charAt(0).toUpperCase() + e[0].slice(1));
    const topicString = topicsCovered.length > 0 ? topicsCovered.join(', ') : 'general catch-up';

    this.emitProgress('summarization', 60, 'Generating summary...');
    await new Promise(r => setTimeout(r, 400));

    // Simple descriptive summary
    const shortSummary = `This is a conversation between ${senderText} spanning ${messages.length} messages. The primary discussion revolves around: ${topicString}.`;

    // Detailed notes based on the longest (most substantial) actual messages (ignoring media)
    const substantialMessages = [...validMessages]
        .sort((a, b) => b.content.length - a.content.length)
        .slice(0, 3)
        .map(m => `• ${m.sender} mentioned:\n"${m.content.substring(0, 200)}${m.content.length > 200 ? '...' : ''}"`);

    const detailedSummary = substantialMessages.length > 0 
        ? `Here are some of the most substantial points raised during the chat:\n\n${substantialMessages.join('\n\n')}`
        : 'The conversation consists mostly of very short messages or greetings. No substantial paragraphs were found.';

    this.emitProgress('summarization', 100, 'Summarization complete');

    return {
      shortSummary,
      detailedSummary,
      topicsCovered,
      messageCount: messages.length,
      timeSpan: {
        start: new Date(messages[0].timestamp),
        end: new Date(messages[messages.length - 1].timestamp)
      },
      generatedAt: new Date()
    };
  }

  public async extractKeyInfo(messages: ChatMessage[], currentUser: string = 'me'): Promise<ExtractedInfo> {
    this.emitProgress('extraction', 0, 'Starting extraction');
    const allActionItems: ActionItem[] = [];
    const allDecisions: Decision[] = [];
    const allMentions: Mention[] = [];
    const allDeadlines: Deadline[] = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (i % 10 === 0) {
        this.emitProgress('extraction', Math.round((i / messages.length) * 100), `Processing message ${i + 1}`);
      }

      allActionItems.push(...extractActionItems(msg.content, msg.id));
      allDecisions.push(...extractDecisions(msg.content, msg.id, msg.sender, msg.timestamp));
      allMentions.push(...extractMentions(msg.content, currentUser, msg.id, msg.timestamp));
      allDeadlines.push(...extractDeadlines(msg.content, msg.id));
    }

    this.emitProgress('extraction', 100, 'Extraction complete');

    return {
      actionItems: allActionItems,
      decisions: allDecisions,
      mentions: allMentions,
      deadlines: allDeadlines
    };
  }

  public async prioritize(items: any[]): Promise<PrioritizedItem[]> {
    this.emitProgress('prioritization', 0, 'Scoring items');
    
    const prioritized: PrioritizedItem[] = items.map(item => {
      const score = calculateUrgencyScore(item);
      let category: 'actionItem' | 'decision' | 'mention' | 'deadline' = 'actionItem';
      let reasoning = 'General task';

      if ('task' in item) {
        category = 'actionItem';
        reasoning = `Task urgency score: ${score}`;
      } else if ('description' in item && 'decidedBy' in item) {
        category = 'decision';
        reasoning = `Key decision by ${item.decidedBy}`;
      } else if ('mentionedUser' in item) {
        category = 'mention';
        reasoning = `Direct mention`;
      } else if ('date' in item) {
        category = 'deadline';
        reasoning = `Approaching deadline score: ${score}`;
      }

      return {
        item,
        score,
        category,
        reasoning
      };
    });

    prioritized.sort((a, b) => b.score - a.score);
    this.emitProgress('prioritization', 100, 'Prioritization complete');
    
    return prioritized;
  }
}
