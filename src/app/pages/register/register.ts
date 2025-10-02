import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  providers: [ApiService]
})
export class Register {
  reg = { name: '', email: '', password: '', profileImage: '' };
  message = '';

  constructor(private api: ApiService, private router: Router) {}

  // ✅ เช็คความแข็งแรงของรหัสผ่าน
  private isPasswordStrong(password: string): boolean {
    const minLength = 6;
    // const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return password.length >= minLength && hasNumber;
  }

  doRegister() {
    // ✅ validate password ก่อนส่งไป backend
    if (!this.isPasswordStrong(this.reg.password)) {
      this.message = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัว และประกอบด้วยตัวอักษร + ตัวเลข';
      return;
    }

    this.api.register(this.reg).subscribe({
      next: (res) => {
        if (res.success && res.userId) {
          this.message = 'Register success';
          // ✅ ไปหน้า login หลังจากสมัครเสร็จ
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        } else {
          this.message = res.message || 'Register failed';
        }
      },
      error: (err) => {
        this.message = err.error?.message || 'Register failed';
      }
    });
  }
}
