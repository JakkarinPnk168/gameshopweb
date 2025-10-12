import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { Header } from '../header/header';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.scss']
})
export class Ranking implements OnInit {
  games: Game[] = [];
  selectedDate: string = '';
  loading = false;
  message = '';

  constructor(
    private gameService: GameService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.selectedDate = this.getToday();
    this.loadTopGames(); // โหลดทันทีเมื่อเปิดหน้า
  }

  getToday(): string {
    const today = new Date();
    const y = today.getFullYear();
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const d = today.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /** ✅ โหลดข้อมูลอันดับขายดี */
  loadTopGames(date?: string) {
    this.loading = true;
    this.message = '';
    this.games = [];

    this.gameService.getTopGamesByDate(date).subscribe({
      next: (data: Game[] | any) => {
        this.loading = false;

        // ✅ ถ้า response เป็น array ปกติ
        if (Array.isArray(data)) {
          this.games = data;
          if (this.games.length === 0) {
            this.message = date
              ? 'ไม่มีข้อมูลยอดขายของวันที่เลือก'
              : 'ยังไม่มีข้อมูลยอดขายรวม';
          }
        } 
        // ✅ ถ้า backend ส่ง object {success: false, message: ...}
        else if (data && data.success === false) {
          this.message = data.message || 'ไม่มีข้อมูลยอดขาย';
          this.games = [];
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Error loading top games:', err);

        // ✅ ตรวจว่าเป็น error จริง (network หรือ server)
        if (err.status && err.status >= 500) {
          this.message = 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์';
        } else {
          this.message = 'ไม่มีข้อมูลยอดขายของวันที่เลือก';
        }

        this.cdr.detectChanges();
      }
    });
  }

  /** ✅ เปลี่ยนวันที่ */
  onDateChange() {
    if (this.selectedDate) {
      console.log('📅 แสดงยอดขายของวันที่:', this.selectedDate);
      this.loadTopGames(this.selectedDate);
    } else {
      console.log('📊 แสดงยอดขายรวมทั้งหมด');
      this.loadTopGames();
    }
  }

  goManageGames() {
    this.router.navigate(['/game-manage']);
  }

  goDiscount() {
    this.router.navigate(['/discount']);
  }

  goTransactionsUser() {
    this.router.navigate(['/transactions-user']);
  }
}
