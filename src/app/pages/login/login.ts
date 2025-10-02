import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule 
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  providers: [ApiService] 
})
export class Login {
  loginData = { email: '', password: '' };
  message = '';

  constructor(private api: ApiService) {}

  doLogin() {
    this.api.login(this.loginData).subscribe({
      next: (res) => {
        if (res.success) {
          this.message = 'Login success';
          // เก็บข้อมูล user
          localStorage.setItem('userId', res.userId || '');
          localStorage.setItem('role', res.role || 'user');
        } else {
          this.message = res.message || 'Login failed';
        }
      },
      error: (err) => {
        this.message = err.error?.message || 'Login failed';
      }
    });
  }
}
