import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  id: number;
  content: string;
  senderId: string;
  conversationId: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: number;
    username: string;
    fullName: string;
    profileImage: string;
  };
}

export interface Conversation {
  id: string;
  lastMessageText: string | null;
  lastMessageAt: Date | null;
  createdAt: string;
  otherUser: {
    id: number;
    username: string;
    fullName?: string;
    profileImage: string;
  } | null;
  unreadCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:3000/messages';

  constructor(private http: HttpClient) {}

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  getConversationDetails(conversationId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/conversations/${conversationId}/details`);
  }

  getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/conversations/${conversationId}`);
  }

  sendMessage(recipientId: number | string, content: string): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, { 
      recipientId: String(recipientId), 
      content 
    });
  }

  createConversation(participantId: number | string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations/create`, {
      participantId: String(participantId)
    });
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`);
  }
}
