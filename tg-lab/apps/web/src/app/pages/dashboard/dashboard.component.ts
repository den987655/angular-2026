import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ChartConfiguration,
  ChartData,
  ChartOptions,
  ChartType,
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="dashboard-page">
      <div class="stats-grid">
        <article class="stat-card">
          <div class="stat-title">Аудитория</div>
          <div class="stat-value">3 240</div>
          <span class="stat-badge">+12% за неделю</span>
        </article>
        <article class="stat-card">
          <div class="stat-title">Приглашения</div>
          <div class="stat-value">1 482</div>
          <span class="stat-badge">24% принято</span>
        </article>
        <article class="stat-card">
          <div class="stat-title">Рассылки</div>
          <div class="stat-value">86</div>
          <span class="stat-badge">7 активных</span>
        </article>
        <article class="stat-card">
          <div class="stat-title">Аккаунты</div>
          <div class="stat-value">128</div>
          <span class="stat-badge">12 заблокированы</span>
        </article>
        <article class="stat-card">
          <div class="stat-title">Прокси</div>
          <div class="stat-value">64</div>
          <span class="stat-badge">98% аптайм</span>
        </article>
        <article class="stat-card">
          <div class="stat-title">Задачи</div>
          <div class="stat-value">41</div>
          <span class="stat-badge">6 в работе</span>
        </article>
      </div>
      <div class="dashboard-row">
        <section class="chart-section">
          <div class="chart-header">
            <span>Инвайты · последние 7 дней</span>
            <div class="chart-legend">
              <span class="legend-dot invites">Отправлено</span>
              <span class="legend-dot accepted">Принято</span>
            </div>
          </div>
          <canvas
            baseChart
            [data]="invitesLineData"
            [options]="lineOptions"
            [type]="lineType"
            class="chart-canvas"
          ></canvas>
        </section>

        <aside class="side-panels">
          <section class="panel">
            <h3>Активность</h3>
            <div class="activity-value">74%</div>
            <canvas
              baseChart
              [data]="activityLineData"
              [options]="miniLineOptions"
              [type]="lineType"
              class="chart-mini"
            ></canvas>
          </section>
          <section class="panel">
            <h3>Задачи в работе</h3>
            <p class="empty-state">6 активных · 12 запланированных</p>
          </section>
        </aside>
      </div>

      <div class="dashboard-row charts-row">
        <section class="chart-section">
          <div class="chart-header">
            <span>Задачи по типам</span>
            <div class="chart-legend">
              <span class="legend-dot tasks">Запланировано</span>
            </div>
          </div>
          <canvas
            baseChart
            [data]="tasksBarData"
            [options]="barOptions"
            [type]="barType"
            class="chart-canvas"
          ></canvas>
        </section>
        <section class="chart-section">
          <div class="chart-header">
            <span>Аккаунты</span>
            <div class="chart-legend">
              <span class="legend-dot accounts">Статусы</span>
            </div>
          </div>
          <canvas
            baseChart
            [data]="accountsDoughnutData"
            [options]="doughnutOptions"
            [type]="doughnutType"
            class="chart-canvas chart-doughnut"
          ></canvas>
        </section>
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
      min-height: 320px;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-size: 14px;
    }
    .chart-legend { display: flex; gap: 12px; font-size: 12px; color: #6b7280; }
    .chart-canvas { width: 100% !important; height: 260px !important; }
    .chart-doughnut { height: 240px !important; }
    .chart-mini { width: 100% !important; height: 90px !important; }
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
    .charts-row { grid-template-columns: 1fr 1fr; }
    .legend-dot { display: inline-flex; align-items: center; gap: 6px; }
    .legend-dot::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
      background: #94a3b8;
    }
    .legend-dot.invites::before { background: #2563eb; }
    .legend-dot.accepted::before { background: #10b981; }
    .legend-dot.tasks::before { background: #f59e0b; }
    .legend-dot.accounts::before { background: #8b5cf6; }
    @media (max-width: 1100px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .dashboard-row { grid-template-columns: 1fr; }
      .charts-row { grid-template-columns: 1fr; }
    }
    @media (max-width: 680px) {
      .stats-grid { grid-template-columns: 1fr; }
    }
  `,
})
export class DashboardComponent {
  lineType: 'line' = 'line';
  barType: 'bar' = 'bar';
  doughnutType: 'doughnut' = 'doughnut';

  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: '#eef2f7' } },
      x: { grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
  };

  miniLineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { point: { radius: 0 } },
    scales: {
      y: { display: false },
      x: { display: false },
    },
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: '#eef2f7' } },
      x: { grid: { display: false } },
    },
    plugins: { legend: { display: false } },
  };

  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  invitesLineData: ChartData<'line'> = {
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    datasets: [
      {
        label: 'Отправлено',
        data: [120, 160, 140, 210, 190, 230, 180],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Принято',
        data: [20, 40, 45, 80, 60, 90, 75],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        tension: 0.35,
        fill: true,
      },
    ],
  };

  activityLineData: ChartData<'line'> = {
    labels: ['1', '2', '3', '4', '5', '6', '7'],
    datasets: [
      {
        label: 'Активность',
        data: [48, 52, 60, 58, 66, 74, 70],
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.15)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  tasksBarData: ChartData<'bar'> = {
    labels: ['Инвайты', 'Рассылки', 'Парсинг', 'Очистка', 'Аналитика'],
    datasets: [
      {
        label: 'Количество',
        data: [14, 9, 6, 4, 8],
        backgroundColor: ['#f59e0b', '#f97316', '#ef4444', '#eab308', '#fb7185'],
        borderRadius: 8,
      },
    ],
  };

  accountsDoughnutData: ChartData<'doughnut'> = {
    labels: ['Активные', 'В ожидании', 'Бан'],
    datasets: [
      {
        data: [96, 20, 12],
        backgroundColor: ['#8b5cf6', '#c4b5fd', '#fca5a5'],
        borderWidth: 0,
      },
    ],
  };
}
