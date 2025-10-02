import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header {
  isLoggedIn = false;
  username = '';
  wallet = 0;

  constructor(private auth: AuthService) {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.username = user.name;
        this.wallet = user.wallet;
      } else {
        this.isLoggedIn = false;
        this.username = '';
        this.wallet = 0;
      }
    });
  }

  logout() {
    this.auth.clearUser();
    window.location.href = '/login';  // กลับไปหน้า login
  }
}
