import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserData {
  userId: string;
  name: string;
  role: string;
  wallet: number;
  profileImage: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<UserData | null>(null);
  user$ = this.userSubject.asObservable();

  private isBrowser: boolean;
  private storage: Storage; // ✅ เลือกว่าจะใช้ localStorage หรือ sessionStorage

  constructor() {
    this.isBrowser = typeof window !== 'undefined';

    // ✅ เลือก storage ที่จะใช้ (เปลี่ยนตรงนี้เป็น sessionStorage ถ้าอยากเก็บแค่ตอนเปิดแท็บ)
    this.storage = this.isBrowser ? localStorage : ({} as Storage);

    if (this.isBrowser) {
      const uid = this.storage.getItem('userId');
      if (uid) {
        this.userSubject.next({
          userId: uid,
          name: this.storage.getItem('name') || 'User',
          role: this.storage.getItem('role') || 'user',
          wallet: Number(this.storage.getItem('wallet') || 0),
          profileImage: this.storage.getItem('profileImage') || ''
        });
      }
    }
  }

  // ✅ สลับไปใช้ sessionStorage ได้
  useSessionStorage() {
    if (this.isBrowser) {
      this.storage = sessionStorage;
    }
  }

  useLocalStorage() {
    if (this.isBrowser) {
      this.storage = localStorage;
    }
  }

  setUser(user: UserData) {
    if (this.isBrowser) {
      this.storage.setItem('userId', user.userId);
      this.storage.setItem('name', user.name);
      this.storage.setItem('role', user.role);
      this.storage.setItem('wallet', user.wallet.toString());
      this.storage.setItem('profileImage', user.profileImage || '');
    }
    this.userSubject.next(user);
  }

  clearUser() {
    if (this.isBrowser) {
      this.storage.clear();
    }
    this.userSubject.next(null);
  }
}
