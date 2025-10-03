import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserData } from '../../services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { Header } from '../header/header';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, Header, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile {
  user: UserData | null = null;
  private sub: Subscription;

  constructor(private auth: AuthService, private router: Router) {
    // ✅ subscribe ค่า user ทุกครั้งที่ AuthService.update
    this.sub = this.auth.user$.subscribe(u => {
      this.user = u;
    });
  }

//   ngOnDestroy() {
//     this.sub.unsubscribe();
//   }

  logout() {
    this.auth.clearUser();
    this.router.navigate(['/login']);
  }

//   goToCart() {
//     this.router.navigate(['/cart']);
//   }

//   goToHistory() {
//     this.router.navigate(['/history']);
//   }

  goToProfileEdit() {
    this.router.navigate(['/edit-profile']); // ✅ route ที่คุณตั้งชื่อ
  }

//   goToLibrary() {
//     this.router.navigate(['/library']);
//   }
}
