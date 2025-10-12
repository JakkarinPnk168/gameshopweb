import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Discount {
  id?: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  expireAt?: any;
  isActive: boolean;
  createdAt?: any;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class DiscountService {
  private baseUrl = `${environment.apiBaseUrl}/discounts`;

  constructor(private http: HttpClient) {}

  // ---------- 🧩 ส่วนของ Admin ----------

  /** ดึงส่วนลดทั้งหมด (Admin) */
  getDiscounts() {
    return this.http.get<Discount[]>(this.baseUrl);
  }

  /** เพิ่มโค้ดส่วนลดใหม่ (Admin) */
  createDiscount(payload: Discount) {
    return this.http.post<{ success: boolean; message: string }>(
      this.baseUrl,
      payload
    );
  }

  /** แก้ไขโค้ดส่วนลด (Admin) */
  updateDiscount(id: string, payload: Partial<Discount>) {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.baseUrl}/${id}`,
      payload
    );
  }

  /** เปิด/ปิดการใช้งาน (Admin) */
  toggleDiscount(id: string, isActive: boolean) {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.baseUrl}/${id}/toggle`,
      { isActive }
    );
  }

  /** ลบโค้ดส่วนลด (Admin) */
  deleteDiscount(id: string) {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/${id}`
    );
  }

  // ---------- 👥 ส่วนของผู้ใช้ ----------

  /** ตรวจสอบโค้ดส่วนลดก่อนใช้ */
  checkCode(code: string, userId: string, total: number) {
    return this.http.get<{
      success: boolean;
      discount?: Discount;
      message?: string;
    }>(`${this.baseUrl}/check/${code}`, {
      params: { userId, total },
    });
  }

  /** เมื่อผู้ใช้ยืนยันใช้โค้ด */
  useCode(code: string, userId: string) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/use`,
      { userId, code }
    );
  }
}
