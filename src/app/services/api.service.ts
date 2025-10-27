import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';

export interface Game {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  releasedAt?: any;
  totalSold: number;
  rank?: number;                // ✅ อันดับเกม
  category?: string;            // ✅ id หรือชื่อประเภทแบบเดิม
  categoryName?: string;        // ✅ ชื่อประเภทเกม (เพิ่มใหม่)
  gameType?: string;
  tags?: { name: string; type: 'primary' | 'secondary' }[];
}

let gamesData: Game[] = [];

export interface Order {
  id: string;
  userId: string;
  gameName: string;
  quantity: number;
  price: number;
  status: string;
  redeemCode: string;
  createdAt: Date | null;
}

export interface TopUpHistory {
  amount: number;
  method: string;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CartItem {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  price: number;
  selected: boolean; // สำหรับติดตามสถานะ checkbox
}
export interface CartItemAPI {
  gameId: string;
  quantity: number;
}
export interface CartOrder {
  gameId: string;
  gameName: string;
  quantity: number;
  price: number;
  status: string;
  redeemCode: string;
  createdAt?: any;
}
const orders: CartOrder[] = [];
export interface CheckoutResponse {
  success: boolean;
  newWallet?: number;
  orders?: CartOrder[];
}

interface GameData {
  id: string;
  name: string;
  price: number;
  totalSold: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  // [x: string]: any;
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  //  สมัครสมาชิก
  register(data: { name: string; email: string; password: string; profileImage?: string }) {
    return this.http.post<{ success: boolean; userId?: string; message?: string }>(
      `${this.base}/register`,
      data
    );
  }

  // login รองรับทั้ง email/username
  login(data: { identifier: string; password: string }) {
  return this.http.post<{
    success: boolean;
    userId?: string;
    name?: string;
    email?: string;
    role?: string;
    wallet?: number;
    profileImage?: string;
    token?: string;     
    message?: string;
  }>(`${this.base}/login`, data);
}



  updateUser(user: { userId: string; name: string; email: string; file?: File }) {
    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('email', user.email);
    if (user.file) formData.append('image', user.file);

    return this.http.put<{
      success: boolean;
      message?: string;
      user?: {
        userId: string;
        name: string;
        email: string;
        role: string;
        wallet: number;
        profileImage: string;
      };
    }>(`${this.base}/users/${user.userId}`, formData);
  }

  // api.service.ts
getGames(search: string = '', categoryId: string | null = null) {
  let params = new URLSearchParams();
  if (search) params.append('search', search);
  if (categoryId) params.append('categoryId', categoryId);
  return this.http.get<{ success: boolean; games: Game[] }>(`${this.base}/games?${params.toString()}`);
}


  // =================== Firebase Top-Up ===================
  topUpWallet(
  amount: number,
  method: string
): Observable<{ success: boolean; newWallet?: number; message?: string }> {
  const user = this.auth.getUser();
  if (!user) throw new Error('User not logged in');

  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  });

  return this.http.post<{ success: boolean; newWallet?: number; message?: string }>(
    `${this.base}/users/topup`,
    { amount, method },
    { headers }
  );
}


getTopUpHistory(): Observable<{ success: boolean; history: TopUpHistory[] }> {
  const user = this.auth.getUser();
  if (!user) throw new Error('User not logged in');

  const token = localStorage.getItem('token');
  console.log("🟦 Sending token in header:", token);

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  });

  return this.http.get<{ success: boolean; history: TopUpHistory[] }>(
    `${this.base}/topup-history`,
    { headers }
  );
}


  getCategories(): Observable<{ success: boolean; categories: Category[] }> {
    return this.http.get<{ success: boolean; categories: Category[] }>(`${this.base}/categories`);
  }

  // api.service.ts
  buyGame(gameId: string) {
    const user = this.auth.getUser();
    if (!user) throw new Error('User not logged in');

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    return this.http.post<{
      success: boolean;
      newWallet?: number;
      order?: any;
    }>(`${this.base}/orders/buy`, { gameId }, { headers });
  }
  getMyGames(): Observable<{ success: boolean; games: Game[] }> {
    const user = this.auth.getUser();
    if (!user) throw new Error('User not logged in');

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    return this.http.get<{ success: boolean; games: Game[] }>(`${this.base}/users/my-games`, {
      headers,
    });
  }

  getOrderHistory(): Observable<{ success: boolean; orders: Order[] }> {
    const user = this.auth.getUser();

    if (!user) {
      // ถ้า user ไม่ล็อกอิน คืนค่า empty array
      return of({ success: true, orders: [] });
    }

    const token = this.auth.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    return this.http.get<{ success: boolean; orders: Order[] }>(`${this.base}/orders/my-history`, {
      headers,
    });
  }
  getGamesByCategory(categoryId: string, search?: string) {
    let url = `${this.base}/games?categoryId=${categoryId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get<{ success: boolean; games: Game[] }>(url);
  }


  getGameById(id: string): Observable<{ success: boolean; game?: Game; message?: string }> {
  return this.http.get<{ success: boolean; game?: Game; message?: string }>(
    `${this.base}/games/${id}`
  ).pipe(
    map((res: any) => {
      // ✅ แปลง timestamp object เป็น Date (ถ้ามี)
      if (
        res?.game?.releasedAt &&
        typeof res.game.releasedAt === 'object' &&
        'seconds' in res.game.releasedAt
      ) {
        res.game.releasedAt = new Date(res.game.releasedAt.seconds * 1000);
      }
      return res;
    })
  );
}


  // ดึงตะกร้าผู้ใช้จาก Firestore
  getCart(userId: string): Observable<{ success: boolean; items: CartItemAPI[] }> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    return this.http.get<{ success: boolean; items: CartItemAPI[] }>(
      `${this.base}/users/cart?userId=${userId}`,
      { headers }
    );
  }

  addToCart(gameId: string, quantity = 1) {
    const token = this.auth.getToken();
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    return this.http.post<{ success: boolean }>(
      `${this.base}/users/cart/add`,
      { gameId, quantity },
      { headers }
    );
  }

  removeFromCart(gameId: string) {
    const token = this.auth.getToken();
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
    return this.http.post<{ success: boolean }>(
      `${this.base}/users/cart/remove`,
      { gameId },
      { headers }
    );
  }

  checkoutCart(items: { gameId: string; quantity: number }[], promoCode?: string, token?: string) {
    const userToken = token || this.auth.getToken();
    if (!userToken) throw new Error('User token is required');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    });

    return this.http.post<CheckoutResponse>(
      `${this.base}/users/cart/checkout`,
      { items, promoCode },
      { headers }
    );
  }

  validatePromoCode(code: string, subtotal: number) {
    const token = this.auth.getToken();
    return this.http.post(
      `${this.base}/users/cart/validate-promo`,
      { promoCode: code, subtotal },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
  }

  
}
