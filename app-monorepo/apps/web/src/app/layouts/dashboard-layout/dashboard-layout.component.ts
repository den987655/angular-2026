import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item" title="Дашборд">
            <span class="nav-icon">◉</span>
          </a>
          <a routerLink="/dashboard/invites" class="nav-item" title="Приглашения"><span class="nav-icon">✈</span></a>
          <a routerLink="/dashboard/audience" class="nav-item" title="Аудитория"><span class="nav-icon">📁</span></a>
          <a routerLink="/dashboard/accounts" class="nav-item" title="Аккаунты"><span class="nav-icon">👥</span></a>
          <a routerLink="/dashboard/tasks" class="nav-item" title="Задачи"><span class="nav-icon">✈</span></a>
          <a routerLink="/dashboard/proxy" class="nav-item" title="Прокси"><span class="nav-icon">🔗</span></a>
          <a routerLink="/dashboard/profile" routerLinkActive="active" class="nav-item" title="Профиль"><span class="nav-icon">👤</span></a>
        </nav>
        <div class="sidebar-footer">
          <span class="nav-icon">?</span>
          <span class="nav-icon">T</span>
        </div>
      </aside>
      <main class="main">
        <header class="header">
          <span class="header-title">Дашборд</span>
          <div class="header-actions">
            <span class="icon-btn">🔔</span>
            <div class="user-menu">
              <span class="user-avatar">T</span>
              <span class="user-arrow">▼</span>
            </div>
          </div>
        </header>
        <div class="content">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      min-height: 100vh;
      background: #f5f6fb;
    }
    .sidebar {
      width: 64px;
      background: #e8eaf0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 0;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .nav-item {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      text-decoration: none;
    }
    .nav-item:hover, .nav-item.active {
      background: #5a6bff;
      color: #fff;
    }
    .nav-icon { font-size: 18px; }
    .sidebar-footer {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .header {
      background: #fff;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e5e7eb;
    }
    .header-title { font-size: 18px; font-weight: 600; }
    .header-actions { display: flex; align-items: center; gap: 16px; }
    .icon-btn { cursor: pointer; }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #5a6bff;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .content { flex: 1; padding: 24px; }
  `],
})
export class DashboardLayoutComponent {}
