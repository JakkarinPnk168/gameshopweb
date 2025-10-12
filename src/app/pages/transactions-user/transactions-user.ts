import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';
import { Header } from '../header/header';

@Component({
  selector: 'app-transactions-user',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './transactions-user.html',
  styleUrls: ['./transactions-user.scss']
})
export class TransactionsUser implements OnInit {
  transactions: any[] = [];
  loading = false;
  message = '';

  constructor(
    private gameService: GameService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    this.cdr.detectChanges(); // ✅ บังคับให้ UI แสดงสถานะโหลด

    this.gameService.getAllTransactions().subscribe({
      next: (res) => {
        console.log('📦 ดึงข้อมูลธุรกรรมจาก API:', res);

        if (Array.isArray(res)) {
          this.transactions = res.map((t: any) => ({
            ...t,
            createdAt: t.createdAt?._seconds
              ? new Date(t.createdAt._seconds * 1000)
              : new Date(t.createdAt),
          }));
          console.log('✅ แปลงข้อมูลสำเร็จ:', this.transactions);
        } else {
          console.warn('⚠️ รูปแบบข้อมูลไม่ถูกต้อง');
          this.transactions = [];
        }

        this.loading = false;

        // ✅ แก้ไข: ใช้ setTimeout เพื่อให้ detectChanges ทำงานหลัง Angular render รอบแรกเสร็จ
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        console.error('❌ โหลดธุรกรรมล้มเหลว:', err);
        this.message = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
        this.loading = false;

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  formatDate(value: any): string {
    if (!value) return '-';
    const d = new Date(value);
    return d.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  goManageGames() { this.router.navigate(['/game-manage']); }
  goDiscount() { this.router.navigate(['/discount']); }
  goRanking() { this.router.navigate(['/ranking']); }
}
