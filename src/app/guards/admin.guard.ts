import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.auth.getUser();

    if (user && user.role === 'admin') {
      return true; // ✅ อนุญาต
    }

    // ❌ ถ้าไม่ใช่ admin → กลับหน้า home
    this.router.navigate(['/home']);
    return false;
  }
}
