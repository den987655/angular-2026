# Первое мнение нейронок
Chat GPT

``` 
src/app/features/cleaning-order/
  index.ts                      # публичный вход: реэкспорт ROUTES, facade, типов
  cleaning-order.routes.ts      # маршруты фичи (для lazy-load)

  domain/                       # ЧИСТЫЙ домен, ничего про Angular / Http
    cleaning-order.model.ts     # интерфейсы: CleaningOrder, CleaningType, ...
    cleaning-order.value.ts     # value-objects (например, Money, Address) — опционально
    cleaning-order.rules.ts     # бизнес-правила: расчет цены, проверки, статусы

  data-access/                  # связь домена с внешним миром (API, storage)
    cleaning-order.api.ts       # Angular resource()/HttpClient: createOrder(), getOrder()
    cleaning-order.dto.ts       # типы DTO от бекенда
    cleaning-order.mapper.ts    # map DTO ↔ domain (модели из domain/)
    cleaning-order.mocks.ts     # фейковые ответы, заглушки для dev/test — опционально

  state/                        # состояние фичи на сигналах
    cleaning-order.store.ts     # store: сигналы, set/patch/reset, НИКАКОЙ Http
    cleaning-order.selectors.ts # computed/derive: vm, canSubmit, priceEstimate и т.п.

  facade/                       # фасад — единая точка входа для компонентов
    cleaning-order.facade.ts    # use-cases: submitOrder(), loadExisting(), reset()

  ui/                           # тупые компоненты (только Inputs/Outputs)
    cleaning-order-form/
      cleaning-order-form.component.ts
    cleaning-order-summary/
      cleaning-order-summary.component.ts
    cleaning-order-price/
      cleaning-order-price.component.ts
    cleaning-order-loader/
      cleaning-order-loader.component.ts    # спиннер/индикатор — опционально

  pages/                        # умные контейнеры, привязанные к роутам
    cleaning-order.page.ts      # /order-cleaning — главная страница фичи
    cleaning-order-success.page.ts # /order-cleaning/success — опционально

  testing/                      # опциональный, но полезный слой
    cleaning-order.facade.spec.ts
    cleaning-order.store.spec.ts
    cleaning-order.rules.spec.ts
``` 

Qwen
``` 
src/app/features/order/
├── +state/                          # 🧠 Управление состоянием
│   ├── order.facade.ts             # 🎯 Публичный API фичи
│   ├── order.store.ts              # 📦 Внутреннее состояние
│   ├── order.selectors.ts          # 🔍 Селекторы для получения данных
│   └── index.ts                    # exported interfaces
│
├── data-access/                     # 🗄️ Работа с данными
│   ├── services/
│   │   ├── order-api.service.ts    # 🌐 HTTP запросы
│   │   └── order-storage.service.ts # 💾 Локальное хранилище
│   ├── repositories/
│   │   └── order.repository.ts     # 🏛️ Абстракция над источниками данных
│   └── index.ts
│
├── ui/                              # 🎨 Пользовательский интерфейс
│   ├── smart/                      # 🧠 Умные компоненты (с логикой)
│   │   ├── order-list/
│   │   │   ├── order-list.component.ts
│   │   │   ├── order-list.component.html
│   │   │   └── order-list.component.css
│   │   └── order-form/
│   │       ├── order-form.component.ts
│   │       ├── order-form.component.html
│   │       └── order-form.component.css
│   │
│   ├── dumb/                       # 🤖 Глупые компоненты (только презентация)
│   │   ├── order-card/
│   │   │   ├── order-card.component.ts
│   │   │   ├── order-card.component.html
│   │   │   └── order-card.component.css
│   │   └── order-status/
│   │       ├── order-status.component.ts
│   │       ├── order-status.component.html
│   │       └── order-status.component.css
│   │
│   └── index.ts
│
├── utils/                           # 🛠️ Вспомогательные утилиты
│   ├── mappers/                    # 🔄 Преобразование данных
│   │   └── order.mapper.ts
│   ├── validators/                 # ✅ Валидация
│   │   └── order.validators.ts
│   └── constants/                  # 🔢 Константы фичи
│       └── order.constants.ts
│
├── models/                          # 📋 Модели данных
│   ├── order.model.ts              # 📊 Основная модель
│   ├── order-form.model.ts         # 📝 Модель формы
│   └── index.ts
│
├── config/                          # ⚙️ Конфигурация фичи
│   └── order.config.ts
│
├── routes.ts                        # 🛣️ Маршруты фичи
└── index.ts                         # 📤 Public API фичи
``` 

Kimi
``` 
src/app/features/booking/
│
├─ booking.routes.ts              ← lazy-load entry-point
├─ index.ts                       ← public-api: маршруты + токены
│
├─ ui/                            ← компоненты (presentational)
│  ├─ booking-shell.ts
│  ├─ order-form/
│  │   ├─ order-form.ts
│  │   └─ order-form.scss
│  ├─ success/
│  │   ├─ success.ts
│  │   └─ success.scss
│  └─ components.ts               ← re-export всех UI-компонент
│
├─ facade/                        ← единое публичное API для UI
│  ├─ booking-facade.service.ts
│  └─ booking-facade.providers.ts ← provideBookingFacade()
│
├─ data-access/                   ← всё, что ведёт к внешнему миру
│  ├─ booking-api.service.ts      ← HttpClient, WebSocket, GraphQL
│  ├─ booking-adapter.ts          ← маппинг DTO ↔ Domain
│  └─ booking-store.service.ts    ← локальный signal-state
│
├─ domain/                        ← чистая бизнес-логика
│  ├─ order.model.ts              ← тип/интерфейс Order
│  └─ order.mapper.ts             ← преобразования value-object
│
└─ utils/                         ← внутренние хелперы
   └─ order.validators.ts
``` 

Gemini
``` 
src/app/features/manage-vacancies/
├── api/                           # [DATA-ACCESS LAYER]
│   ├── vacancy.api.service.ts     # Только HTTP запросы
│   └── vacancy.dto.ts             # Интерфейсы данных с бэкенда (DTO)
│
├── model/                         # [BUSINESS LAYER]
│   ├── vacancy.store.ts           # Состояние (Signals / NGRX)
│   ├── vacancy.facade.ts          # ФАСАД (Точка входа для UI)
│   └── vacancy.types.ts           # UI-модели (маппинг DTO -> View)
│
├── ui/                            # [PRESENTATION LAYER]
│   ├── vacancy-list/              # Умный компонент (Smart)
│   │   └── vacancy-list.component.ts
│   ├── vacancy-form/              # Умный компонент (Smart)
│   ├── status-badge/              # Тупой компонент (Dumb), специфичный для фичи
│   └── vacancy.routes.ts          # Локальный роутинг фичи
│
└── index.ts                       # [PUBLIC API]
``` 

Grok
``` 
features/
└── pick-datetime/                     ← Корень фичи (kebab-case)
    ├── ui/                             ← Только "глупые" презентаторы (dumb components)
    │   ├── calendar-view/
    │   │   ├── calendar-view.component.ts
    │   │   ├── calendar-view.component.html
    │   │   └── calendar-view.component.scss
    │   │
    │   ├── time-slots/
    │   │   ├── time-slots.component.ts
    │   │   └── time-slots.component.html
    │   │
    │   └── slot-item/
    │       └── slot-item.component.ts
    │
    ├── facade/                         ← Публичный API фичи (то, что видят компоненты)
    │   └── datetime.facade.ts          ← Только readonly-сигналы + методы
    │
    ├── data-access/                    ← Всё, что связано с данными (HTTP, кэш, эффекты)
    │   ├── datetime.store.ts           ← @ngrx/signal-store или кастомный с withDataService()
    │   └── datetime.api.service.ts     ← HttpClient-запросы (можно вынести в core, если переиспользуется)
    │
    ├── utils/                          ← Чистые функции только для этой фичи
    │   ├── date.utils.ts
    │   └── time.utils.ts
    │
    ├── models/                         ← Локальные типы (не глобальные)
    │   └── datetime.model.ts
    │
    ├── pick-datetime.component.ts      ← "Контейнер" фичи (route-level component)
    ├── pick-datetime.component.html    ← Обычно просто <app-calendar-view /> + <app-time-slots />
    ├── pick-datetime.component.scss
    └── pick-datetime.routes.ts         ← Если нужна вложенная маршрутизация (редко)
``` 






# Нейронки подумали лучше
Chat GPT

``` 
src/app/features/cleaning-order/
  index.ts                      # public API фичи
  cleaning-order.routes.ts      # маршруты (lazy)

  domain/
    cleaning-order.model.ts     # доменные сущности, enum’ы
    cleaning-order.rules.ts     # бизнес-правила, calcPrice(), canSubmit()

  data-access/
    cleaning-order.api.ts       # Http/resource: create/get/update
    cleaning-order.dto.ts       # DTO от/к бэку
    cleaning-order.mapper.ts    # DTO ↔ domain

  state/
    cleaning-order.store.ts     # сигналы, set/patch/reset, НИКАКОГО Http
    cleaning-order.selectors.ts # vm, derived сигналы (по необходимости)

  facade/
    cleaning-order.facade.ts    # use-cases: submit(), loadExisting(), reset()

  ui/
    cleaning-order-form/
      cleaning-order-form.component.ts
    cleaning-order-summary/
      cleaning-order-summary.component.ts
    cleaning-order-price/
      cleaning-order-price.component.ts

  pages/
    cleaning-order.page.ts      # /order-cleaning – контейнер
    cleaning-order-success.page.ts  # опционально

  testing/                      # если проект серьёзный
    cleaning-order.rules.spec.ts
    cleaning-order.store.spec.ts
    cleaning-order.facade.spec.ts

``` 

Qwen
``` 
src/app/features/order/
├── index.ts                    # 📤 Public API фичи
├── routes.ts                   # 🛣️ Маршруты фичи
│
├── core/                       # 🎯 ЯДРО ФИЧИ (обязательно)
│   ├── order.facade.ts        # 🎯 Единая точка входа
│   ├── order.store.ts         # 📦 Состояние фичи
│   ├── order.model.ts         # 📊 Основные модели
│   └── order.types.ts         # 🔧 Вспомогательные типы
│
├── data/                       # 🗄️ Данные (опционально, если есть API)
│   ├── order.api.ts           # 🌐 HTTP запросы
│   ├── order.dto.ts           # 📡 DTO типы
│   └── order.mapper.ts        # 🔄 Преобразование данных
│
├── ui/                         # 🎨 Интерфейс
│   ├── smart/                 # 🧠 Умные компоненты
│   ├── dumb/                  # 🤖 Глупые компоненты
│   └── pages/                 # 📄 Страницы (route-level)
│
└── utils/                      # 🛠️ Утилиты (опционально)
    ├── validators/            # ✅ Валидация
    └── helpers/               # 🔧 Хелперы
``` 

Kimi
``` 
features/cleaning-order/
  index.ts
  cleaning-order.routes.ts
  domain/               ← чистые типы + бизнес-функции (priceCalc, statusRules)
  data-access/          ← api.service + store.service (signals) + mapper
  facade/               ← readonly API для UI (vm, commands)
  ui/                   ← dumb + smart pages
``` 

Gemini
``` 
src/app/features/cleaning-order/
├── api/                           # [DATA-ACCESS] Грязная работа с сетью
│   ├── order.api.ts               # Http, Resource API
│   ├── order.dto.ts               # DTO (контракты бэкенда)
│   └── order.adapter.ts           # Adapter: DTO -> Domain Model (если нужно)
│
├── model/                         # [BUSINESS LAYER] Мозги фичи
│   ├── order.model.ts             # Интерфейсы Domain (чистые типы)
│   ├── order.store.ts             # State (SignalStore / Service)
│   ├── order.facade.ts            # Facade (Оркестратор: Store + API + Router)
│   └── order.utils.ts             # Чистые функции (валидаторы, расчет цены)
│
├── ui/                            # [PRESENTATION] Компоненты
│   ├── order-form/                # Крупный блок формы
│   ├── order-summary/             # Блок "Итого"
│   └── order-status-badge/        # Мелкие UI элементы
│
├── cleaning-order.component.ts    # [ENTRY POINT] Корневой "Smart" контейнер
├── cleaning-order.routes.ts       # Маршруты
└── index.ts                       # [PUBLIC API] Экспорт Facade (опционально) и Routes
``` 

Grok
``` 
src/app/features/
└── booking-order/                  ← kebab-case, lazy-loaded feature
    ├── ui/                         ← 100% dumb / presentational компоненты
    │   ├── components/             ← переиспользуемые внутри фичи
    │   │   ├── service-card/
    │   │   ├── time-slot/
    │   │   └── stepper/
    │   └── pages/                  ← route-level "shell" компоненты (могут быть smart)
    │       ├── booking-order.page.ts/html/scss
    │       └── booking-success.page.ts/html
    │
    ├── facade/
    │   └── booking.facade.ts       ← ЕДИНСТВЕННАЯ точка входа для всех UI-компонентов
    │
    ├── data-access/                ← Всё, что выходит за пределы браузера
    │   ├── booking.api.service.ts  ← HttpClient, inject()
    │   └── +state/                 ← @ngrx/signal-store c features (2025 стандарт)
    │       ├── booking.store.ts    ← signalStore(withEntities(), withCallStatus()…)
    │       └── booking.selectors.ts ← опционально, если очень много computed
    │
    ├── models/                     ← только локальные типы фичи
    │   ├── booking.model.ts
    │   └── booking.dto.ts
    │
    ├── utils/                      ← чистые функции и validators
    │   ├── price-calculator.ts
    │   └── booking.validators.ts
    │
    ├── booking-order.routes.ts     ← lazy routes + guards
    └── index.ts                    ← public-api: export const BOOKING_ROUTES, provideBookingFeature()
``` 



``` 
``` 

``` 
``` 

``` 
``` 

``` 
``` 