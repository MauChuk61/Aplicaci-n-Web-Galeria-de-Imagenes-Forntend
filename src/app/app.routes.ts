import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AUTH_ROUTES } from './auth/auth.routes';
import { FEED_ROUTES } from './feed/feed.routes';
import { UPLOAD_ROUTES } from './upload/upload.routes';
import { PROFILE_ROUTES } from './profile/profile.routes';
import { EXPLORE_ROUTES } from './explore/explore.routes';
import { NOTIFICATIONS_ROUTES } from './notifications/notifications.routes';
import { SAVED_ROUTES } from './saved/saved.routes';
import { MESSAGES_ROUTES } from './messages/messages.routes';

export const routes: Routes = [
  // Rutas públicas (sin navbar/sidebar principal)
  {
    path: 'auth',
    children: AUTH_ROUTES,
  },

  // Layout con navbar/sidebar
  {
    path: '',
    component: LayoutComponent,
    children: [
      // Feed público (sin guard)
      {
        path: 'feed',
        children: FEED_ROUTES,
      },
      // Rutas privadas (con guard)
      {
        path: 'upload',
        canActivate: [AuthGuard],
        children: UPLOAD_ROUTES,
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        children: PROFILE_ROUTES,
      },
      {
        path: 'explore',
        canActivate: [AuthGuard],
        children: EXPLORE_ROUTES,
      },
      {
        path: 'notifications',
        canActivate: [AuthGuard],
        children: NOTIFICATIONS_ROUTES,
      },
      {
        path: 'saved',
        canActivate: [AuthGuard],
        children: SAVED_ROUTES,
      },
      {
        path: 'messages',
        canActivate: [AuthGuard],
        children: MESSAGES_ROUTES,
      },
      {
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full',
      },
    ],
  },

  // Redirección por defecto
  {
    path: '**',
    redirectTo: 'feed',
  },
];