import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  providers: [ApiService]
})
export class Login {
  // ✅ ใช้ identifier เพื่อรองรับทั้ง email/username
  loginData = { identifier: '', password: '' };
  message = '';

  constructor(private api: ApiService, private router: Router, private auth: AuthService) {}

  doLogin() {
    this.api.login({
      email: this.loginData.identifier, // ✅ ส่งไป backend ใน field email
      password: this.loginData.password
    }).subscribe({
      next: (res) => {
        if (res.success && res.userId) {
          this.message = 'Login success';

          this.auth.setUser({
            userId: res.userId,
            name: res.name || 'User',
            role: res.role || 'user',
            wallet: res.wallet || 0,
            profileImage: res.profileImage || ''
          });

          this.router.navigate(['/']);
        } else {
          this.message = res.message || 'Login failed';
        }
      },
      error: (err) => {
        this.message = err.error?.message || 'Login failed';
      }
    });
  }
}
