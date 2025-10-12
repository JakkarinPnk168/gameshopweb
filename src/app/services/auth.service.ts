import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserData {
  userId: string;
  name: string;
  email: string;
  role: string;
  wallet: number;
  profileImage: string;
  token?: string;
  library?: string[];
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
      const token = this.storage.getItem('token');
      if (uid) {
        this.userSubject.next({
          userId: uid,
          name: this.storage.getItem('name') || 'User',
          email: this.storage.getItem('email') || '',
          role: this.storage.getItem('role') || 'user',
          wallet: Number(this.storage.getItem('wallet') || 0),
          profileImage: this.storage.getItem('profileImage') || '',
          token: token || '',
        });
      }
    }
  }

  // ✅ ฟังก์ชันดึงข้อมูลจาก localStorage
  private loadUserFromStorage(): UserData | null {
    const uid = this.storage.getItem('userId');
    if (!uid) return null;

    return {
      userId: uid,
      name: this.storage.getItem('name') || 'User',
      email: this.storage.getItem('email') || '',
      role: this.storage.getItem('role') || 'user',
      wallet: Number(this.storage.getItem('wallet') || 0),
      profileImage: this.storage.getItem('profileImage') || '',
    };
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
      // this.storage.setItem('token', user.token || '');
      if (user.token) {
        this.storage.setItem('token', user.token);
      } else {
        this.storage.removeItem('token');
      }
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
      this.storage.removeItem('token');
    }
    this.userSubject.next(null);
  }

  // ✅ ดึง user ปัจจุบัน
  getUser(): UserData | null {
    let user = this.userSubject.value;
    if (!user && this.isBrowser) {
      const uid = this.storage.getItem('userId');
      if (uid) {
        const libraryKey = `library_${uid}`;
        const library = JSON.parse(this.storage.getItem(libraryKey) || '[]');
        user = {
          userId: uid,
          name: this.storage.getItem('name') || 'User',
          email: this.storage.getItem('email') || '',
          role: this.storage.getItem('role') || 'user',
          wallet: Number(this.storage.getItem('wallet') || 0),
          profileImage: this.storage.getItem('profileImage') || '',
          token: this.storage.getItem('token') || '',
          library,
        };
        this.userSubject.next(user);
      }
    } else if (user && !user.library) {
      // ถ้ามี user แต่ library ยัง undefined
      const libraryKey = `library_${user.userId}`;
      user.library = JSON.parse(this.storage.getItem(libraryKey) || '[]');
    }
    return user;
  }

  getToken(): string | null {
    const user = this.getUser();
    if (user?.token) return user.token;
    if (this.isBrowser) return this.storage.getItem('token') || null;
    return null;
  }

  // ✅ เช็กว่า login อยู่หรือไม่
  isLoggedIn(): boolean {
    const user = this.getUser();
    return !!user && !!user.userId;
  }

  // ✅ ใช้ sessionStorage แทน (ถ้าต้องการ)
  useSessionStorage() {
    if (this.isBrowser) this.storage = sessionStorage;
  }

  useLocalStorage() {
    if (this.isBrowser) this.storage = localStorage;
  }

  updateWallet(newWallet: number): void {
    const user = this.getUser();
    if (!user) return;

    user.wallet = newWallet; // ✅ แทนที่ด้วยยอดที่เหลือจริงจาก backend
    this.setUser(user);
  }
  addToLibrary(gameIds: string[]): void {
    const user = this.getUser();
    if (!user) return;

    const libraryKey = `library_${user.userId}`;
    const stored = localStorage.getItem(libraryKey);
    const library = stored ? JSON.parse(stored) : [];

    const newLibrary = [...library, ...gameIds.filter((id) => !library.includes(id))];

    localStorage.setItem(libraryKey, JSON.stringify(newLibrary));
    user.library = newLibrary;
    this.setUser(user);
  }
  onAuthStateChanged(callback: (user: UserData | null) => void) {
    this.user$.subscribe(callback);
  }
}
