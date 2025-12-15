import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../../core/models/models';

@Component({
  selector: 'app-notifications-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-view.component.html',
})
export class NotificationsViewComponent implements OnInit {
  notifications: Notification[] = [];
  allNotifications: Notification[] = [];
  filterType: string = 'all';

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.allNotifications = notifications;
        this.notifications = notifications;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar notificaciones', error);
        this.allNotifications = [];
        this.notifications = [];
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.read = true;
      });
    }
  }

  deleteNotification(notificationId: string): void {
    this.notificationService.deleteNotification(notificationId).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
    });
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      like: '❤️',
      love: '❤️',
      comment: '💬',
      follow: '👤',
      reaction: '😊',
    };
    return icons[type] || '📌';
  }

  getNotificationMessage(notification: Notification): string {
    const messages: { [key: string]: string } = {
      like: `le dio me gusta a tu publicación`,
      love: `le encantó tu publicación`,
      comment: `comentó en tu publicación`,
      follow: `empezó a seguirte`,
      reaction: `reaccionó a tu publicación`,
    };
    return messages[notification.type] || 'interactuó contigo';
  }

  filterNotifications() {
    if (this.filterType === 'all') {
      this.notifications = [...this.allNotifications];
    } else {
      this.notifications = this.allNotifications.filter(n => n.type === this.filterType);
    }
    this.cdr.detectChanges();
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return notifDate.toLocaleDateString();
  }
}
