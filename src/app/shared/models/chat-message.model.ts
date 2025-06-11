export interface ChatMessage {
  id: string;
  text?: string;
  content?: string;
  isBot?: boolean;
  isUser?: boolean;
  timestamp: Date;
  type?: 'text' | 'quick-reply' | 'card' | 'typing' | 'error';
  quickReplies?: string[];
  avatar?: string;
  isStreaming?: boolean;
} 