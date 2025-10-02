import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Main } from './pages/main/main';

export const routes: Routes = [
  { path: '', component: Main },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'home', component: Home },
];
