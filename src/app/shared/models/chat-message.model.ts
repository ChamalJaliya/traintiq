export interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'quick-reply' | 'card' | 'typing';
  quickReplies?: string[];
  avatar?: string;
  id?: string;
} 