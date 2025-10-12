import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { EditProfile } from './pages/edit-profile/edit-profile';
import { Dashboard } from './pages/dashboard/dashboard';
import { AdminGuard } from './guards/admin.guard';
import { GameManage } from './pages/game-manage/game-manage';
import { GameAdd } from './pages/game-add/game-add';
import { GameEdit } from './pages/game-edit/game-edit';
import { AuthGuard } from './guards/auth.guaed';
import { Ranking } from './pages/ranking/ranking';
import { TransactionsUser } from './pages/transactions-user/transactions-user';
import { DiscountManage } from './pages/discount-manage/discount-manage';
import { GameDetail } from './pages/game-detail/game-detail';
import { MyCart } from './pages/my-cart/my-cart';
import { Topup } from './pages/topup/topup';
import { AllGames } from './pages/all-games/all-games';
import { Mylibrary } from './pages/mylibrary/mylibrary';
import { History } from './pages/history/history';

export const routes: Routes = [
  //Public routes
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'game-detail/:id', component: GameDetail} ,
  { path: 'allgames', component: AllGames},
  
  // User routes (ต้อง login ก่อน)
  { path: 'topup', component: Topup, canActivate: [AuthGuard]} ,
  { path: 'mycart', component: MyCart, canActivate: [AuthGuard]} ,
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
  { path: 'edit-profile', component: EditProfile, canActivate: [AuthGuard] },
  { path: 'mylibrary', component: Mylibrary, canActivate: [AuthGuard]} ,
  { path: 'history', component: History, canActivate: [AuthGuard]} ,

  //Admin routes (ทุกหน้าใช้ AdminGuard แยก)
  { path: 'dashboard', component: Dashboard, canActivate: [AdminGuard] },
  { path: 'game-manage', component: GameManage, canActivate: [AdminGuard] },
  { path: 'game-add', component: GameAdd, canActivate: [AdminGuard] },
  { path: 'game-edit/:id', component: GameEdit, canActivate: [AdminGuard] },
  { path: 'ranking', component: Ranking, canActivate: [AdminGuard] },
  { path: 'transactions-user', component: TransactionsUser, canActivate: [AdminGuard] },
  { path: 'discount', component: DiscountManage, canActivate: [AdminGuard] },
  //Not found fallback
  { path: '**', redirectTo: 'home' }
];
