import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { EditProfile } from './pages/edit-profile/edit-profile';
import { Dashboard } from './pages/dashboard/dashboard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'profile', component: Profile },
  { path: 'edit-profile', component: EditProfile } ,
  { path: 'dashboard', component: Dashboard, canActivate: [AdminGuard] },
];
