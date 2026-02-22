import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/api/auth.service';

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const repeat = control.get('passwordRepeat')?.value;
    return password && repeat && password !== repeat ? { passwordMismatch: true } : null;
  };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <aside class="auth-aside">
        <a routerLink="/" class="auth-logo">TgLab</a>
        <div class="auth-illustration" aria-hidden="true">
          <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="360" height="280" fill="#f5f6fb" rx="0" />
            <ellipse cx="180" cy="200" rx="100" ry="40" fill="#e8eaf0" />
            <rect x="120" y="120" width="140" height="90" rx="8" fill="#e0e2e8" />
            <rect x="130" y="130" width="120" height="70" rx="4" fill="#ffffff" stroke="#d1d5db" stroke-width="1" />
            <line x1="130" y1="155" x2="250" y2="155" stroke="#e5e7eb" stroke-width="1" />
            <line x1="130" y1="170" x2="220" y2="170" stroke="#e5e7eb" stroke-width="1" />
            <circle cx="145" cy="118" r="20" fill="#5a6bff" />
            <ellipse cx="145" cy="140" rx="35" ry="45" fill="#3b82f6" />
            <ellipse cx="145" cy="125" rx="15" ry="12" fill="#1f2937" />
            <circle cx="80" cy="100" r="12" fill="#93c5fd" opacity="0.8" />
            <circle cx="280" cy="80" r="10" fill="#93c5fd" opacity="0.6" />
            <path d="M60 160 Q80 150 100 160" stroke="#cbd5e1" stroke-width="2" fill="none" stroke-linecap="round" />
            <rect x="250" y="140" width="40" height="25" rx="4" fill="#e2e8f0" />
            <rect x="70" y="180" width="35" height="22" rx="4" fill="#e2e8f0" />
          </svg>
        </div>
        <a routerLink="/" class="auth-back">← Вернуться назад</a>
      </aside>

      <main class="auth-main">
        <div class="auth-form-wrap">
          <h1 class="auth-title">Регистрация аккаунта</h1>

          @if (successMessage) {
            <p class="auth-success">{{ successMessage }}</p>
            <a routerLink="/signin" class="auth-btn auth-btn--secondary">Войти</a>
          } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="auth-field">
              <span class="auth-field__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input class="auth-input" type="email" formControlName="email" placeholder="Email" />
            </div>

            <div class="auth-field">
              <span class="auth-field__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input class="auth-input" type="password" formControlName="password" placeholder="Пароль" />
            </div>

            <div class="auth-field">
              <span class="auth-field__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input class="auth-input" type="password" formControlName="passwordRepeat" placeholder="Повторите пароль" />
            </div>

            @if (form.hasError('passwordMismatch') && form.get('passwordRepeat')?.touched) {
              <p class="auth-error">Пароли не совпадают</p>
            }
            @if (error()) {
              <p class="auth-error">{{ error() }}</p>
            }

            <button type="submit" [disabled]="form.invalid || loading()" class="auth-btn auth-btn--primary">
              {{ loading() ? 'Регистрация...' : 'Зарегистрироваться' }}
            </button>

            <div class="auth-divider">ИЛИ</div>

            <a routerLink="/signin" class="auth-btn auth-btn--secondary">Уже есть аккаунт</a>
          </form>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;
      background: #fff;
    }

    .auth-aside {
      background: #f5f6fb;
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .auth-logo {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      letter-spacing: 0.02em;
    }

    .auth-illustration {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin: 24px 0;
    }

    .auth-illustration svg {
      max-width: 100%;
      height: auto;
    }

    .auth-back {
      font-size: 14px;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .auth-main {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      background: #fff;
    }

    .auth-form-wrap {
      width: 100%;
      max-width: 400px;
    }

    .auth-title {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 32px;
      text-align: center;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .auth-field {
      display: flex;
      align-items: center;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 0 14px;
      background: #fff;
    }

    .auth-field__icon {
      color: #9ca3af;
      display: flex;
      margin-right: 10px;
    }

    .auth-input {
      flex: 1;
      padding: 14px 0;
      border: none;
      background: transparent;
      font-size: 15px;
      outline: none;
    }

    .auth-input::placeholder {
      color: #9ca3af;
    }

    .auth-success {
      color: #16a34a;
      font-size: 14px;
      margin: 0;
    }
    .auth-error {
      color: #dc2626;
      font-size: 14px;
      margin: 0;
    }

    .auth-btn {
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
      border: none;
      text-decoration: none;
      display: block;
      transition: opacity 0.2s;
    }

    .auth-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .auth-btn--primary {
      background: #22c55e;
      color: #fff;
    }

    .auth-btn--primary:hover:not(:disabled) {
      background: #16a34a;
    }

    .auth-btn--secondary {
      background: #3b82f6;
      color: #fff;
    }

    .auth-btn--secondary:hover {
      background: #2563eb;
    }

    .auth-divider {
      text-align: center;
      font-size: 14px;
      color: #9ca3af;
      margin: 8px 0;
    }

    @media (max-width: 768px) {
      .auth-layout {
        grid-template-columns: 1fr;
      }
      .auth-aside {
        min-height: 200px;
      }
    }
  `],
})
export class SignUpComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      passwordRepeat: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator() }
  );

  error = signal('');
  successMessage = '';
  loading = signal(false);

  onSubmit(): void {
    if (this.form.invalid || this.loading()) return;
    const { email, password } = this.form.getRawValue();
    this.error.set('');
    this.loading.set(true);

    this.auth.signup(email, password).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMessage = res.message;
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? err?.message ?? 'Ошибка регистрации');
      },
    });
  }
}
