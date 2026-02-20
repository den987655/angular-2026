import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/api/auth.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="confirm-page">
      <div class="confirm-card">
        @if (loading) {
          <p>Подтверждение…</p>
        } @else if (message) {
          <h1>Готово</h1>
          <p class="confirm-success">{{ message }}</p>
          <a routerLink="/signin" class="confirm-btn">Войти</a>
        } @else if (error) {
          <h1>Ошибка</h1>
          <p class="confirm-error">{{ error }}</p>
          <a routerLink="/signup" class="confirm-btn">Регистрация</a>
        }
      </div>
    </div>
  `,
  styles: `
    .confirm-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: #f5f6fb;
    }
    .confirm-card {
      background: #fff;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.08);
      text-align: center;
      max-width: 420px;
    }
    .confirm-card h1 { margin: 0 0 16px; font-size: 24px; }
    .confirm-success { color: #16a34a; margin: 0 0 24px; }
    .confirm-error { color: #dc2626; margin: 0 0 24px; }
    .confirm-btn {
      display: inline-block;
      padding: 12px 24px;
      background: #5a6bff;
      color: #fff;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
    }
  `,
})
export class ConfirmEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  message = '';
  error = '';
  loading = true;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.error = 'Отсутствует токен подтверждения';
      this.loading = false;
      return;
    }
    this.auth.confirmEmail(token).subscribe({
      next: (res) => {
        this.message = res.message;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Недействительная ссылка';
        this.loading = false;
      },
    });
  }
}
