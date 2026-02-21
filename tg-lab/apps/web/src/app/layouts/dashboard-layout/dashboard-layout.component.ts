import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/api/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule],
  template: `
    <div class="dashboard">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item" title="Дашборд">
            <span class="nav-icon">◉</span>
          </a>
          <a routerLink="/dashboard/invites" routerLinkActive="active" class="nav-item" title="Приглашения"><span class="nav-icon">✈</span></a>
          <a routerLink="/dashboard/audience" routerLinkActive="active" class="nav-item" title="Аудитория"><span class="nav-icon">▣</span></a>
          <a routerLink="/dashboard/accounts" routerLinkActive="active" class="nav-item" title="Аккаунты"><span class="nav-icon">👥</span></a>
          <a routerLink="/dashboard/tasks" routerLinkActive="active" class="nav-item" title="Задачи"><span class="nav-icon">⌁</span></a>
          <a routerLink="/dashboard/proxy" routerLinkActive="active" class="nav-item" title="Прокси"><span class="nav-icon">⛓</span></a>
          <button class="nav-item nav-profile" type="button" title="Профиль" (click)="openProfileDrawer()">
            <span class="nav-icon">👤</span>
          </button>
        </nav>
        <div class="sidebar-footer">
          <span class="footer-icon">?</span>
          <span class="footer-icon">T</span>
        </div>
      </aside>
      <main class="main">
        <div class="content">
          <router-outlet />
        </div>
      </main>

      <button
        class="profile-overlay"
        type="button"
        [class.open]="profileOpen"
        aria-label="Закрыть профиль"
        (click)="closeProfileDrawer()"
      ></button>

      <section class="profile-drawer" [class.open]="profileOpen">
        <header class="drawer-header">
          <h3>Профиль</h3>
          <button type="button" class="close-btn" (click)="closeProfileDrawer()">×</button>
        </header>

        <div class="drawer-user">
          <div class="avatar">{{ userInitial }}</div>
          <div class="user-meta">
            <div class="email">{{ user?.email }}</div>
            <span class="trial-badge">Trial</span>
            <span class="trial-days">2 дня</span>
          </div>
          <button type="button" class="logout-btn" title="Выйти" (click)="logout()">↗</button>
        </div>

        <section class="drawer-section">
          <div class="section-title">Интеграции</div>
          <div class="telegram-card">
            <div class="telegram-title">Telegram</div>
            <p>Привяжите аккаунт, чтобы получать важные уведомления в Telegram</p>
            <button type="button" class="primary-btn">Привязать аккаунт</button>
          </div>
        </section>

        <section class="drawer-section">
          <div class="section-title">Изменение пароля</div>
          <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
            <div class="field">
              <input type="password" formControlName="oldPassword" placeholder="Старый пароль" />
            </div>
            <div class="field">
              <input type="password" formControlName="newPassword" placeholder="Новый пароль" />
            </div>
            <div class="field">
              <input type="password" formControlName="confirmPassword" placeholder="Подтвердите новый пароль" />
            </div>
            @if (passwordError) {
              <p class="error">{{ passwordError }}</p>
            }
            @if (passwordSuccess) {
              <p class="success">{{ passwordSuccess }}</p>
            }
            <button type="submit" class="primary-btn" [disabled]="passwordForm.invalid || saving">
              {{ saving ? 'Сохранение…' : 'Изменить пароль' }}
            </button>
          </form>
        </section>
      </section>
    </div>
  `,
  styles: [`
    :host {
      --rail-bg: #d8dae2;
      --panel-bg: #eff0f4;
      --active: #5469f7;
      --text: #32384a;
      --muted: #7d8397;
      --border: #d8dbe5;
      --card: #ffffff;
    }

    .dashboard {
      display: flex;
      min-height: 100vh;
      background: var(--panel-bg);
      position: relative;
      overflow: hidden;
    }

    .sidebar {
      width: 56px;
      background: var(--rail-bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 14px 0 10px;
      border-right: 1px solid rgba(0, 0, 0, 0.04);
      z-index: 40;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    .nav-item {
      width: 34px;
      height: 34px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #5f677a;
      text-decoration: none;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: 160ms ease;
    }

    .nav-item:hover {
      background: rgba(84, 105, 247, 0.12);
    }

    .nav-item.active,
    .nav-profile.active {
      background: var(--active);
      color: #fff;
      border-radius: 999px;
      box-shadow: 0 8px 18px rgba(84, 105, 247, 0.35);
    }

    .nav-icon {
      font-size: 15px;
      line-height: 1;
    }

    .sidebar-footer {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .footer-icon {
      width: 24px;
      text-align: center;
      color: #f4f5fa;
      font-size: 16px;
      opacity: 0.9;
    }

    .main {
      flex: 1;
      min-width: 0;
      overflow: auto;
    }

    .content {
      min-height: 100vh;
      padding: 12px 14px 16px;
    }

    .profile-overlay {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 56px;
      background: rgba(27, 31, 43, 0.44);
      border: none;
      opacity: 0;
      pointer-events: none;
      transition: opacity 200ms ease;
      z-index: 20;
    }

    .profile-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }

    .profile-drawer {
      position: fixed;
      top: 0;
      left: 56px;
      bottom: 0;
      width: min(380px, calc(100vw - 56px));
      background: #fff;
      border-right: 1px solid var(--border);
      transform: translateX(-108%);
      transition: transform 240ms ease;
      z-index: 30;
      display: flex;
      flex-direction: column;
      overflow: auto;
      box-shadow: 10px 0 30px rgba(0, 0, 0, 0.18);
    }

    .profile-drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }

    .drawer-header h3 {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
      letter-spacing: 0.2px;
    }

    .close-btn {
      border: none;
      background: transparent;
      width: 30px;
      height: 30px;
      border-radius: 8px;
      font-size: 24px;
      color: #4b5163;
      cursor: pointer;
      line-height: 1;
    }

    .drawer-user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
    }

    .avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #58a8f0;
      color: #fff;
      display: grid;
      place-items: center;
      font-weight: 600;
      font-size: 20px;
      flex: 0 0 auto;
    }

    .user-meta {
      min-width: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
    }

    .email {
      font-size: 13px;
      color: #2e3342;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .trial-badge {
      font-size: 11px;
      line-height: 18px;
      padding: 0 8px;
      border-radius: 5px;
      background: #f6cd2d;
      color: #454b5e;
      font-weight: 700;
    }

    .trial-days {
      color: #5f6678;
      font-size: 12px;
    }

    .logout-btn {
      margin-left: auto;
      border: none;
      background: transparent;
      color: #3f4658;
      font-size: 22px;
      width: 30px;
      height: 30px;
      cursor: pointer;
      border-radius: 8px;
    }

    .drawer-section {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
    }

    .section-title {
      color: #2f3648;
      font-size: 23px;
      line-height: 1.15;
      margin: 6px 0 12px;
      letter-spacing: 0.2px;
    }

    .telegram-card {
      border: 1px solid #d7dbe8;
      border-radius: 9px;
      padding: 12px;
      background: #f6f8ff;
    }

    .telegram-title {
      font-size: 14px;
      font-weight: 700;
      color: #2f3648;
      margin-bottom: 8px;
    }

    .telegram-card p {
      margin: 0 0 10px;
      font-size: 13px;
      line-height: 1.35;
      color: #525a6d;
    }

    .field {
      border: 1px solid #d7dbe8;
      border-radius: 8px;
      height: 36px;
      margin-bottom: 8px;
      background: #fafbfe;
      display: flex;
      align-items: center;
      padding: 0 10px;
    }

    .field input {
      border: none;
      outline: none;
      width: 100%;
      background: transparent;
      font-size: 13px;
    }

    .primary-btn {
      width: 100%;
      height: 34px;
      border: none;
      border-radius: 8px;
      background: #4f64f3;
      color: #fff;
      font-weight: 600;
      margin-top: 6px;
      cursor: pointer;
    }

    .primary-btn:disabled {
      opacity: 0.65;
      cursor: default;
    }

    .error {
      color: #dc2626;
      margin: 4px 0;
      font-size: 12px;
    }

    .success {
      color: #16a34a;
      margin: 4px 0;
      font-size: 12px;
    }

    @media (max-width: 900px) {
      .content {
        padding: 10px;
      }
      .profile-overlay {
        left: 56px;
      }
      .profile-drawer {
        width: calc(100vw - 56px);
      }
    }
  `],
})
export class DashboardLayoutComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  profileOpen = false;
  saving = false;
  passwordError = '';
  passwordSuccess = '';

  user = this.auth.getUser();
  userInitial = this.user?.email?.[0]?.toUpperCase() ?? 'T';

  passwordForm = this.fb.nonNullable.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(4)]],
    confirmPassword: ['', Validators.required],
  });

  openProfileDrawer(): void {
    this.profileOpen = true;
  }

  closeProfileDrawer(): void {
    this.profileOpen = false;
  }

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
    location.href = '/';
  }
}
