import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { GameService, Game, Category } from '../../services/game.service';
import Swal from 'sweetalert2';
import { Header } from '../header/header';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-game-manage',
  standalone: true,
  imports: [CommonModule, Header, AdminSidebar],
  templateUrl: './game-manage.html',
  styleUrls: ['./game-manage.scss']
})
export class GameManage implements OnInit {
  games: Game[] = [];
  paginatedGames: Game[] = [];
  categories: Category[] = [];
  loading = false;

  page = 1;
  perPage = 5;

  constructor(
    public gameService: GameService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loadCategories();
    this.loadGames();

    // ✅ โหลดใหม่อัตโนมัติเมื่อกลับจากหน้า add/edit
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.urlAfterRedirects.includes('/game-manage')) {
          this.loadGames(true); // โหลดใหม่ทุกครั้งที่กลับมาหน้านี้
        }
      });
  }

  /** ✅ โหลดประเภทเกม */
  loadCategories() {
    this.gameService.getCategories().subscribe({
      next: (data) => {
        this.categories = data || [];
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดประเภทเกมได้', 'error');
      }
    });
  }

  /** ✅ โหลดเกม (isRefresh = true หมายถึง reload หลังกลับจาก add/edit) */
  loadGames(isRefresh = false) {
  this.loading = true;
  this.gameService.getAllGames().subscribe({
    next: (res: any) => {
      this.ngZone.run(() => {
        const data = res.games || res || [];
        if (!Array.isArray(data)) {
          this.loading = false;
          Swal.fire('เกิดข้อผิดพลาด', 'รูปแบบข้อมูลเกมไม่ถูกต้อง', 'error');
          return;
        }

        this.games = data.map((g: any) => {
          let releasedAtDate: Date | null = null;
          if (g.releasedAt) {
            const r: any = g.releasedAt;
            if (r instanceof Date) releasedAtDate = r;
            else if (r.seconds || r._seconds) {
              const sec = r.seconds ?? r._seconds;
              releasedAtDate = new Date(sec * 1000);
            } else if (typeof r === 'string') {
              const parsed = new Date(r);
              releasedAtDate = isNaN(parsed.getTime()) ? null : parsed;
            }
          }
          return { ...g, releasedAt: releasedAtDate };
        });

        this.updatePagination();
        this.loading = false;
        this.cdr.detectChanges();
      });
    },
    error: (err) => {
      this.loading = false;
      console.error('❌ โหลดข้อมูลเกมไม่สำเร็จ', err);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลเกมได้', 'error');
    }
  });
}


  /** ✅ ฟังก์ชันแบ่งหน้า */
  updatePagination() {
    const start = (this.page - 1) * this.perPage;
    const end = start + this.perPage;
    this.paginatedGames = this.games.slice(start, end);
  }

  nextPage() {
    if (this.page * this.perPage < this.games.length) {
      this.page++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.updatePagination();
    }
  }

  getCategoryName(id: string) {
    const found = this.categories.find((c) => c.id === id);
    return found ? found.name : '-';
  }

  deleteGame(id: string) {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'เกมนี้จะถูกลบออกจากระบบ!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.gameService.deleteGame(id).subscribe({
          next: (res: any) => {
            this.loading = false;

            if (res.success) {
              this.games = this.games.filter((g) => g.id !== id);
              this.updatePagination();
              this.cdr.detectChanges();

              Swal.fire({
                icon: 'success',
                title: 'ลบเกมสำเร็จ!',
                timer: 1500,
                showConfirmButton: false
              });
            } else {
              Swal.fire('ลบไม่สำเร็จ', res.message || 'เกิดข้อผิดพลาด', 'error');
            }
          },
          error: () => {
            this.loading = false;
            Swal.fire('ลบเกมไม่สำเร็จ', 'เกิดข้อผิดพลาดในระบบ', 'error');
          }
        });
      }
    });
  }


  goAdd() {
    this.router.navigate(['/game-add'], { state: { from: 'manage' } });
  }

  goEdit(id: string) {
    this.router.navigate(['/game-edit', id], { state: { from: 'manage' } });
  }

  goDiscount() {
    this.router.navigate(['/discount']);
  }

  goRanking() {
    this.router.navigate(['/ranking']);
  }

  goTransactionsUser() {
    this.router.navigate(['/transactions-user']);
  }
}
