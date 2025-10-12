import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // ✅ ใช้เช็คว่าเป็น Browser หรือไม่
  ) {}

  canActivate(): boolean {
    const user = this.auth.getUser();

    // ✅ ถ้ามี userId ถือว่า login แล้ว → ผ่านได้
    if (user && user.userId) {
      return true;
    }

    // ❌ ถ้ายังไม่ login → แสดง SweetAlert2 (เฉพาะฝั่ง Browser)
    if (isPlatformBrowser(this.platformId)) {
      Swal.fire({
        icon: 'warning',
        title: 'ยังไม่ได้เข้าสู่ระบบ',
        text: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3085d6',
        customClass: {
          popup: 'rounded-xl shadow-lg',
        }
      }).then(() => {
        this.router.navigate(['/login']);
      });
    } else {
      // 🚨 ถ้าเป็นฝั่ง Server SSR → แค่ redirect เฉย ๆ (ไม่มี alert)
      this.router.navigate(['/login']);
    }

    return false;
  }
}
