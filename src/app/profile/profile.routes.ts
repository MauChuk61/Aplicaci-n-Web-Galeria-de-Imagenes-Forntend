import { Routes } from '@angular/router';
import { ViewProfileComponent } from './pages/view-profile/view-profile.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ViewProfileComponent,
  },
  {
    path: 'edit',
    component: EditProfileComponent,
  },
  {
    path: ':username',
    component: ViewProfileComponent,
  },
];
