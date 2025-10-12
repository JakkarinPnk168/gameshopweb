import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService, UserData } from './auth.service';

export interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  price: number;
  quantity: number;
  selected: boolean;
  disabled?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor(private auth: AuthService, private api: ApiService) {
    // ฟัง event การเปลี่ยนแปลง user
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.loadCartFromStorage(user);
      } else {
        this.cartItems = [];
        this.cartSubject.next([]);
      }
    });
  }

  private saveCart() {
    const user = this.auth.getUser();
    if (user) {
      localStorage.setItem(`cart_${user.userId}`, JSON.stringify(this.cartItems));
    }
    this.cartSubject.next([...this.cartItems]);
  }

  private loadCartFromStorage(user: UserData) {
    const stored = localStorage.getItem(`cart_${user.userId}`);
    this.cartItems = stored ? JSON.parse(stored) : [];
    this.cartSubject.next([...this.cartItems]);
  }

  getCart(): CartItem[] {
    return this.cartItems;
  }

  addToCart(item: CartItem) {
    const existing = this.cartItems.find(i => i.id === item.id);
    if (existing) existing.quantity += item.quantity;
    else this.cartItems.push(item);
    this.saveCart();

    // sync backend
    this.api.addToCart(item.id, item.quantity).subscribe();
  }

  removeItem(id: string) {
    this.cartItems = this.cartItems.filter(i => i.id !== id);
    this.saveCart();
    this.api.removeFromCart(id).subscribe();
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }

  updateItemSelection(itemId: string, selected: boolean) {
    const item = this.cartItems.find(i => i.id === itemId);
    if (item) {
      item.selected = selected;
      this.saveCart();
    }
  }
}
