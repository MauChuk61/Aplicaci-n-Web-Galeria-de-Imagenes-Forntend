import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MessageService, Conversation } from '../../services/message.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-3xl mx-auto p-5">
      <ng-container *ngIf="!loading; else loadingTpl">
        <div class="mb-5 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900 m-0">Mensajes</h1>
          <button class="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-700 text-white border-none rounded-full w-12 h-12 flex items-center justify-center cursor-pointer transition-transform duration-200 shadow hover:scale-105 hover:shadow-lg" (click)="goToExplore()" title="Iniciar nueva conversación">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <line x1="9" y1="10" x2="15" y2="10"></line>
            </svg>
          </button>
        </div>

        <div class="bg-white border border-gray-300 rounded-lg" *ngIf="conversations.length > 0; else noConversations">
          <div 
            *ngFor="let conversation of conversations" 
            class="flex items-center p-4 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50"
            (click)="openConversation(conversation.id)">
            <img [src]="conversation.otherUser?.profileImage" [alt]="conversation.otherUser?.fullName" class="w-14 h-14 rounded-full mr-3 object-cover" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-sm font-semibold text-gray-900 m-0">{{ conversation.otherUser?.fullName }}</h3>
                <span class="text-sm text-gray-500">@{{ conversation.otherUser?.username }}</span>
              </div>
              <p class="text-sm text-gray-500 m-0 truncate">{{ conversation.lastMessageText || 'Sin mensajes' }}</p>
            </div>
            <div class="flex flex-col items-end gap-1 ml-2">
              <span class="text-xs text-gray-400" *ngIf="conversation.lastMessageAt">
                {{ formatTime(conversation.lastMessageAt) }}
              </span>
              <span class="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center" *ngIf="conversation.unreadCount && conversation.unreadCount > 0">
                {{ conversation.unreadCount }}
              </span>
            </div>
          </div>
        </div>

        <ng-template #noConversations>
          <div class="text-center py-16">
            <p class="text-6xl mb-4">💬</p>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No tienes conversaciones</h3>
            <p class="text-gray-500 text-sm">Envía un mensaje a alguien para empezar a chatear</p>
          </div>
        </ng-template>
      </ng-container>
      <ng-template #loadingTpl>
        <div class="flex items-center justify-center h-96 w-full">
          <span class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
        </div>
      </ng-template>
    </div>
  `
})
export class MessagesListComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  loading: boolean = true;
  private routerEventsSub?: Subscription;

  constructor(
    private messageService: MessageService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Cargar conversaciones inmediatamente
      this.loadConversations();
      // Recargar cada vez que la ruta de mensajes se activa (NavigationEnd)
      this.routerEventsSub = this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          if (this.router.url.startsWith('/messages')) {
            this.loadConversations();
          }
        });
    }
  }

  ngOnDestroy() {
    if (this.routerEventsSub) {
      this.routerEventsSub.unsubscribe();
    }
  }

  loadConversations() {
    this.loading = true;
    this.cdr.markForCheck();
    this.messageService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations.filter(conv => conv.otherUser !== null);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openConversation(conversationId: string) {
    this.router.navigate(['/messages', conversationId]);
  }

  goToExplore() {
    this.router.navigate(['/explore']);
  }

  formatTime(date: Date | string): string {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return messageDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  }
}
