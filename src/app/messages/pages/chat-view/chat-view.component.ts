import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, ViewChild, ElementRef, AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessageService, Message, Conversation } from '../../services/message.service';
import { MessageEventsService } from '../../services/message-events.service';
import { AuthService } from '../../../core/services/auth.service';
import { interval, Subscription, filter } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-chat-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="!isLoading; else loading">
      <div class="flex flex-col h-[calc(100vh-60px)] max-w-3xl mx-auto bg-white border-l border-r border-gray-300">
        <div class="flex items-center p-4 border-b border-gray-300 bg-white sticky top-0 z-10">
          <button class="bg-transparent border-none cursor-pointer p-2 mr-3 text-gray-800 flex items-center hover:text-blue-500" (click)="goBack()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <img *ngIf="otherUser" [src]="otherUser.profileImage" [alt]="otherUser.fullName" class="w-10 h-10 rounded-full mr-3 object-cover" />
          <div *ngIf="otherUser">
            <h2 class="text-base font-semibold text-gray-900 m-0">{{ otherUser.fullName }}</h2>
            <span class="text-sm text-gray-500">@{{ otherUser.username }}</span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-3" #messagesContainer>
          <div *ngFor="let message of messages" [ngClass]="message.senderId === currentUserId ? 'flex max-w-[70%] self-end' : 'flex max-w-[70%] self-start'">
            <div [ngClass]="message.senderId === currentUserId
              ? 'bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-3'
              : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-3'">
              <p class="m-0 mb-1 text-sm leading-tight">{{ message.content }}</p>
              <span class="text-xs opacity-70">{{ formatTime(message.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center p-4 border-t border-gray-300 bg-white">
          <input 
            type="text" 
            class="flex-1 border border-gray-300 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white mr-2"
            [(ngModel)]="newMessage"
            (keydown.enter)="sendMessage()"
            placeholder="Escribe un mensaje..."
            [disabled]="sending">
          <button 
            class="bg-transparent border-none text-blue-500 cursor-pointer p-2 ml-2 flex items-center transition-transform duration-200 hover:scale-110 disabled:text-gray-400 disabled:cursor-not-allowed"
            (click)="sendMessage()"
            [disabled]="!newMessage.trim() || sending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </ng-container>
    <ng-template #loading>
      <div class="flex items-center justify-center h-[calc(100vh-60px)] w-full">
        <span class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    </ng-template>
  `
})
export class ChatViewComponent implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {
  isLoading = true;
    ngAfterViewInit() {
      // Forzar scroll al final tras recargar la página
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  conversationId!: string;
  messages: Message[] = [];
  otherUser: any = null;
  currentUserId: string = '';
  newMessage: string = '';
  sending: boolean = false;
  private pollSubscription?: Subscription;
  private routerEventsSub?: Subscription;
  private shouldScrollToBottom = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private messageEvents: MessageEventsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Recargar mensajes y detalles al navegar a la ruta del chat
    this.routerEventsSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam && this.router.url.startsWith('/messages/')) {
          this.conversationId = idParam;
          this.loadConversationDetails();
          this.loadMessages();
          this.shouldScrollToBottom = true;
        }
      });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const idParam = this.route.snapshot.paramMap.get('id');
      this.conversationId = idParam || '';
      
      if (!this.conversationId) {
        console.error('Invalid conversation ID');
        this.router.navigate(['/messages']);
        return;
      }
      
      const user = this.authService.getCurrentUser();
      if (user) {
        this.currentUserId = user.id;
      }
      
      this.loadConversationDetails();
      this.loadMessages();
      this.startPolling();
    }
  }

  private conversationLoaded = false;
  private messagesLoaded = false;

  loadConversationDetails() {
    this.messageService.getConversationDetails(this.conversationId).subscribe({
      next: (conversation) => {
        this.otherUser = conversation.otherUser;
        this.conversationLoaded = true;
        this.checkLoading();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading conversation details:', error);
        this.conversationLoaded = true;
        this.checkLoading();
        this.cdr.markForCheck();
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
    if (this.routerEventsSub) {
      this.routerEventsSub.unsubscribe();
    }
  }

  loadMessages() {
    this.messageService.getMessages(this.conversationId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.shouldScrollToBottom = true;
        this.messagesLoaded = true;
        this.checkLoading();
        // Emitir evento para actualizar el badge de mensajes no leídos
        this.messageEvents.emitMessageRead();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.messagesLoaded = true;
        this.checkLoading();
        this.cdr.markForCheck();
      }
    });
  }

  checkLoading() {
    if (this.conversationLoaded && this.messagesLoaded) {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.sending || !this.otherUser) return;

    this.sending = true;
    const recipientId = String(this.otherUser.id);

    this.messageService.sendMessage(recipientId, this.newMessage.trim()).subscribe({
      next: (message) => {
        if (message) {
          this.messages = [...this.messages, message];
          this.newMessage = '';
          this.sending = false;
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        } else {
          this.sending = false;
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
        alert('Error al enviar mensaje. Intenta nuevamente.');
        this.sending = false;
      }
    });
  }

  startPolling() {
    // Actualizar mensajes cada 3 segundos
    this.pollSubscription = interval(3000)
      .pipe(switchMap(() => this.messageService.getMessages(this.conversationId)))
      .subscribe({
        next: (messages) => {
          const hadNewMessages = messages.length > this.messages.length;
          this.messages = messages;
          if (hadNewMessages || messages.length > 0) {
            this.shouldScrollToBottom = true;
          }
        },
        error: (error) => {
          console.error('Error polling messages:', error);
        }
      });
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      try {
        setTimeout(() => {
          this.messagesContainer.nativeElement.scrollTop = 
            this.messagesContainer.nativeElement.scrollHeight;
        }, 50);
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }
  }

  goBack() {
    this.router.navigate(['/messages']);
  }

  formatTime(date: string | Date): string {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}
