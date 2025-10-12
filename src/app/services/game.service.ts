import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, of, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface Game {
  id?: string;
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  imageUrl?: string;
  totalSold?: number;
  releasedAt?: { seconds: number; nanoseconds: number } | Date | null;
}

export interface Category {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private baseUrl = `${environment.apiBaseUrl}/games`;
  private categoryUrl = `${environment.apiBaseUrl}/categories`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  // -------------------- Category --------------------
  getCategories() {
    return this.http.get<any>(this.categoryUrl).pipe(
      map((res) => res.categories || res || []),
      catchError((err) => {
        console.error('❌ Error loading categories:', err);
        return of([]);
      })
    );
  }

  // -------------------- Games CRUD --------------------

  /** ✅ เพิ่มเกม */
  addGame(formData: FormData) {
    return this.http.post<Game>(this.baseUrl, formData, { headers: this.getHeaders() }).pipe(
      tap(() => console.log('✅ Added new game')),
      catchError((err) => {
        console.error('❌ Error adding game:', err);
        return of(err);
      })
    );
  }

  /** ✅ โหลดเกมทั้งหมด */
  getAllGames(limit: number = 12, categoryId?: string) {
    let url = `${this.baseUrl}?limit=${limit}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map((res) => res.games || res || []),
      catchError((err: HttpErrorResponse) => {
        console.error('❌ Error loading games:', err);
        return of([]);
      })
    );
  }

  /** ✅ โหลดเกมจาก id */
  getGameById(id: string) {
    return this.http.get<any>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map((res) => res.game || res),
      catchError((err) => {
        console.error('❌ Error loading game:', err);
        return of(null);
      })
    );
  }

  /** ✅ แก้ไขเกม */
  updateGame(id: string, formData: FormData) {
    return this.http.put(`${this.baseUrl}/${id}`, formData, { headers: this.getHeaders() }).pipe(
      tap(() => console.log('✅ Updated game:', id)),
      catchError((err) => {
        console.error('❌ Error updating game:', err);
        return of(err);
      })
    );
  }

  /** ✅ ลบเกม */
  deleteGame(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => console.log('🗑️ Deleted game:', id)),
      catchError((err) => {
        console.error('❌ Error deleting game:', err);
        return of(err);
      })
    );
  }

  // -------------------- Top Selling Games --------------------
  getTopGames(limit: number = 5) {
    return this.http
      .get<Game[]>(`${this.baseUrl}/top/list?limit=${limit}`, { headers: this.getHeaders() })
      .pipe(
        map((res: any) => (Array.isArray(res) ? res : [])),
        catchError((err: HttpErrorResponse) => {
          console.error('❌ Error loading top games:', err);
          return of([]);
        })
      );
  }

  getTopGamesByDate(date?: string, limit: number = 10) {
    let url = `${this.baseUrl}/top/list?limit=${limit}`;
    if (date) url += `&date=${date}`;

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map((res: any) => {
        if (Array.isArray(res)) return res;
        if (res && res.message && !res.success) return [];
        return [];
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('❌ API Error (getTopGamesByDate):', err);
        return of({
          success: false,
          message:
            err.status === 500
              ? 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์'
              : 'ไม่สามารถโหลดข้อมูลได้',
          data: [],
        });
      })
    );
  }

  // -------------------- Transactions --------------------
  getAllTransactions() {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/transactions/all`, {
      headers: this.getHeaders(),
    });
  }

  // -------------------- Helpers --------------------
  convertTimestamp(t: any): Date | null {
    if (!t) return null;
    const seconds = t.seconds ?? t._seconds ?? null;
    if (!seconds) return null;
    return new Date(seconds * 1000);
  }

  formatReleasedAt(value: any): string {
    if (!value) return '-';
    let date: Date | null = null;

    if (value instanceof Date) date = value;
    else if (value.seconds) date = new Date(value.seconds * 1000);
    else if (value._seconds) date = new Date(value._seconds * 1000);

    if (!date) return '-';
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getRankingByDateRange(start: Date, end: Date) {
    const startISO = start.toISOString();
    const endISO = end.toISOString();
    return this.http.get<any[]>(`${this.baseUrl}/ranking?start=${startISO}&end=${endISO}`, {
      headers: this.getHeaders(),
    });
  }
}
