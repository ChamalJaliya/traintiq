import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { trigger, state, style, transition, animate, query, stagger, keyframes } from '@angular/animations';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatBotService, ChatResponse } from '../../services/chat-bot.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  animations: [
    // Smooth chat window entrance with elastic effect
    trigger('slideIn', [
      transition(':enter', [
        style({ 
          transform: 'translateY(100%) scale(0.8)', 
          opacity: 0,
          filter: 'blur(5px)'
        }),
        animate('500ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ 
          transform: 'translateY(0) scale(1)', 
          opacity: 1,
          filter: 'blur(0px)'
        }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0.0, 1, 1)', style({ 
          transform: 'translateY(100%) scale(0.9)', 
          opacity: 0,
          filter: 'blur(3px)'
        }))
      ])
    ]),

    // Natural message flow animation
    trigger('messageSlide', [
      transition(':enter', [
        style({ 
          transform: 'translateY(30px) scale(0.9)',
          opacity: 0
        }),
        animate('400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          keyframes([
            style({ 
              transform: 'translateY(30px) scale(0.9)', 
              opacity: 0, 
              offset: 0 
            }),
            style({ 
              transform: 'translateY(-5px) scale(1.02)', 
              opacity: 0.8, 
              offset: 0.7 
            }),
            style({ 
              transform: 'translateY(0) scale(1)', 
              opacity: 1, 
              offset: 1 
            })
          ])
        )
      ])
    ]),

    // Gentle breathing effect for typing indicator
    trigger('fadeIn', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'scale(0.8)' 
        }),
        animate('300ms ease-out', style({ 
          opacity: 1, 
          transform: 'scale(1)' 
        }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ 
          opacity: 0, 
          transform: 'scale(0.9)' 
        }))
      ]),
      state('breathing', style({
        transform: 'scale(1)'
      })),
      transition('* => breathing', [
        animate('1.5s ease-in-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.05)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ]),

    // Bouncy quick reply buttons
    trigger('fadeInUp', [
      transition(':enter', [
        style({ 
          opacity: 0,
          transform: 'translateY(20px) scale(0.8)'
        }),
        animate('350ms {{delay}}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
          style({ 
            opacity: 1,
            transform: 'translateY(0) scale(1)'
          })
        )
      ], { params: { delay: 0 } })
    ]),

    // Staggered quick replies animation
    trigger('staggerQuickReplies', [
      transition(':enter', [
        query('.quick-reply-btn', [
          style({ 
            opacity: 0, 
            transform: 'translateY(20px) scale(0.8)' 
          }),
          stagger('80ms', [
            animate('350ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
              style({ 
                opacity: 1, 
                transform: 'translateY(0) scale(1)' 
              })
            )
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ChatBotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  isOpen = false;
  isOnline = true;
  isMinimized = false;
  messages: ChatMessage[] = [];
  currentMessage = '';
  quickReplies: string[] = [];
  isTyping = false;
  unreadCount = 0;
  isApiHealthy = false;
  
  private typingSubscription?: Subscription;
  private streamingSubscription?: Subscription;
  private shouldScrollToBottom = false;
  private currentStreamingMessageId?: string;

  constructor(private chatBotService: ChatBotService) {}

  ngOnInit(): void {
    this.initializeChat();

    // Subscribe to typing status
    this.typingSubscription = this.chatBotService.getTypingStatus().subscribe(
      typing => this.isTyping = typing
    );

    // Subscribe to streaming responses
    this.streamingSubscription = this.chatBotService.getStreamingResponse().subscribe(
      streamData => this.handleStreamingResponse(streamData)
    );

    // Check API health
    this.checkApiHealth();
  }

  ngOnDestroy(): void {
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }
    if (this.streamingSubscription) {
      this.streamingSubscription.unsubscribe();
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
    if (!messageText.trim() || this.isTyping) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: this.generateId(),
      text: messageText,
      content: messageText,
      isBot: false,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };
    this.messages.push(userMessage);
    
    this.currentMessage = '';
    this.quickReplies = [];

    // Show typing indicator
    this.isTyping = true;

    // Get bot response (disable streaming until backend supports it)
    try {
      const response = await this.chatBotService.getBotResponse(messageText, false);
      this.handleChatResponse(response);
      
      // Log API usage for analytics
      if (response.success && response.tokens_used) {
        console.log(`API call successful - Tokens used: ${response.tokens_used}, Response time: ${response.response_time}ms`);
      }
    } catch (error) {
      console.error('Error getting bot response:', error);
      this.handleError();
    }
  }

  private handleStreamingResponse(streamData: any): void {
    if (!this.currentStreamingMessageId) return;

    // Find the current streaming message
    const messageIndex = this.messages.findIndex(
      msg => msg.id === this.currentStreamingMessageId
    );

    if (messageIndex !== -1) {
      // Update the message content
      this.messages[messageIndex].content = streamData.content;
      this.messages[messageIndex].text = streamData.content;
      
      if (streamData.isComplete) {
        this.messages[messageIndex].isStreaming = false;
        this.currentStreamingMessageId = undefined;
      }
      
      // Trigger change detection and scroll to bottom
      this.shouldScrollToBottom = true;
    }
  }

  sendQuickReply(reply: string): void {
    this.currentMessage = reply;
    this.sendMessage();
  }

  private handleChatResponse(response: ChatResponse): void {
    this.isTyping = false;
    
    // Add the complete response with a slight delay for better UX
    setTimeout(() => {
      const rawContent = response.response || 'I apologize, but I encountered an issue. Please try again.';
      
      // Check for special formatting demonstrations
      const formattedContent = this.getFormattedDemoContent(rawContent) || 
                              this.chatBotService.formatMessageContent(rawContent);
      
      const botMessage: ChatMessage = {
        id: this.generateId(),
        text: rawContent,
        content: formattedContent,
        isBot: true,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
        quickReplies: response.quick_replies || [],
        avatar: '🤖'
      };
      this.messages.push(botMessage);
      this.shouldScrollToBottom = true;

      // Set new quick replies if available
      if (response.quick_replies && response.quick_replies.length > 0) {
        this.quickReplies = response.quick_replies;
      } else {
        // Default quick replies
        this.quickReplies = [
          "Tell me more",
          "Something else?",
          "Thank you"
        ];
      }

      // Show notification if chat is closed
      if (!this.isOpen && !this.isMinimized) {
        this.unreadCount++;
      }
    }, 500); // Small delay to make it feel more natural
  }

  private getFormattedDemoContent(content: string): string | null {
    const lowerContent = content.toLowerCase();
    
    // Demo for table request
    if (lowerContent.includes('table') && (lowerContent.includes('plan') || lowerContent.includes('pricing') || lowerContent.includes('comparison'))) {
      return `
        <p>Of course! Here's a comparison of the <strong>Starter</strong> and <strong>Professional</strong> plans in a simplified table format:</p>
        
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Starter Plan</th>
              <th>Professional Plan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Price</strong></td>
              <td>$29/month</td>
              <td>$99/month</td>
            </tr>
            <tr>
              <td><strong>CV Analysis</strong></td>
              <td>Up to 100 profiles</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td><strong>Reporting</strong></td>
              <td>Standard</td>
              <td>Advanced analytics</td>
            </tr>
            <tr>
              <td><strong>Support</strong></td>
              <td>Email support</td>
              <td>Priority support</td>
            </tr>
          </tbody>
        </table>
        
        <p><em>Would you like more details about any specific feature?</em></p>
      `;
    }
    
    // Demo for lists
    if (lowerContent.includes('feature') || lowerContent.includes('service') || lowerContent.includes('benefit')) {
      return `
        <p>Here are our <strong>key features</strong>:</p>
        
        <ul>
          <li><strong>AI-Powered CV Analysis</strong> - Advanced parsing and skill extraction</li>
          <li><strong>Smart Matching</strong> - Intelligent candidate-job matching</li>
          <li><strong>Real-time Analytics</strong> - Dashboard with insights and metrics</li>
          <li><strong>API Integration</strong> - Easy integration with your existing systems</li>
        </ul>
        
        <p>Our <strong>implementation process</strong>:</p>
        
        <ol>
          <li>Initial consultation and requirements analysis</li>
          <li>Custom configuration and setup</li>
          <li>Data migration and integration</li>
          <li>Testing and quality assurance</li>
          <li>Go-live and ongoing support</li>
        </ol>
        
        <hr>
        
        <blockquote>
          <strong>Note:</strong> All plans include <code>24/7 support</code> and <em>regular updates</em>.
        </blockquote>
      `;
    }
    
    return null;
  }

  private handleError(): void {
    this.isTyping = false;
    
    const rawContent = 'Sorry, I encountered an error. Please try again later.';
    const formattedContent = this.chatBotService.formatMessageContent(rawContent);
    
    const errorMessage: ChatMessage = {
      id: this.generateId(),
      text: rawContent,
      content: formattedContent,
      isBot: true,
      isUser: false,
      timestamp: new Date(),
      type: 'text',
      avatar: '🤖'
    };
    
    this.messages.push(errorMessage);
    this.shouldScrollToBottom = true;

    // Reset quick replies to default
    this.quickReplies = [
      "Try again",
      "Contact support",
      "Go back"
    ];

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

  private initializeChat(): void {
    // Welcome message
    const welcomeText = "Hello! I'm your **TraintiQ Assistant**. How can I help you today?";
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      text: welcomeText,
      content: this.chatBotService.formatMessageContent(welcomeText),
      isBot: true,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    };
    this.messages.push(welcomeMessage);
    
    // Set initial quick replies
    this.quickReplies = [
      "Tell me about courses",
      "How to get started?",
      "Contact support"
    ];
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
} 