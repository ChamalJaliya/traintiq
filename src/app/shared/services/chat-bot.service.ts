import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap, Subject } from 'rxjs';
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
  isStreaming?: boolean;
  isComplete?: boolean;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  conversation_history?: Array<{role: string, content: string}>;
  stream?: boolean;
}

export interface StreamingResponse {
  content: string;
  isComplete: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatBotService {
  private isTypingSubject = new BehaviorSubject<boolean>(false);
  public isTyping$ = this.isTypingSubject.asObservable();
  
  private streamingSubject = new Subject<StreamingResponse>();
  public streaming$ = this.streamingSubject.asObservable();
  
  private apiUrl = environment.apiUrl || 'http://localhost:5000/api';
  private sessionId: string = '';
  
  constructor(private http: HttpClient) {
    this.generateSessionId();
  }

  private generateSessionId(): void {
    this.sessionId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async getBotResponse(message: string, useStreaming: boolean = true): Promise<ChatResponse> {
    // Set typing indicator
    this.isTypingSubject.next(true);
    
    try {
      if (useStreaming) {
        return await this.getBotResponseStreaming(message);
      } else {
        return await this.getBotResponseStandard(message);
      }
    } catch (error) {
      // Remove typing indicator
      this.isTypingSubject.next(false);
      
      console.error('Chat service error:', error);
      return this.createFallbackResponse('Failed to connect to chat service');
    }
  }

  private async getBotResponseStreaming(message: string): Promise<ChatResponse> {
    const request: ChatRequest = {
      message: message,
      session_id: this.sessionId,
      stream: true
    };

    try {
      // Start streaming response
      const eventSource = new EventSource(
        `${this.apiUrl}/chat/stream?` + new URLSearchParams({
          message: request.message,
          session_id: request.session_id || '',
        }).toString()
      );

      let fullResponse = '';
      let isComplete = false;

      return new Promise<ChatResponse>((resolve, reject) => {
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'content') {
              fullResponse += data.content;
              this.streamingSubject.next({
                content: fullResponse,
                isComplete: false
              });
            } else if (data.type === 'complete') {
              isComplete = true;
              this.isTypingSubject.next(false);
              
              const finalResponse: ChatResponse = {
                success: true,
                response: fullResponse,
                quick_replies: data.quick_replies || [],
                session_id: data.session_id || this.sessionId,
                tokens_used: data.tokens_used,
                response_time: data.response_time,
                isStreaming: true,
                isComplete: true
              };

              this.streamingSubject.next({
                content: fullResponse,
                isComplete: true
              });

              eventSource.close();
              resolve(finalResponse);
            } else if (data.type === 'error') {
              this.isTypingSubject.next(false);
              eventSource.close();
              reject(new Error(data.error || 'Streaming error'));
            }
          } catch (error) {
            console.error('Error parsing SSE data:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE Error:', error);
          this.isTypingSubject.next(false);
          eventSource.close();
          
          if (!isComplete) {
            // Fallback to standard response if streaming fails
            this.getBotResponseStandard(message).then(resolve).catch(reject);
          }
        };

        // Timeout after 30 seconds
        setTimeout(() => {
          if (!isComplete) {
            eventSource.close();
            this.isTypingSubject.next(false);
            reject(new Error('Streaming timeout'));
          }
        }, 30000);
      });

    } catch (error) {
      console.error('Streaming setup error:', error);
      // Fallback to standard response
      return await this.getBotResponseStandard(message);
    }
  }

  private async getBotResponseStandard(message: string): Promise<ChatResponse> {
    const request: ChatRequest = {
      message: message,
      session_id: this.sessionId,
      stream: false
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

  getStreamingResponse(): Observable<StreamingResponse> {
    return this.streaming$;
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

  // Format message content for better display
  formatMessageContent(content: string): string {
    if (!content) return '';

    // Convert markdown-like syntax to HTML
    let formatted = content;

    // Bold text: **text** or __text__ -> <strong>text</strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic text: *text* or _text_ -> <em>text</em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');

    // Code: `text` -> <code>text</code>
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

    // Convert line breaks to <br>
    formatted = formatted.replace(/\n/g, '<br>');

    // Convert simple tables (pipe-separated)
    formatted = this.convertTablesToHTML(formatted);

    // Convert bullet points
    formatted = this.convertListsToHTML(formatted);

    // Convert numbered lists
    formatted = this.convertNumberedListsToHTML(formatted);

    return formatted;
  }

  private convertTablesToHTML(content: string): string {
    const lines = content.split('<br>');
    let inTable = false;
    let tableHTML = '';
    let result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line looks like a table row (contains |)
      if (line.includes('|') && line.split('|').length > 2) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        
        if (!inTable) {
          // Start new table
          inTable = true;
          tableHTML = '<table>';
          
          // Check if next line is a separator (contains dashes)
          const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
          const isHeader = nextLine.includes('-') && nextLine.includes('|');
          
          if (isHeader) {
            tableHTML += '<thead><tr>';
            cells.forEach(cell => {
              tableHTML += `<th>${cell}</th>`;
            });
            tableHTML += '</tr></thead><tbody>';
            i++; // Skip the separator line
          } else {
            tableHTML += '<tbody><tr>';
            cells.forEach(cell => {
              tableHTML += `<td>${cell}</td>`;
            });
            tableHTML += '</tr>';
          }
        } else {
          // Continue table
          tableHTML += '<tr>';
          cells.forEach(cell => {
            tableHTML += `<td>${cell}</td>`;
          });
          tableHTML += '</tr>';
        }
      } else {
        // End table if we were in one
        if (inTable) {
          tableHTML += '</tbody></table>';
          result.push(tableHTML);
          tableHTML = '';
          inTable = false;
        }
        
        // Add non-table line
        if (line) {
          result.push(line);
        }
      }
    }

    // Close table if still open
    if (inTable) {
      tableHTML += '</tbody></table>';
      result.push(tableHTML);
    }

    return result.join('<br>');
  }

  private convertListsToHTML(content: string): string {
    const lines = content.split('<br>');
    let inList = false;
    let result: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for bullet points (-, *, •)
      if (trimmed.match(/^[-*•]\s+(.+)$/)) {
        const listItem = trimmed.replace(/^[-*•]\s+/, '');
        
        if (!inList) {
          result.push('<ul>');
          inList = true;
        }
        
        result.push(`<li>${listItem}</li>`);
      } else {
        // End list if we were in one
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        
        // Add non-list line
        if (trimmed) {
          result.push(line);
        }
      }
    }

    // Close list if still open
    if (inList) {
      result.push('</ul>');
    }

    return result.join('<br>');
  }

  private convertNumberedListsToHTML(content: string): string {
    const lines = content.split('<br>');
    let inList = false;
    let result: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for numbered lists (1. 2. etc.)
      if (trimmed.match(/^\d+\.\s+(.+)$/)) {
        const listItem = trimmed.replace(/^\d+\.\s+/, '');
        
        if (!inList) {
          result.push('<ol>');
          inList = true;
        }
        
        result.push(`<li>${listItem}</li>`);
      } else {
        // End list if we were in one
        if (inList) {
          result.push('</ol>');
          inList = false;
        }
        
        // Add non-list line
        if (trimmed) {
          result.push(line);
        }
      }
    }

    // Close list if still open
    if (inList) {
      result.push('</ol>');
    }

    return result.join('<br>');
  }
} 