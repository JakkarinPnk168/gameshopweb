import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Order } from '../../services/api.service';
import { Header } from '../header/header';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './history.html',
  styleUrls: ['./history.scss']
})
export class History implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  error = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.error = '';

    this.api.getOrderHistory().subscribe({
      next: (res) => {
        if (res.success) {
          this.orders = res.orders.map((o: any) => ({
            ...o,
            createdAt: o.createdAt?.seconds
              ? new Date(o.createdAt.seconds * 1000)
              : o.createdAt
              ? new Date(o.createdAt)
              : null,
            status: o.status === 'completed' ? 'ซื้อแล้ว' : o.status
          }));
        } else {
          this.error = 'ไม่พบประวัติคำสั่งซื้อ';
        }
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ render view ทันที
      },
      error: (err) => {
        console.error('Failed to fetch history', err);
        this.error = 'เกิดข้อผิดพลาดในการโหลดประวัติ';
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ render view ทันที
      }
    });
  }
}
