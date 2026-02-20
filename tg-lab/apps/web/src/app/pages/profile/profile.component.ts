import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/api/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="profile-page">
      <div class="profile-card">
        <div class="profile-header">
          <h2>Профиль</h2>
          <a routerLink="/dashboard" class="close-btn" title="Закрыть">×</a>
        </div>
        <div class="profile-info">
          <div class="avatar">{{ userInitial }}</div>
          <div class="info">
            <div class="email">{{ user?.email }}</div>
            <span class="trial-badge">Trial · 2 дня</span>
          </div>
          <button type="button" class="logout-btn" (click)="logout()" title="Выйти">↗</button>
        </div>
        <section class="profile-section">
          <h3>Интеграции</h3>
          <p>Привяжите аккаунт Telegram для уведомлений.</p>
          <button type="button" class="btn btn-primary">Привязать аккаунт</button>
        </section>
        <section class="profile-section">
          <h3>Изменение пароля</h3>
          <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
            <div class="field">
              <span class="field-icon">🔒</span>
              <input type="password" formControlName="oldPassword" placeholder="Старый пароль" />
            </div>
            <div class="field">
              <span class="field-icon">🔒</span>
              <input type="password" formControlName="newPassword" placeholder="Новый пароль" />
            </div>
            <div class="field">
              <span class="field-icon">🔒</span>
              <input type="password" formControlName="confirmPassword" placeholder="Подтвердите новый пароль" />
            </div>
            @if (passwordError) {
              <p class="error">{{ passwordError }}</p>
            }
            @if (passwordSuccess) {
              <p class="success">{{ passwordSuccess }}</p>
            }
            <button type="submit" [disabled]="passwordForm.invalid || saving" class="btn btn-primary">
              {{ saving ? 'Сохранение…' : 'Изменить пароль' }}
            </button>
          </form>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { max-width: 560px; }
    .profile-card {
      background: #fff;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }
    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    .profile-header h2 { margin: 0; font-size: 18px; }
    .close-btn { font-size: 24px; color: #6b7280; text-decoration: none; }
    .profile-info {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
    }
    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #5a6bff;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 600;
    }
    .info { flex: 1; }
    .email { font-weight: 500; margin-bottom: 4px; }
    .trial-badge {
      font-size: 12px;
      background: #fef3c7;
      color: #92400e;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .logout-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: #f3f4f6;
      border-radius: 10px;
      cursor: pointer;
      font-size: 18px;
    }
    .profile-section {
      padding: 24px;
      border-top: 1px solid #e5e7eb;
    }
    .profile-section h3 { margin: 0 0 8px; font-size: 16px; }
    .profile-section p { margin: 0 0 16px; font-size: 14px; color: #6b7280; }
    .field {
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 12px;
    }
    .field-icon { font-size: 18px; }
    .field input { flex: 1; border: none; outline: none; font-size: 15px; }
    .error { color: #dc2626; font-size: 14px; margin: 0 0 12px; }
    .success { color: #16a34a; font-size: 14px; margin: 0 0 12px; }
    .btn { padding: 12px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; border: none; }
    .btn-primary { background: #5a6bff; color: #fff; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  `],
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  user = this.auth.getUser();
  userInitial = this.user?.email?.[0]?.toUpperCase() ?? 'T';

  passwordForm = this.fb.nonNullable.group(
    {
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required],
    }
  );
  passwordError = '';
  passwordSuccess = '';
  saving = false;

  onSubmit(): void {
    const { oldPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    this.passwordError = '';
    this.passwordSuccess = '';
    if (newPassword !== confirmPassword) {
      this.passwordError = 'Пароли не совпадают';
      return;
    }
    this.saving = true;
    this.auth.changePassword(oldPassword, newPassword).subscribe({
      next: (res) => {
        this.passwordSuccess = res.message;
        this.passwordForm.reset();
        this.saving = false;
      },
      error: (err) => {
        this.passwordError = err?.error?.message ?? 'Ошибка смены пароля';
        this.saving = false;
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
