// src/app/pages/edit-profile/edit-profile.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService, UserData } from '../../services/auth.service';
import { Header } from '../header/header';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './edit-profile.html',
  styleUrls: ['./edit-profile.scss']
})
export class EditProfile implements OnInit {
  user: UserData = {
    userId: '',
    name: '',
    email: '',
    role: 'user',
    wallet: 0,
    profileImage: ''
  };

  previewImage: string | ArrayBuffer | null = null;
  selectedFile?: File;
  message = '';
  loading = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const current = this.auth.getUser();
    if (current) {
      this.user = { ...current };
      this.previewImage = this.user.profileImage || 'assets/user.png';
    }
  }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // ตรวจชนิดและขนาดไฟล์
    const okType = ['image/jpeg','image/png','image/webp','image/gif'].includes(file.type);
    if (!okType) {
      this.message = 'ไฟล์รูปต้องเป็น JPG/PNG/WebP/GIF';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.message = 'ไฟล์ใหญ่เกิน 5MB';
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.previewImage = reader.result);
    reader.readAsDataURL(file); //แสดงพรีวิวทันที แต่ยังไม่อัปโหลด
  }

  saveProfile() {
    if (!this.user.userId) {
      this.message = 'ไม่พบผู้ใช้ ❌';
      return;
    }
    if (!this.user.name || !this.user.email) {
      this.message = 'กรุณากรอกชื่อและอีเมลให้ครบ';
      return;
    }

    this.loading = true;
    this.message = '';

    this.api.updateUser({
      userId: this.user.userId,
      name: this.user.name.trim(),
      email: this.user.email.trim(),
      file: this.selectedFile // ส่งไฟล์ไปพร้อมชื่อ/อีเมล
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.user) {
          // อัปเดต AuthService ให้เป็นข้อมูลล่าสุดทันที
          this.auth.setUser({
            userId: res.user.userId,
            name: res.user.name,
            email: res.user.email,
            role: res.user.role,
            wallet: res.user.wallet,
            profileImage: res.user.profileImage
          });
          this.message = 'บันทึกเรียบร้อย ✅';
          this.router.navigate(['/profile']);
        } else {
          this.message = res.message || 'อัปเดตไม่สำเร็จ ❌';
        }
      },
      error: (err) => {
        this.loading = false;
        this.message = err?.error?.message || 'เกิดข้อผิดพลาดในการบันทึก ❌';
      }
    });
  }

  //////////////////
  cancelEdit() {
  this.router.navigate(['/profile']);
}

}
