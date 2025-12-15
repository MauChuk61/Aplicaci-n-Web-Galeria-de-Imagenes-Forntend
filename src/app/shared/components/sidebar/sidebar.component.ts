import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationService } from '../../../notifications/services/notification.service';
import { MessageService, Conversation } from '../../../messages/services/message.service';
import { MessageEventsService } from '../../../messages/services/message-events.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  menuItems = [
    { label: 'Inicio', icon: '🏠', route: '/feed' },
    { label: 'Explorar', icon: '🔍', route: '/explore' },
    { label: 'Guardar', icon: '🔖', route: '/saved' },
    { label: 'Mensajes', icon: '💬', route: '/messages' },
    { label: 'Notificaciones', icon: '🔔', route: '/notifications' },
  ];

  unreadCount: number = 0;
  unreadMessagesCount: number = 0;
  conversations: Conversation[] = [];

  private messageEventsSub?: any;
  constructor(
    private notificationService: NotificationService,
    private messageService: MessageService,
    private messageEvents: MessageEventsService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadUnreadCount();
        this.loadUnreadMessagesCountFromConversations();
        setInterval(() => {
          this.loadUnreadCount();
          this.loadUnreadMessagesCountFromConversations();
        }, 30000);
      }, 0);
      // Suscribirse a eventos de mensajes leídos para refrescar el contador
      this.messageEventsSub = this.messageEvents.messageRead$.subscribe(() => {
        this.loadUnreadMessagesCountFromConversations();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.messageEventsSub) {
      this.messageEventsSub.unsubscribe();
    }
  }

  private loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      },
      error: () => {
        this.unreadCount = 0;
        this.cdr.detectChanges();
      }
    });
  }

  private loadUnreadMessagesCountFromConversations(): void {
    this.messageService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.unreadMessagesCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        this.cdr.detectChanges();
      },
      error: () => {
        this.unreadMessagesCount = 0;
        this.cdr.detectChanges();
      }
    });
  }
}