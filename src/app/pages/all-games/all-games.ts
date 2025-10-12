import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, Game } from '../../services/api.service';
import { AuthService, UserData } from '../../services/auth.service';
import { Header } from '../header/header';

@Component({
  selector: 'app-all-games',
  standalone: true,
  imports: [CommonModule, RouterModule, Header],
  templateUrl: './all-games.html',
  styleUrls: ['./all-games.scss']
})
export class AllGames implements OnInit {
  games: Game[] = [];
  categoryId: string | null = null;
  user: UserData | null = null;
  loading = true;
  error = '';

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe user
    this.auth.user$.subscribe(user => {
      this.user = user;
      this.cdr.detectChanges(); // render view ทันที
    });

    // ฟัง query params สำหรับ category
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['categoryId'] || null;
      this.loadGames();
    });
  }

  loadGames(): void {
    this.loading = true;
    this.error = '';
    const search = this.route.snapshot.queryParamMap.get('search') || '';

    const apiCall = this.categoryId
      ? this.api.getGamesByCategory(this.categoryId, search)
      : this.api.getGames(search);

    apiCall.subscribe({
      next: res => {
        if (res.success) {
          this.setGames(res.games);
        } else {
          this.error = 'ไม่พบเกม';
        }
        this.loading = false;
        this.cdr.detectChanges(); // render view หลังโหลดเสร็จ
      },
      error: err => {
        console.error('Error loading games:', err);
        this.error = 'เกิดข้อผิดพลาดในการโหลดเกม';
        this.loading = false;
        this.cdr.detectChanges(); // render view หลังเกิด error
      }
    });
  }

  private setGames(games: Game[]) {
    this.games = games.map(game => ({
      ...game,
      releasedAt: game.releasedAt ? new Date(game.releasedAt) : null
    }));
  }

  buyGame(game: Game) {
    if (!this.user) return alert('คุณต้องล็อกอินก่อนซื้อเกม');
    const confirmPurchase = confirm(`คุณต้องการซื้อเกม "${game.name}" ราคา ${game.price} บาทหรือไม่?`);
    if (!confirmPurchase) return;

    this.api.buyGame(game.id).subscribe({
      next: res => {
        if (res.success) {
          alert(`ซื้อเกมสำเร็จ! เงินคงเหลือ: ${res.newWallet} บาท`);
          this.user!.wallet = res.newWallet!;
          this.auth.setUser(this.user!);
        } else {
          alert('ซื้อเกมไม่สำเร็จ');
        }
      },
      error: err => {
        console.error('Error buying game:', err);
        alert('เกิดข้อผิดพลาดในการซื้อเกม');
      }
    });
  }
}
