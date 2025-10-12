import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async canActivate(): Promise<boolean> {
    const user = this.auth.getUser();

    // ✅ ถ้าเป็น admin ผ่านได้เลย
    if (user && user.role === 'admin') {
      return true;
    }

    // ❌ ไม่ใช่ admin
    if (isPlatformBrowser(this.platformId)) {
      await Swal.fire({
        icon: 'error',
        title: '⛔ ปฏิเสธการเข้าถึง',
        text: 'คุณไม่มีสิทธิ์เข้าหน้านี้',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#ff0000',
        background: '#fff',
        color: '#333',
      });
    }

    this.router.navigate(['/home']);
    return false;
  }
}
