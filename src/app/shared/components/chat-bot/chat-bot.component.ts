import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatBotService, ChatResponse } from '../../services/chat-bot.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class ChatBotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  isOpen = false;
  isMinimized = false;
  messages: ChatMessage[] = [];
  currentMessage = '';
  isTyping = false;
  unreadCount = 0;
  isApiHealthy = false;
  
  private typingSubscription?: Subscription;
  private shouldScrollToBottom = false;

  constructor(private chatBotService: ChatBotService) {}

  ngOnInit(): void {
    // Subscribe to typing status
    this.typingSubscription = this.chatBotService.getTypingStatus().subscribe(
      typing => this.isTyping = typing
    );

    // Check API health
    this.checkApiHealth();

    // Add initial welcome message with quick replies
    setTimeout(() => {
      this.addBotMessage({
        success: true,
        response: 'Hello! I\'m Alex, your TraintiQ assistant! 👋 I\'m here to help you learn about our company and services. What would you like to know?',
        quick_replies: ['About TraintiQ', 'Our Services', 'Contact Info', 'Pricing']
      });
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  async checkApiHealth(): Promise<void> {
    try {
      this.isApiHealthy = await this.chatBotService.checkHealth();
      if (!this.isApiHealthy) {
        console.warn('Chat API is not healthy - falling back to local responses');
      }
    } catch (error) {
      console.error('Failed to check API health:', error);
      this.isApiHealthy = false;
    }
  }

  toggleChat(): void {
    if (this.isMinimized) {
      this.isMinimized = false;
    } else {
      this.isOpen = !this.isOpen;
    }
    
    if (this.isOpen) {
      this.unreadCount = 0;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  minimizeChat(): void {
    this.isMinimized = true;
    this.isOpen = false;
  }

  closeChat(): void {
    this.isOpen = false;
    this.isMinimized = false;
  }

  async sendMessage(message?: string): Promise<void> {
    const messageText = message || this.currentMessage;
    if (!messageText.trim()) return;

    // Add user message
    this.addUserMessage(messageText);
    this.currentMessage = '';

    // Get bot response
    try {
      const response = await this.chatBotService.getBotResponse(messageText);
      this.addBotMessage(response);
      
      // Log API usage for analytics
      if (response.success && response.tokens_used) {
        console.log(`API call successful - Tokens used: ${response.tokens_used}, Response time: ${response.response_time}ms`);
      }
    } catch (error) {
      console.error('Error getting bot response:', error);
      this.addBotMessage({
        success: false,
        response: 'Sorry, I\'m having trouble connecting right now. Please try again later. 😔',
        quick_replies: ['Try Again', 'Contact Support'],
        error: 'Connection failed'
      });
    }
  }

  sendQuickReply(reply: string): void {
    this.sendMessage(reply);
  }

  private addUserMessage(text: string): void {
    const message: ChatMessage = {
      id: this.generateId(),
      text,
      isBot: false,
      timestamp: new Date(),
      type: 'text'
    };
    
    this.messages.push(message);
    this.shouldScrollToBottom = true;
  }

  private addBotMessage(response: ChatResponse): void {
    const message: ChatMessage = {
      id: this.generateId(),
      text: response.response,
      isBot: true,
      timestamp: new Date(),
      type: response.success ? 'text' : 'error',
      quickReplies: response.quick_replies || [],
      avatar: '🤖'
    };
    
    this.messages.push(message);
    this.shouldScrollToBottom = true;

    // Show notification if chat is closed
    if (!this.isOpen && !this.isMinimized) {
      this.unreadCount++;
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Format message text for display (handle line breaks)
  formatMessageText(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  // Track by function for better performance
  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id || index.toString();
  }

  // Retry failed message
  retryLastMessage(): void {
    const lastUserMessage = this.messages
      .filter(msg => !msg.isBot)
      .pop();
    
    if (lastUserMessage) {
      this.sendMessage(lastUserMessage.text);
    }
  }

  // Reset chat session
  resetChat(): void {
    this.messages = [];
    this.chatBotService.resetSession();
    this.ngOnInit(); // Re-initialize with welcome message
  }
} 