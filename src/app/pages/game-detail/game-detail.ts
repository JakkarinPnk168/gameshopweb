import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Game } from '../../services/api.service';
import { Header } from '../header/header';
import { AuthService } from '../../services/auth.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CartItem, CartService } from '../../services/cart';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './game-detail.html',
  styleUrls: ['./game-detail.scss']
})
export class GameDetail implements OnInit {

  game: Game | null = null;
  loading = true;
  error = '';
  alreadyOwned = false; // ✅ เพิ่มตัวแปรตรวจว่าเป็นเจ้าของแล้วหรือไม่

  categoryName: string = '';
  rank: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🟢 [GameDetail] Component initialized');

    this.route.paramMap
      .pipe(
        switchMap(paramMap => {
          const gameId = paramMap.get('id');
          if (!gameId) {
            this.error = 'Game ID ไม่ถูกต้อง';
            this.loading = false;
            this.cdr.detectChanges();
            return of(null);
          }

          this.loading = true;
          this.error = '';
          return this.api.getGameById(gameId);
        })
      )
      .subscribe({
        next: res => {
          if (res && res.success && res.game) {
            const g = res.game;

            // ✅ แปลง releasedAt
            if (g.releasedAt) {
              if (typeof g.releasedAt === 'object' && ('_seconds' in g.releasedAt || 'seconds' in g.releasedAt)) {
                const seconds = g.releasedAt._seconds || g.releasedAt.seconds;
                g.releasedAt = new Date(seconds * 1000);
              } else if (typeof g.releasedAt === 'string') {
                const parsed = new Date(g.releasedAt);
                g.releasedAt = isNaN(parsed.getTime()) ? null : parsed;
              }
            } else {
              g.releasedAt = null;
            }

            this.game = g;
            this.categoryName = g.categoryName || 'ไม่ระบุประเภท';
            this.rank = typeof g.rank === 'number' ? g.rank : null;

            // ✅ ตรวจสอบว่าผู้ใช้มีเกมนี้แล้วหรือไม่
            const user = this.auth.getUser();
            if (user && user.library?.includes(g.id)) {
              this.alreadyOwned = true;
            } else {
              this.alreadyOwned = false;
            }

          } else {
            this.error = res?.message || 'ไม่พบข้อมูลเกม';
          }

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('❌ [API Error] getGameById failed:', err);
          this.error = 'เกิดข้อผิดพลาดในการโหลดเกม';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  buyNow(): void {
    if (!this.game) {
      Swal.fire('ไม่พบข้อมูลเกม', '', 'warning');
      return;
    }

    const user = this.auth.getUser();
    if (!user) {
      Swal.fire('กรุณาเข้าสู่ระบบก่อนซื้อเกม', '', 'info');
      return;
    }

    // ✅ ถ้ามีเกมแล้วไม่ให้ซื้อซ้ำ
    if (this.alreadyOwned) {
      Swal.fire({
        icon: 'info',
        title: 'คุณมีเกมนี้อยู่แล้ว!',
        text: `${this.game.name} อยู่ในคลังเกมของคุณแล้ว`,
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    Swal.fire({
      title: 'ยืนยันการซื้อ?',
      text: `คุณต้องการซื้อ ${this.game.name} หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ซื้อเลย',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.api.buyGame(this.game!.id).subscribe({
        next: (res) => {
          if (res.success) {
            user.wallet = res.newWallet ?? user.wallet;
            user.library = [...(user.library || []), this.game!.id];
            this.auth.setUser(user);
            this.alreadyOwned = true; // ✅ หลังซื้อสำเร็จให้ disable ปุ่ม
            this.cdr.detectChanges();

            Swal.fire({
              icon: 'success',
              title: 'ซื้อเกมสำเร็จ!',
              html: `
                <b>${this.game!.name}</b> ถูกเพิ่มในคลังของคุณแล้ว<br>
                ยอดเงินคงเหลือ: <b>${user.wallet} บาท</b>
              `,
              confirmButtonText: 'ตกลง'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'ซื้อเกมไม่สำเร็จ',
              text: res.order?.message || 'ไม่ทราบสาเหตุ'
            });
          }
        },
        error: (err) => {
          console.error('❌ [BuyNow Error]:', err);
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาดในการซื้อเกม',
            text: 'โปรดลองอีกครั้งภายหลัง'
          });
        }
      });
    });
  }

  addToCart(): void {
    if (!this.game) {
      Swal.fire('ไม่พบข้อมูลเกม', '', 'warning');
      return;
    }

    const itemToAdd: CartItem = {
      id: this.game.id,
      name: this.game.name,
      imageUrl: this.game.imageUrl,
      description: this.game.description || '',
      price: this.game.price,
      quantity: 1,
      selected: true
    };

    this.cartService.addToCart(itemToAdd);

    Swal.fire({
      icon: 'success',
      title: 'เพิ่มลงตะกร้าแล้ว!',
      text: `${this.game.name} ถูกเพิ่มในตะกร้าของคุณ`,
      timer: 1500,
      showConfirmButton: false
    });

    this.router.navigate(['/mycart']);
  }
}
