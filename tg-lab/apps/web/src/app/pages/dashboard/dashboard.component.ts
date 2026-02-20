import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-page">
      <div class="stats-grid">
        <article class="stat-card">
          <div class="stat-title">Аудитория</div>
          <div class="stat-value">0</div>
          <span class="stat-badge">Нет данных</span>
        </article>
        <article class="stat-card">
          <div class="stat-title">Приглашения</div>
          <div class="stat-value">0</div>
          <span class="stat-badge">Нет данных</span>
        </article>
        <article class="stat-card">
          <div class="stat-title">Рассылки</div>
          <div class="stat-value">0</div>
          <span class="stat-badge">Нет данных</span>
        </article>
        <article class="stat-card">
          <div class="stat-title">Аккаунты</div>
          <div class="stat-value">0</div>
          <span class="stat-badge">Нет данных</span>
        </article>
        <article class="stat-card">
          <div class="stat-title">Прокси</div>
          <div class="stat-value">0</div>
          <span class="stat-badge">Нет данных</span>
        </article>
        <article class="stat-card">
          <div class="stat-title">Задачи</div>
          <div class="stat-value">0</div>
          <span class="stat-badge">Нет данных</span>
        </article>
      </div>
      <div class="dashboard-row">
        <section class="chart-section">
          <div class="chart-header">
            <span>20 февраля, 2026</span>
            <div class="chart-legend">
              <span>Инвайтинг (0)</span>
              <span>Рассылка (0)</span>
            </div>
          </div>
          <div class="chart-placeholder"></div>
        </section>
        <aside class="side-panels">
          <section class="panel">
            <h3>Активность</h3>
            <div class="activity-value">0%</div>
          </section>
          <section class="panel">
            <h3>Задачи в работе</h3>
            <p class="empty-state">Нет активных и запланированных задач</p>
          </section>
        </aside>
      </div>
    </div>
  `,
  styles: `
    .dashboard-page { display: flex; flex-direction: column; gap: 24px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e5e7eb;
    }
    .stat-title { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
    .stat-value { font-size: 24px; font-weight: 700; }
    .stat-badge { font-size: 12px; color: #9ca3af; }
    .dashboard-row {
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 24px;
    }
    .chart-section {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      padding: 20px;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-size: 14px;
    }
    .chart-legend { display: flex; gap: 12px; font-size: 12px; color: #6b7280; }
    .chart-placeholder {
      height: 280px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px dashed #e5e7eb;
    }
    .side-panels { display: flex; flex-direction: column; gap: 16px; }
    .panel {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      padding: 20px;
    }
    .panel h3 { margin: 0 0 12px; font-size: 16px; }
    .activity-value { color: #16a34a; font-weight: 600; margin-bottom: 12px; }
    .empty-state { color: #9ca3af; font-size: 14px; margin: 0; }
  `,
})
export class DashboardComponent {}
