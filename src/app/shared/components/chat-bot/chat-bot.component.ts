import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatBotService, ChatResponse } from '../../services/chat-bot.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ChatBotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  isOpen = false;
  isMinimized = false;
  messages: ChatMessage[] = [];
  currentMessage = '';
  isTyping = false;
  unreadCount = 0;
  
  private typingSubscription?: Subscription;
  private shouldScrollToBottom = false;

  constructor(private chatBotService: ChatBotService) {}

  ngOnInit(): void {
    // Subscribe to typing status
    this.typingSubscription = this.chatBotService.getTypingStatus().subscribe(
      typing => this.isTyping = typing
    );

    // Add initial welcome message with quick replies
    setTimeout(() => {
      this.addBotMessage({
        text: 'Hello! I\'m Alex, your TraintiQ assistant! 👋 I\'m here to help you learn about our company and services. What would you like to know?',
        quickReplies: ['About TraintiQ', 'Our Services', 'Contact Info', 'Pricing']
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
    } catch (error) {
      this.addBotMessage({
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later. 😔'
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
      text: response.text,
      isBot: true,
      timestamp: new Date(),
      type: response.type || 'text',
      quickReplies: response.quickReplies,
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
} 