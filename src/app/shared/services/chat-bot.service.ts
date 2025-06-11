import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatResponse {
  success: boolean;
  response: string;
  quick_replies?: string[];
  session_id?: string;
  conversation_id?: number;
  timestamp?: string;
  tokens_used?: number;
  response_time?: number;
  error?: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  conversation_history?: Array<{role: string, content: string}>;
}

@Injectable({
  providedIn: 'root'
})
export class ChatBotService {
  private isTypingSubject = new BehaviorSubject<boolean>(false);
  public isTyping$ = this.isTypingSubject.asObservable();
  
  private apiUrl = environment.apiUrl || 'http://localhost:5000/api';
  private sessionId: string = '';
  
  constructor(private http: HttpClient) {
    this.generateSessionId();
  }

  private generateSessionId(): void {
    this.sessionId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async getBotResponse(message: string): Promise<ChatResponse> {
    // Set typing indicator
    this.isTypingSubject.next(true);
    
    try {
      const request: ChatRequest = {
        message: message,
        session_id: this.sessionId
      };

      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      // Make API call
      const response = await this.http.post<ChatResponse>(
        `${this.apiUrl}/chat/message`,
        request,
        { headers }
      ).pipe(
        tap(() => {
          // Update session ID from response if provided
        }),
        catchError((error) => {
          console.error('Chat API Error:', error);
          // Return fallback response on error
          return of(this.createFallbackResponse(error.message || 'Network error occurred'));
        })
      ).toPromise();

      // Remove typing indicator
      this.isTypingSubject.next(false);
      
      // Update session ID if provided in response
      if (response && response.session_id) {
        this.sessionId = response.session_id;
      }

      return response || this.createFallbackResponse('No response received');
      
    } catch (error) {
      // Remove typing indicator
      this.isTypingSubject.next(false);
      
      console.error('Chat service error:', error);
      return this.createFallbackResponse('Failed to connect to chat service');
    }
  }

  private createFallbackResponse(error?: string): ChatResponse {
    const fallbackMessages = [
      "I apologize, but I'm having trouble connecting to our servers right now. Please try again in a moment or contact our support team at support@traintiq.com.",
      "Our AI assistant is temporarily unavailable. For immediate assistance, please reach out to our support team."
    ];
    
    const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
    
    return {
      success: false,
      response: fallbackMessages[randomIndex],
      quick_replies: ['Try Again', 'Contact Support', 'Technical Help'],
      error: error,
      timestamp: new Date().toISOString()
    };
  }

  getTypingStatus(): Observable<boolean> {
    return this.isTyping$;
  }

  // Get conversation starters from API
  async getConversationStarters(): Promise<string[]> {
    try {
      const response = await this.http.get<{success: boolean, starters: string[]}>(
        `${this.apiUrl}/chat/starters`
      ).pipe(
        catchError((error) => {
          console.error('Error fetching conversation starters:', error);
          return of({
            success: false,
            starters: [
              "What services does TraintiQ offer?",
              "Tell me about your AI-powered CV analysis",
              "What are your pricing plans?",
              "How can I contact support?",
              "What makes TraintiQ different?"
            ]
          });
        })
      ).toPromise();

      return response?.starters || [];
    } catch (error) {
      console.error('Error in getConversationStarters:', error);
      return [
        "What services does TraintiQ offer?",
        "Tell me about your AI-powered CV analysis",
        "What are your pricing plans?",
        "How can I contact support?"
      ];
    }
  }

  // Check if chat service is healthy
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.http.get<{success: boolean, openai_configured: boolean}>(
        `${this.apiUrl}/chat/health`
      ).pipe(
        catchError((error) => {
          console.error('Health check failed:', error);
          return of({ success: false, openai_configured: false });
        })
      ).toPromise();

      return response?.success && response?.openai_configured || false;
    } catch (error) {
      console.error('Health check error:', error);
      return false;
    }
  }

  // Reset session (useful for starting fresh conversation)
  resetSession(): void {
    this.generateSessionId();
  }

  // Get current session ID
  getSessionId(): string {
    return this.sessionId;
  }
} 