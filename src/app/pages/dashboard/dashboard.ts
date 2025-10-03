import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../header/header';
import { AuthService, UserData } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  user: UserData | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    // ✅ ดึงข้อมูลจาก AuthService
    this.user = this.auth.getUser();

    // ❌ ถ้าไม่ใช่ admin → เด้งออกไปหน้า home
    if (!this.user || this.user.role !== 'admin') {
      this.router.navigate(['/home']);
    }
  }

  goManageGames() {
    this.router.navigate(['/manage-games']);
  }

  logout() {
    this.auth.clearUser();
    this.router.navigate(['/login']);
  }
}
