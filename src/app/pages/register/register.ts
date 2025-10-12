import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import Swal from 'sweetalert2'; // ✅ นำเข้า SweetAlert2

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

  private isPasswordStrong(password: string): boolean {
    const minLength = 6;
    const hasNumber = /[0-9]/.test(password);
    return password.length >= minLength && hasNumber;
  }

  doRegister() {
    if (!this.isPasswordStrong(this.reg.password)) {
      this.showAlert('รหัสผ่านต้องมีอย่างน้อย 6 ตัว และมีตัวเลข', 'warning');
      return;
    }

    this.api.register(this.reg).subscribe({
      next: (res) => {
        if (res.success && res.userId) {
          // ✅ สมัครสำเร็จ
          Swal.fire({
            icon: 'success',
            title: 'สมัครสมาชิกสำเร็จ!',
            text: 'กำลังไปยังหน้าเข้าสู่ระบบ...',
            timer: 2000,            // ปิดอัตโนมัติใน 2 วิ
            showConfirmButton: false
          });

          // ✅ ไปหน้า login หลังปิด
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else {
          this.showAlert(res.message || 'สมัครไม่สำเร็จ ❌', 'error');
        }
      },
      error: (err) => {
        this.showAlert(err.error?.message || 'เกิดข้อผิดพลาด ❌', 'error');
      }
    });
  }

  // ✅ ฟังก์ชัน SweetAlert ช่วยแสดงข้อความ
  private showAlert(msg: string, icon: 'success' | 'error' | 'warning') {
    Swal.fire({
      icon,
      title: msg,
      timer: 2000,
      showConfirmButton: false
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
