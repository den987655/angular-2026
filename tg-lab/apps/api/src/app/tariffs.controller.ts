import { Controller, Get } from '@nestjs/common';

@Controller('tariffs')
export class TariffsController {
  @Get()
  getTariffs() {
    return [
      {
        id: 'trial',
        name: 'Пробный период',
        price: 0,
        periodDays: 3,
        features: [
          'Бесплатный доступ ко всем функциям демо‑версии',
          'До 3 аккаунтов',
          '1 активная задача одновременно',
        ],
      },
      {
        id: 'base',
        name: 'Base',
        price: 1290,
        period: 'month',
        features: [
          'Сбор аудитории из групп и каналов',
          'Инвайтинг',
          'Рассылка личных сообщений',
          'Рассылка по чатам',
          'До 50 аккаунтов',
          'До 3 активных задач',
        ],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 2290,
        period: 'month',
        features: [
          'Все из Base',
          'Продвинутый инвайтинг',
          'До 10 активных задач',
        ],
      },
      {
        id: 'max',
        name: 'Max',
        price: 3290,
        period: 'month',
        features: [
          'Все из Pro',
          'Максимальные лимиты по аккаунтам',
          'До 15 активных задач',
        ],
      },
    ];
  }
}

