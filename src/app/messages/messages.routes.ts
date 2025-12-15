import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';

export const MESSAGES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/messages-list/messages-list.component').then(m => m.MessagesListComponent)
  },
  {
    path: ':id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/chat-view/chat-view.component').then(m => m.ChatViewComponent)
  }
];
