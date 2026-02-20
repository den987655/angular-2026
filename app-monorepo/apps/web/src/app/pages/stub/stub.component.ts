import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-stub',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="stub">
      <h2>Скоро</h2>
      <p>Раздел в разработке.</p>
      <a routerLink="/dashboard">← Назад к дашборду</a>
    </div>
  `,
  styles: [`
    .stub {
      background: #fff;
      padding: 40px;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      text-align: center;
    }
    .stub h2 { margin: 0 0 8px; }
    .stub p { color: #6b7280; margin: 0 0 16px; }
    .stub a { color: #5a6bff; }
  `],
})
export class StubComponent {}
