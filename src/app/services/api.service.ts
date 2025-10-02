import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  register(data: { name: string; email: string; password: string; profileImage?: string }) {
    return this.http.post<{ success: boolean; userId?: string; message?: string }>(
      `${this.base}/register`,
      data
    );
  }

  login(data: { email: string; password: string }) {
  return this.http.post<{
    success: boolean;
    userId?: string;
    name?: string;
    role?: string;
    wallet?: number;
    profileImage?: string;
    message?: string;
  }>(`${this.base}/login`, data);
}

}
