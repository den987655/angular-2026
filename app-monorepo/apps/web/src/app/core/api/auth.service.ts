import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const TOKEN_KEY = 'tglab_token';
const USER_KEY = 'tglab_user';

export interface AuthUser {
  id: number;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface SignupResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = '/api/auth';
  private readonly profileBase = '/api/profile';

  constructor(private readonly http: HttpClient) {}

  signup(email: string, password: string): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.base}/signup`, { email, password });
  }

  confirmEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.base}/confirm-email`, {
      params: { token },
    });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, { email, password }).pipe(
      tap((res) => {
        this.setToken(res.token);
        this.setUser(res.user);
      })
    );
  }

  getProfile(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.profileBase}`);
  }

  changePassword(
    oldPassword: string,
    newPassword: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.profileBase}/change-password`,
      { oldPassword, newPassword }
    );
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
