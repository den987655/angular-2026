import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TariffsService, type Tariff } from '../../core/api/tariffs.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styles: [`
    .pricing-loading,
    .pricing-error {
      text-align: center;
      padding: 24px;
      color: var(--muted);
    }
    .pricing-error { color: #dc2626; }
  `],
})
export class LandingComponent {
  tariffs: Tariff[] = [];
  tariffsLoading = true;
  tariffsError = '';

  constructor(private readonly tariffsService: TariffsService) {
    this.tariffsService.getTariffs().subscribe({
      next: (data) => {
        this.tariffs = data;
        this.tariffsLoading = false;
      },
      error: () => {
        this.tariffsError = 'Не удалось загрузить тарифы';
        this.tariffsLoading = false;
      },
    });
  }

  formatPrice(t: Tariff): string {
    if (t.price === 0 && t.periodDays) {
      return `0 ₽ / ${t.periodDays} дн`;
    }
    const period = t.period === 'month' ? 'месяц' : '';
    return `${t.price.toLocaleString('ru-RU')} ₽ / ${period}`;
  }

  isAccent(t: Tariff): boolean {
    return t.id === 'trial';
  }
}
