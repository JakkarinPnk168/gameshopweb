import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { Header } from '../header/header';
import { AuthService } from '../../services/auth.service';
import { ApiService, CartItemAPI } from '../../services/api.service';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cart';

interface CheckoutResponse {
  success: boolean;
  newWallet?: number;
  discount?: number;
  finalTotal?: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header],
  templateUrl: './my-cart.html',
  styleUrls: ['./my-cart.scss']
})
export class MyCart implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  myLibrary: string[] = [];
  promoCode = '';
  _backendDiscount = 0;
  promoInvalid = false;
  private cartSubscription!: Subscription;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.auth.getUser();

    if (user) {
      this.api.getMyGames().subscribe(res => {
        if (res.success) {
          this.myLibrary = res.games.map(g => g.id);
          this.updateCartDisabledStatus();
          this.cdr.detectChanges();
        }
      });
    }

    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartItems = items.map(item => ({
        ...item,
        disabled: this.myLibrary.includes(item.id),
        selected: item.selected ?? true,
        price: item.price ?? 0,
        quantity: item.quantity ?? 1
      }));
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.cartSubscription?.unsubscribe();
  }

  get subtotal(): number {
    return this.cartItems
      .filter(i => i.selected && !i.disabled)
      .reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  get discount(): number {
    return this._backendDiscount ?? 0;
  }

  get total(): number {
    return this.subtotal - this.discount;
  }

  removeItem(itemId: string) {
    this.cartService.removeItem(itemId);
    Swal.fire({
      icon: 'info',
      title: 'ลบสินค้าออกจากตะกร้าแล้ว',
      confirmButtonColor: '#E50914',
      timer: 1500,
      showConfirmButton: false
    });
  }

  clearCart() {
    this.cartService.clearCart();
    Swal.fire({
      icon: 'info',
      title: 'ล้างตะกร้าเรียบร้อยแล้ว',
      confirmButtonColor: '#E50914',
      timer: 1500,
      showConfirmButton: false
    });
  }

  applyPromoCode() {
    if (!this.promoCode) {
      Swal.fire({
        icon: 'info',
        title: 'กรุณากรอกโค้ดส่วนลด',
        confirmButtonColor: '#E50914'
      });
      return;
    }

    const subtotal = this.subtotal;
    this.api.validatePromoCode(this.promoCode, subtotal).subscribe({
      next: (res: any) => {
        if (res.valid) {
          this._backendDiscount =
            res.discountType === 'fixed'
              ? res.discountValue
              : subtotal * (res.discountValue / 100);

          Swal.fire({
            icon: 'success',
            title: 'ใช้โค้ดส่วนลดสำเร็จ!',
            html: `
              <p>${res.message}</p>
              <p>ส่วนลด <b>${this._backendDiscount.toFixed(2)} บาท</b></p>
            `,
            confirmButtonColor: '#E50914'
          });
          this.promoInvalid = false;
        } else {
          this._backendDiscount = 0;
          Swal.fire({
            icon: 'warning',
            title: 'โค้ดไม่สามารถใช้งานได้',
            text: res.message || 'โค้ดหมดอายุหรือยอดไม่ถึงขั้นต่ำ',
            confirmButtonColor: '#E50914'
          });
          this.promoInvalid = true;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this._backendDiscount = 0;
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: 'ไม่สามารถตรวจสอบโค้ดได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonColor: '#E50914'
        });
        this.promoInvalid = true;
        this.cdr.detectChanges();
      }
    });
  }

  checkout() {
    const user = this.auth.getUser();
    const token = this.auth.getToken();
    if (!user || !token) {
      Swal.fire({
        icon: 'info',
        title: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        confirmButtonColor: '#E50914'
      });
      return;
    }

    const purchasedItems: CartItemAPI[] = this.cartService.getCart()
      .filter(i => i.selected && !i.disabled)
      .map(i => ({ gameId: i.id, quantity: i.quantity }));

    if (!purchasedItems.length) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่มีเกมในตะกร้า',
        text: 'กรุณาเลือกเกมที่ต้องการก่อนชำระเงิน',
        confirmButtonColor: '#E50914'
      });
      return;
    }

    Swal.fire({
      title: 'ยืนยันการชำระเงิน?',
      html: `
        <p>จำนวนเกม: <b>${purchasedItems.length}</b></p>
        <p>ยอดชำระสุทธิ: <b>${this.total.toFixed(2)} บาท</b></p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#E50914'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.api.checkoutCart(purchasedItems, this.promoCode, token)
        .subscribe({
          next: (res: CheckoutResponse) => {
            if (res.success) {
              const purchasedIds = purchasedItems.map(i => i.gameId);
              this.auth.addToLibrary(purchasedIds);

              const newWallet = res.newWallet ?? user.wallet;
              this.auth.updateWallet(newWallet);
              this.cartService.clearCart();

              const discount = res.discount ?? 0;
              const finalTotal = res.finalTotal ?? this.total;

              Swal.fire({
                icon: 'success',
                title: 'ชำระเงินสำเร็จ!',
                html: `
                  <p>ซื้อเกมจำนวน <b>${purchasedIds.length}</b> เกม</p>
                  <p>ส่วนลด: <b>${discount.toFixed(2)} บาท</b></p>
                  <p>ยอดสุทธิ: <b>${finalTotal.toFixed(2)} บาท</b></p>
                  <p>ยอดเงินคงเหลือ: <b>${newWallet.toFixed(2)} บาท</b></p>
                `,
                confirmButtonColor: '#E50914'
              });

              this.promoCode = '';
              this._backendDiscount = 0;
              this.cdr.detectChanges();
            }
          },
          error: err => {
            Swal.fire({
              icon: 'error',
              title: 'ชำระเงินไม่สำเร็จ',
              text: err.error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
              confirmButtonColor: '#E50914'
            });
          }
        });
    });
  }

  onSelectionChange(itemId: string, isSelected: boolean) {
    const item = this.cartItems.find(i => i.id === itemId);
    if (!item) return;

    if (this.myLibrary.includes(item.id)) {
      item.selected = false;
      Swal.fire({
        icon: 'info',
        title: 'คุณมีเกมนี้อยู่แล้ว',
        confirmButtonColor: '#E50914',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      this.cartService.updateItemSelection(itemId, isSelected);
    }
    this.cdr.detectChanges();
  }

  private updateCartDisabledStatus() {
    this.cartItems = this.cartItems.map(item => ({
      ...item,
      disabled: this.myLibrary.includes(item.id)
    }));
  }
}
