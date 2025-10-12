import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Game } from '../../services/api.service';
import { Header } from '../header/header';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './mylibrary.html',
  styleUrls: ['./mylibrary.scss']
})
export class Mylibrary implements OnInit {
  myGames: Game[] = [];
  isLoading = true;
  error = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // ✅ เพิ่ม ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.loadLibrary();
      } else {
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ render view ทันที
      }
    });
  }

  loadLibrary(): void {
    this.isLoading = true;
    this.error = '';

    this.api.getMyGames().subscribe({
      next: (res) => {
        if (res.success) {
          this.myGames = res.games;
        } else {
          this.error = 'ไม่พบเกมในห้องสมุด';
        }
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ render view หลังโหลดเสร็จ
      },
      error: (err) => {
        console.error('Failed to fetch library games', err);
        this.error = 'เกิดข้อผิดพลาดในการโหลดห้องสมุด';
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ render view หลังเกิด error
      }
    });
  }

  goToGameDetail(gameId: string) {
    this.router.navigate(['/game-detail', gameId]);
  }
}
