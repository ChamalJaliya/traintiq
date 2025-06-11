import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';

export interface ChatResponse {
  text: string;
  type?: 'text' | 'quick-reply' | 'card';
  quickReplies?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatBotService {
  private isTypingSubject = new BehaviorSubject<boolean>(false);
  public isTyping$ = this.isTypingSubject.asObservable();

  private readonly mockResponses = {
    'company_info': [
      {
        text: 'TraintiQ was founded in 2020 with a mission to revolutionize employee training and development through AI-powered solutions. 🚀',
        quickReplies: ['Our Services', 'Company Culture', 'Career Opportunities']
      },
      {
        text: 'We are a leading technology company specializing in AI-driven HR solutions, helping companies optimize their talent management processes. 💼',
        quickReplies: ['Products', 'Contact Sales', 'Demo Request']
      },
      {
        text: 'Our global team of 1000+ professionals operates from offices in major cities worldwide, serving Fortune 500 companies. 🌍',
        quickReplies: ['Our Locations', 'Join Our Team', 'Company News']
      }
    ],
    'services': [
      {
        text: 'Our core services include:\n• AI-Powered CV Analysis 📄\n• Employee Profile Generation 👤\n• Skills Assessment & Matching 🎯\n• Training Program Optimization 📈',
        quickReplies: ['Learn More', 'Request Demo', 'Pricing']
      }
    ],
    'contact': [
      {
        text: 'Get in touch with us:\n📧 Email: contact@traintiq.com\n📞 Phone: 1-800-TRAINTIQ\n💬 Live Chat: Available 24/7',
        quickReplies: ['Schedule Call', 'Email Support', 'Live Agent']
      },
      {
        text: 'Our support team is here to help! Choose how you\'d like to connect with us:',
        quickReplies: ['Technical Support', 'Sales Inquiry', 'Partnership']
      }
    ],
    'pricing': [
      {
        text: 'We offer flexible pricing plans:\n💎 Enterprise: Custom pricing\n🚀 Professional: $99/month\n⭐ Starter: $29/month\n\nAll plans include 24/7 support!',
        quickReplies: ['View Details', 'Free Trial', 'Contact Sales']
      }
    ],
    'culture': [
      {
        text: 'At TraintiQ, we believe in:\n🌟 Innovation & Excellence\n🤝 Collaboration & Teamwork\n📚 Continuous Learning\n🌱 Work-Life Balance\n🎯 Results-Driven Approach',
        quickReplies: ['Career Opportunities', 'Employee Benefits', 'Our Values']
      }
    ],
    'greeting': [
      {
        text: 'Hello! I\'m Alex, your TraintiQ assistant! 👋 I\'m here to help you learn about our company and services. What would you like to know?',
        quickReplies: ['About TraintiQ', 'Our Services', 'Contact Info', 'Pricing']
      }
    ],
    'default': [
      {
        text: 'I\'d be happy to help you with that! Let me connect you with the right information. 🤔',
        quickReplies: ['Company Info', 'Our Services', 'Contact Support']
      },
      {
        text: 'That\'s a great question! While I don\'t have specific details on that, I can help you with general company information. 💡',
        quickReplies: ['About Us', 'Services', 'Get in Touch']
      }
    ]
  };

  constructor() { }

  async getBotResponse(message: string): Promise<ChatResponse> {
    // Set typing indicator
    this.isTypingSubject.next(true);
    
    // Simulate realistic typing delay (1-3 seconds)
    const typingDelay = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, typingDelay));

    const lowerMessage = message.toLowerCase();
    let response: ChatResponse;
    
    // Enhanced keyword matching
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = this.getRandomResponse('greeting');
    } else if (lowerMessage.includes('service') || lowerMessage.includes('product') || lowerMessage.includes('what do you do')) {
      response = this.getRandomResponse('services');
    } else if (lowerMessage.includes('company') || lowerMessage.includes('about') || lowerMessage.includes('traintiq')) {
      response = this.getRandomResponse('company_info');
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone') || lowerMessage.includes('support')) {
      response = this.getRandomResponse('contact');
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('plan') || lowerMessage.includes('pricing')) {
      response = this.getRandomResponse('pricing');
    } else if (lowerMessage.includes('culture') || lowerMessage.includes('value') || lowerMessage.includes('work') || lowerMessage.includes('team')) {
      response = this.getRandomResponse('culture');
    } else {
      response = this.getRandomResponse('default');
    }

    // Remove typing indicator
    this.isTypingSubject.next(false);
    
    return response;
  }

  private getRandomResponse(category: keyof typeof this.mockResponses): ChatResponse {
    const responses = this.mockResponses[category];
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  getTypingStatus(): Observable<boolean> {
    return this.isTyping$;
  }
} 