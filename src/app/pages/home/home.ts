import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { AuthService, UserData } from '../../services/auth.service';
import { ApiService, Game } from '../../services/api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Header, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {
  user: UserData | null = null;
  topGames: Game[] = [];
  recommendedGames: Game[] = [];
  categoryId: string | null = null;
  search: string = '';

  // ✅ ใช้เพื่อควบคุม scroll ของอันดับเกม
  @ViewChild('topGamesList', { static: false }) topGamesList!: ElementRef;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['categoryId'] || null;
      this.search = params['search'] || '';
      this.loadGames();
    });

    this.auth.user$.subscribe(user => {
      this.user = user;
    });
  }

  loadGames(): void {
    this.api.getGames(this.search, this.categoryId).subscribe({
      next: (res) => {
        if (res && res.success && res.games) {
          this.setGameLists(res.games);
        } else {
          this.topGames = [];
          this.recommendedGames = [];
        }
      },
      error: (err) => console.error("❌ Error loading games:", err)
    });
  }

  private setGameLists(games: Game[]) {
    const sortedGames = [...games].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));

    const gamesWithDate: Game[] = sortedGames.map(game => {
      let releasedDate: Date | null = null;

      if (game.releasedAt) {
        if (typeof game.releasedAt === 'object' && 'seconds' in game.releasedAt) {
          releasedDate = new Date(game.releasedAt.seconds * 1000);
        } else if (typeof game.releasedAt === 'string' || typeof game.releasedAt === 'number') {
          const parsed = new Date(game.releasedAt);
          releasedDate = isNaN(parsed.getTime()) ? null : parsed;
        } else if (game.releasedAt instanceof Date) {
          releasedDate = game.releasedAt;
        }
      }

      return { ...game, rank: 0, releasedAt: releasedDate };
    });

    this.topGames = gamesWithDate.slice(0, 10).map((game, index) => ({
      ...game,
      rank: index + 1
    }));

    this.recommendedGames = gamesWithDate;
    this.cdr.detectChanges();
  }

  goToGameDetail(gameId: string): void {
    this.router.navigate(['/game-detail', gameId]);
  }

  // ✅ ฟังก์ชันเลื่อนซ้าย–ขวา
  scrollLeft(): void {
    if (this.topGamesList) {
      this.topGamesList.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    if (this.topGamesList) {
      this.topGamesList.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }
}
