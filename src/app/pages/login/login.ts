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
  // ✅ ใช้ identifier (email หรือ username)
  loginData = { identifier: '', password: '' };
  message = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private auth: AuthService
  ) {}

  doLogin() {
    this.api.login({
      identifier: this.loginData.identifier,
      password: this.loginData.password
    }).subscribe({
      next: (res) => {
        if (res.success && res.userId) {
          this.message = 'เข้าสู่ระบบสำเร็จ ✅';

          // ✅ เก็บข้อมูล user ลง AuthService
          this.auth.setUser({
            userId: res.userId,
            name: res.name || 'User',
            email: res.email || '',
            role: res.role || 'user',
            wallet: res.wallet || 0,
            profileImage: res.profileImage || ''
          });

          // ✅ ตรวจ role แล้วเปลี่ยนหน้า
          if (res.role === 'admin') {
            this.router.navigate(['/dashboard']);  // admin → dashboard
          } else {
            this.router.navigate(['/home']);       // user → home
          }
        } else {
          this.message = res.message || 'เข้าสู่ระบบไม่สำเร็จ ❌';
        }
      },
      error: (err) => {
        this.message = err.error?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ ❌';
      }
    });
  }
}
