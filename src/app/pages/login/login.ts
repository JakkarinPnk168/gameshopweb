import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  providers: [ApiService]
})
export class Login {
  loginData = { identifier: '', password: '' };
  message = '';
  loading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  doLogin() {
    if (!this.loginData.identifier || !this.loginData.password) {
      Swal.fire('แจ้งเตือน', 'กรุณากรอกชื่อผู้ใช้หรืออีเมลและรหัสผ่านให้ครบถ้วน', 'warning');
      return;
    }

    this.loading = true;

    this.api.login({
      identifier: this.loginData.identifier,
      password: this.loginData.password
    }).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.success && res.userId) {
          console.log('✅ Login response:', res);

          // ✅ ป้องกัน SSR (ให้ทำงานเฉพาะฝั่ง browser)
          if (isPlatformBrowser(this.platformId)) {
            // เก็บข้อมูล user และ token ลง AuthService
            this.auth.setUser({
              userId: res.userId,
              name: res.name || 'User',
              email: res.email || '',
              role: res.role || 'user',
              wallet: res.wallet || 0,
              profileImage: res.profileImage || '',
              token: res.token || ''
            });
          }

          // ✅ ตรวจ token เพื่อ debug
          console.log('🔐 Token saved:', res.token);

          // ✅ แจ้งผลด้วย SweetAlert
          Swal.fire({
            icon: 'success',
            title: 'เข้าสู่ระบบสำเร็จ',
            text: `ยินดีต้อนรับ ${res.name || 'ผู้ใช้'}!`,
            timer: 1000,
            showConfirmButton: false
          });

          // ✅ Redirect ตาม role
          if (res.role === 'admin') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/home']);
          }

        } else {
          console.warn('⚠️ Login failed:', res.message);
          Swal.fire('เข้าสู่ระบบไม่สำเร็จ', res.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Login Error:', err);
        Swal.fire('เกิดข้อผิดพลาด', err.error?.message || 'ไม่สามารถเข้าสู่ระบบได้', 'error');
      }
    });
  }

  goRegister() {
    this.router.navigate(['/register']);
  }

}
