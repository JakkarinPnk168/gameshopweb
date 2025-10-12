import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Header } from '../header/header';
import { DiscountService, Discount } from '../../services/discount.service';

type PanelMode = 'create' | 'edit' | null;

@Component({
  selector: 'app-discount-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './discount-manage.html',
  styleUrls: ['./discount-manage.scss']
})
export class DiscountManage implements OnInit {
  discounts: Discount[] = [];
  loading = false;
  message = '';

  panelMode: PanelMode = null;
  form: any = this.getEmptyForm();
  editId: string | null = null;

  constructor(
    private discountService: DiscountService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadDiscounts();
  }

  private getEmptyForm() {
    return {
      code: '',
      type: 'percent',
      value: 10,
      minSpend: 0,
      maxDiscount: 0,
      usageLimit: 1,
      expireAt: '',
      isActive: true,
    };
  }

  // ---------- Sidebar Navigation ----------
  goManageGames() { this.router.navigate(['/game-manage']); }
  goDiscount() { /* current */ }
  goRanking() { this.router.navigate(['/ranking']); }
  goTransactions() { this.router.navigate(['/transactions-user']); }

  // ---------- โหลดข้อมูล ----------
  loadDiscounts() {
    this.loading = true;
    this.discountService.getDiscounts().subscribe({
      next: (list) => {
        this.zone.run(() => {
          this.discounts = (list || []).map((d) => {
            let expireAt: Date | null = null;

            if (d.expireAt) {
              if (d.expireAt.seconds) {
                expireAt = new Date(d.expireAt.seconds * 1000);
              } else if (d.expireAt._seconds) {
                expireAt = new Date(d.expireAt._seconds * 1000);
              } else if (d.expireAt instanceof Date) {
                expireAt = d.expireAt;
              } else if (typeof d.expireAt === 'string' && !isNaN(Date.parse(d.expireAt))) {
                expireAt = new Date(d.expireAt);
              }
            }

            return {
              ...d,
              expireAt,
              isActive: d.isActive ?? false,
              status: d.status || this.getStatusText(d)
            };
          });

          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('load discounts error:', err);
        this.message = 'โหลดข้อมูลส่วนลดไม่สำเร็จ';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private getStatusText(d: Discount): string {
    if (!d.isActive) return 'ถูกปิดใช้งาน';
    if ((d.usedCount || 0) >= (d.usageLimit || 1)) return 'ถูกใช้ครบแล้ว';
    return 'ใช้งานได้';
  }

  // ---------- ฟังก์ชันเพิ่ม/แก้ไข ----------
  openCreate() {
    this.panelMode = 'create';
    this.form = this.getEmptyForm();
    this.editId = null;
  }

  openEdit(d: Discount) {
    this.panelMode = 'edit';
    this.editId = d.id || null;
    this.form = {
      code: d.code,
      type: d.type,
      value: d.value,
      minSpend: d.minSpend,
      maxDiscount: d.maxDiscount,
      usageLimit: d.usageLimit,
      expireAt: this.toInputDate(d.expireAt),
      isActive: d.isActive,
    };
  }

  cancelPanel() {
    this.panelMode = null;
    this.form = this.getEmptyForm();
    this.editId = null;
  }

  submit() {
    if (!this.form.code.trim()) {
      Swal.fire({ icon: 'warning', title: 'กรุณากรอกโค้ดส่วนลด' });
      return;
    }

    if (this.form.type === 'percent' && (this.form.value < 1 || this.form.value > 100)) {
      Swal.fire({ icon: 'warning', title: 'เปอร์เซ็นต์ต้องอยู่ระหว่าง 1–100' });
      return;
    }

    const payload: any = {
      code: this.form.code.toUpperCase(),
      type: this.form.type,
      value: Number(this.form.value),
      minSpend: Number(this.form.minSpend || 0),
      maxDiscount: Number(this.form.maxDiscount || 0),
      usageLimit: Number(this.form.usageLimit || 1),
      expireAt: this.form.expireAt ? new Date(this.form.expireAt) : null,
      isActive: this.form.isActive,
    };

    if (this.panelMode === 'create') {
      this.discountService.createDiscount(payload).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'เพิ่มโค้ดส่วนลดสำเร็จ', timer: 1500, showConfirmButton: false });
          this.cancelPanel();
          this.loadDiscounts();
        },
        error: (err) => {
          console.error(err);
          const msg = err?.error?.message || 'เพิ่มโค้ดไม่สำเร็จ';
          Swal.fire({ icon: 'error', title: msg });
        }
      });
    } else if (this.panelMode === 'edit' && this.editId) {
      this.discountService.updateDiscount(this.editId, payload).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'อัปเดตข้อมูลสำเร็จ', timer: 1500, showConfirmButton: false });
          this.cancelPanel();
          this.loadDiscounts();
        },
        error: (err) => {
          console.error(err);
          const msg = err?.error?.message || 'อัปเดตไม่สำเร็จ';
          Swal.fire({ icon: 'error', title: msg });
        }
      });
    }
  }

  // ---------- เปิด/ปิดการใช้งาน ----------
  toggleActive(d: Discount) {
    if (!d.id) return;

    this.discountService.toggleDiscount(d.id, !d.isActive).subscribe({
      next: (res: any) => {
        Swal.fire({ icon: 'success', title: res?.message || 'อัปเดตสถานะสำเร็จ', timer: 1200, showConfirmButton: false });
        setTimeout(() => this.loadDiscounts(), 200);
      },
      error: (err) => {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'สลับสถานะไม่สำเร็จ' });
      }
    });
  }

  // ---------- ลบ ----------
  delete(d: Discount) {
    Swal.fire({
      icon: 'warning',
      title: 'ลบโค้ดส่วนลดนี้?',
      text: `${d.code}`,
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#e74c3c'
    }).then((r) => {
      if (!r.isConfirmed || !d.id) return;

      this.discountService.deleteDiscount(d.id).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1200, showConfirmButton: false });
          this.discounts = this.discounts.filter((x) => x.id !== d.id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          Swal.fire({ icon: 'error', title: 'ลบไม่สำเร็จ' });
        }
      });
    });
  }

  // ---------- Helper ----------
  private toInputDate(v: any): string {
    if (!v) return '';
    const dt = v?.seconds ? new Date(v.seconds * 1000) : v ? new Date(v) : null;
    if (!dt) return '';
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
