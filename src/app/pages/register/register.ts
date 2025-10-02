import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule   // ✅ ต้องเพิ่มเพื่อให้ ApiService ใช้งาน HttpClient ได้
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  providers: [ApiService]   // ✅ inject Service ตรงนี้ หรือ bootstrap ใน main.ts ก็ได้
})
export class Register {
  reg = { name: '', email: '', password: '', profileImage: '' };
  message = '';

  constructor(private api: ApiService) {}

  doRegister() {
    this.api.register(this.reg).subscribe({
      next: (res) => {
        this.message = res.message || 'Register success';
        // reset ฟอร์มหลังสมัคร
        this.reg = { name: '', email: '', password: '', profileImage: '' };
      },
      error: (err) => {
        this.message = err.error?.message || 'Register failed';
      }
    });
  }
}
