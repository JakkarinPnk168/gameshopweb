import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { ApiService, TopUpHistory } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Header } from '../header/header';

@Component({
  selector: 'app-topup',
  standalone: true,
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './topup.html',
  styleUrls: ['./topup.scss']
})
export class Topup implements OnInit {
  amount: number | null = 0;
  presetAmounts = [100, 200, 500, 1000];
  paymentMethods = ['ais', 'truemoney', 'qr', 'visa', 'true', 'kplus', 'dtac', 'scb'];
  selectedMethod = 'truemoney';
  phoneNumber = '';

  history: TopUpHistory[] = [];
  isLoading = true;
  isSubmitting = false;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.loadHistory();
      } else {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    const currentUser = this.auth.getUser();
    if (currentUser) {
      this.loadHistory();
    } else {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadHistory(): void {
    this.isLoading = true;
    this.api.getTopUpHistory().subscribe({
      next: (res) => {
        if (res.success) {
          this.history = res.history.map(h => {
            let date: Date | null = null;
            if (h.createdAt) {
              if (h.createdAt.seconds) {
                date = new Date(h.createdAt.seconds * 1000);
              } else {
                const temp = new Date(h.createdAt);
                if (!isNaN(temp.getTime())) date = temp;
              }
            }
            return { ...h, createdAt: date };
          });
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch top-up history', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setAmount(value: number): void {
    this.amount = value;
  }

  submitTopUp(): void {
    if (!this.amount || this.amount < 100 || this.isSubmitting) {
      if (this.amount && this.amount < 100) {
        Swal.fire({
          icon: 'warning',
          title: 'จำนวนเงินไม่ถูกต้อง',
          text: 'ขั้นต่ำในการเติมคือ 100 บาท',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#E50914'
        });
      }
      return;
    }

    Swal.fire({
      title: 'ยืนยันการเติมเงิน?',
      html: `
        <p>จำนวนเงิน: <b>${this.amount} บาท</b></p>
        <p>ช่องทาง: <b>${this.selectedMethod.toUpperCase()}</b></p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#E50914'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.isSubmitting = true;

      this.api.topUpWallet(this.amount!, this.selectedMethod).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.success) {
            const currentUser = this.auth.getUser();
            if (currentUser) {
              currentUser.wallet = (currentUser.wallet || 0) + this.amount!;
              this.auth.setUser(currentUser);
            }

            this.loadHistory();

            Swal.fire({
              icon: 'success',
              title: 'เติมเงินสำเร็จ!',
              html: `
                <p>จำนวนเงิน: <b>${this.amount} บาท</b></p>
                <p>ยอดเงินคงเหลือ: <b>${currentUser?.wallet} บาท</b></p>
              `,
              confirmButtonText: 'ตกลง',
              confirmButtonColor: '#E50914'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'เติมเงินไม่สำเร็จ',
              text: res.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
              confirmButtonColor: '#E50914'
            });
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Top-up failed', err);
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด!',
            text: 'ไม่สามารถทำรายการได้ในขณะนี้ กรุณาลองใหม่ภายหลัง',
            confirmButtonColor: '#E50914'
          });
        }
      });
    });
  }
  
}
