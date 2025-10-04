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
  showPopup = false;

  constructor(private api: ApiService, private router: Router) {}

  private isPasswordStrong(password: string): boolean {
    const minLength = 6;
    const hasNumber = /[0-9]/.test(password);
    return password.length >= minLength && hasNumber;
  }

  doRegister() {
    if (!this.isPasswordStrong(this.reg.password)) {
      this.showMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัว และมีตัวเลข');
      return;
    }

    this.api.register(this.reg).subscribe({
      next: (res) => {
        if (res.success && res.userId) {
          this.showMessage('สมัครสมาชิกสำเร็จ ✅');
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.showMessage(res.message || 'สมัครไม่สำเร็จ ❌');
        }
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'เกิดข้อผิดพลาด ❌');
      }
    });
  }

  // ✅ ฟังก์ชันช่วยแสดง popup
  private showMessage(msg: string) {
    this.message = msg;
    this.showPopup = true;
    setTimeout(() => (this.showPopup = false), 2000);
  }

  goToLogin() {
  this.router.navigate(['/login']);
}


}

