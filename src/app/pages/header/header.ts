import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserData } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header {
  isLoggedIn = false;
  user: UserData | null = null;
  dropdownOpen = false;

  constructor(private auth: AuthService, private router: Router) {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.user = user; // ✅ เก็บข้อมูล user ทั้ง object
      } else {
        this.isLoggedIn = false;
        this.user = null;
      }
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  //////////เส้น
   goXPShop() {
    if (this.user?.role === 'admin') {
      this.router.navigate(['/dashboard']); // ไปหน้า admin dashboard
    } else {
      this.router.navigate(['/home']); // ไปหน้า home ของ user
    }
  }
  
  logout() {
    this.auth.clearUser();
    this.router.navigate(['/login']);  
  }

  goProfile() {
    this.router.navigate(['/profile']);
    this.dropdownOpen = false; 
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  goRegister() {
    this.router.navigate(['/register']);
  }

  goCart() {
    this.router.navigate(['/cart']);
    this.dropdownOpen = false;
  }

  goHistory() {
    this.router.navigate(['/history']);
    this.dropdownOpen = false;
  }

  goLibrary() {
    this.router.navigate(['/library']);
    this.dropdownOpen = false;
  }
}
