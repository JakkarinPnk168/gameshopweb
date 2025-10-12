import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserData } from '../../services/auth.service';
import { ApiService, Category } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header {
  isLoggedIn = false;
  user: UserData | null = null;
  dropdownOpen = false;

  // ✅ ใช้ตัวเดียวพอ
  searchText: string = '';
  selectedCategory: Category | null = null;

  categories: Category[] = [];
  categoryDropdownOpen = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private api: ApiService
  ) {
    this.auth.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.user = user;
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  get wallet(): number {
    return this.auth.getUser()?.wallet ?? 0;
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (res) => {
        if (res.success) this.categories = res.categories;
      },
      error: (err) => console.error('Error fetching categories:', err)
    });
  }

  // ✅ เรียกตอนกด Enter หรือไอคอนค้นหา
  searchGames() {
    const search = this.searchText.trim();
    const categoryId = this.selectedCategory ? this.selectedCategory.id : null;

    this.router.navigate(['/home'], {
      queryParams: {
        search: search || null,
        categoryId: categoryId || null
      }
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleCategoryDropdown() {
    this.categoryDropdownOpen = !this.categoryDropdownOpen;
  }

  selectCategory(cat: Category) {
    this.selectedCategory = cat;
    this.categoryDropdownOpen = false;
    this.searchGames(); // ✅ เมื่อเลือก category จะค้นหาทันที
  }

  // --- ปุ่มเมนูต่าง ๆ ---
  goXPShop() {
    if (this.user?.role === 'admin') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  logout() {
    this.auth.clearUser();
    this.router.navigate(['/login']);
  }

  goHome() { this.router.navigate(['/home']); }
  goGameManage() { this.router.navigate(['/game-manage']); }
  goProfile() { this.router.navigate(['/profile']); this.dropdownOpen = false; }
  goLogin() { this.router.navigate(['/login']); }
  goRegister() { this.router.navigate(['/register']); }
  goCart() { this.router.navigate(['/mycart']); this.dropdownOpen = false; }
  goHistory() { this.router.navigate(['/history']); this.dropdownOpen = false; }
  goLibrary() { this.router.navigate(['/mylibrary']); this.dropdownOpen = false; }
  
}
