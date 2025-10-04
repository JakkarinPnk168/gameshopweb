import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ✅ สมัครสมาชิก
  register(data: { name: string; email: string; password: string; profileImage?: string }) {
    return this.http.post<{ success: boolean; userId?: string; message?: string }>(
      `${this.base}/register`,
      data
    );
  }

  // ✅ login รองรับทั้ง email/username
  login(data: { identifier: string; password: string }) {
    return this.http.post<{
      success: boolean;
      userId?: string;
      name?: string;
      email?: string;
      role?: string;
      wallet?: number;
      profileImage?: string;
      message?: string;
    }>(`${this.base}/login`, data);
  }

  // src/app/services/api.service.ts
updateUser(user: { userId: string; name: string; email: string; file?: File }) {
  const formData = new FormData();
  formData.append('name', user.name);
  formData.append('email', user.email);
  if (user.file) formData.append('image', user.file);

  return this.http.put<{
    success: boolean;
    message?: string;
    user?: {
      userId: string;
      name: string;
      email: string;
      role: string;
      wallet: number;
      profileImage: string;
    };
  }>(`${this.base}/users/${user.userId}`, formData);
}




  // uploadImage(file: File) {
  //   const formData = new FormData();
  //   formData.append("image", file);

  //   return this.http.post<{ success: boolean; url?: string }>(
  //     `${this.base}/upload`,
  //     formData
  //   );
  // }

}
