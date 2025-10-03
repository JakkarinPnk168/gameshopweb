import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserData {
  userId: string;
  name: string;
  email: string;
  role: string;
  wallet: number;
  profileImage: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<UserData | null>(null);
  user$ = this.userSubject.asObservable();
  
  private isBrowser = typeof window !== 'undefined';
  private storage: Storage;

  constructor() {
    this.storage = this.isBrowser ? localStorage : ({} as Storage);

    if (this.isBrowser) {
      const uid = this.storage.getItem('userId');
      if (uid) {
        this.userSubject.next({
          userId: uid,
          name: this.storage.getItem('name') || 'User',
          email: this.storage.getItem('email') || '',
          role: this.storage.getItem('role') || 'user',
          wallet: Number(this.storage.getItem('wallet') || 0),
          profileImage: this.storage.getItem('profileImage') || ''
        });
      }
    }
  }

  // ✅ เซ็ต user หลัง login / update
  setUser(user: UserData) {
    if (this.isBrowser) {
      this.storage.setItem('userId', user.userId);
      this.storage.setItem('name', user.name);
      this.storage.setItem('email', user.email);
      this.storage.setItem('role', user.role);
      this.storage.setItem('wallet', user.wallet.toString());
      this.storage.setItem('profileImage', user.profileImage || '');
    }
    this.userSubject.next(user);
  }

  // ✅ clear user แบบไม่ลบทุกค่าใน storage
  clearUser() {
    if (this.isBrowser) {
      this.storage.removeItem('userId');
      this.storage.removeItem('name');
      this.storage.removeItem('email');
      this.storage.removeItem('role');
      this.storage.removeItem('wallet');
      this.storage.removeItem('profileImage');
    }
    this.userSubject.next(null);
  }

  // ✅ ดึง user ปัจจุบัน
  getUser(): UserData | null {
    return this.userSubject.value;
  }

  // ✅ สลับ storage
  useSessionStorage() {
    if (this.isBrowser) this.storage = sessionStorage;
  }

  useLocalStorage() {
    if (this.isBrowser) this.storage = localStorage;
  }
}
