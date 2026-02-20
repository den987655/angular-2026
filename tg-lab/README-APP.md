### Идеальная структура группирующих папок в libs/ (Nx-монрепо, фича-ориентированный подход)

В Nx группирующие папки (директории без project.json) — это логическая организация по **доменам/фичам** (vertical slicing: orders, users, products) и **стекам** (shared, api, web). Они не являются проектами, а служат для навигации, Nx graph и enforcement (теги scope:orders). 

Общая схема: 
- `libs/shared/` — глобальные (utils, ui, data-access для всего монрепо).
- `libs/[feature]/` — по фиче (bounded context), с подгруппами по стекам.
- Узлы (либы): Обозначены как проекты с project.json, без детализации файлов (src/lib/ и т.д. — генерируйте командами).

```
libs/                                   # Root группирующая папка (все либы)
├── shared/                             # Глобальные либы (cross-feature)
│   ├── domain/                         # [ЛИБА: общие entities/DTO]
│   ├── data-access/                    # [ЛИБА: глобальные репозитории/use cases]
│   ├── ui/                             # [ЛИБА: общие UI-компоненты (Angular)]
│   └── utils/                          # [ЛИБА: helpers, validators, enums]
├── orders/                             # Группирующая по фиче "orders"
│   ├── shared/                         # Подгруппа: shared для orders
│   │   ├── domain/                     # [ЛИБА: orders-specific entities/DTO]
│   │   └── data-access/                # [ЛИБА: абстрактные репозитории/use cases]
│   ├── api/                            # Подгруппа: backend (NestJS)
│   │   ├── data-access/                # [ЛИБА: конкретные impl (Prisma и т.д.)]
│   │   └── feature/                    # [ЛИБА: контроллеры, модули, guards]
│   └── web/                            # Подгруппа: frontend (Angular)
│       ├── data-access/                # [ЛИБА: сервисы, state (NgRx)]
│       ├── feature/                    # [ЛИБА: роуты, контейнеры]
│       └── ui/                         # [ЛИБА: reusable компоненты/pipes]
├── users/                              # Группирующая по фиче "users" (аналогично orders)
│   ├── shared/
│   │   ├── domain/                     # [ЛИБА]
│   │   └── data-access/                # [ЛИБА]
│   ├── api/
│   │   ├── data-access/                # [ЛИБА]
│   │   └── feature/                    # [ЛИБА]
│   └── web/
       ├── data-access/                 # [ЛИБА]
       ├── feature/                     # [ЛИБА]
       └── ui/                          # [ЛИБА]
└── products/                           # Группирующая по фиче "products" (пример масштаба)
    ├── shared/
    │   ├── domain/                     # [ЛИБА]
    │   └── data-access/                # [ЛИБА]
    ├── api/
    │   ├── data-access/                # [ЛИБА]
    │   └── feature/                    # [ЛИБА]
    └── web/
        ├── data-access/                # [ЛИБА]
        ├── feature/                    # [ЛИБА]
        └── ui/                         # [ЛИБА]
```

#### Краткие принципы
- **Глубина**: Не больше 3 уровней (feature → stack → lib-type) — для простоты путей.
- **Генерация**: `nx g @nx/js:lib domain --directory=libs/shared` (для shared); `nx g @nx/js:lib domain --directory=libs/orders/shared` (для фичи).
- **Зависимости**: Теги в project.json: shared/domain → feature/data-access → stack/feature/ui. Nx enforce-module-boundaries защитит от циклических импортов.
- **Масштаб**: Добавляйте фичи как новые папки (libs/cart/). Shared — только для truly global (не дублируйте в фичах).







### Как сгенерировать идеальную структуру libs/ в Nx-монрепо

Чтобы создать описанную структуру (группирующие папки + либы внутри), используйте **Nx schematics** (генераторы). Они автоматически создадут папки, configs (project.json, tsconfig и т.д.) и базовый src/index.ts. Выполняйте команды в корне монрепо (где nx.json).

#### Подготовка
1. Убедитесь, что Nx установлен: `npm install -D @nx/js @nx/angular @nx/nest` (для JS/TS, Angular, NestJS).
2. Для фича-ориентированного подхода: Добавьте теги в nx.json (опционально): `"pluginsConfig": { "@nx/js": { "generatorDefaults": { "tags": ["type:lib"] } } }`.
3. Генерируйте либы с `--buildable` (для shared/типизации) или без (для простых). `--directory` создаст группирующие папки.
4. После генерации: `nx graph` — проверьте визуализацию; `nx build [lib-name]` — протестируйте.

#### Шаги по генерации (по уровням)
Выполняйте последовательно. Я указал команды для ключевых либов; для остальных — аналогично (замените имя на data-access, ui и т.д.).

1. **Глобальные shared-либы** (libs/shared/):
   ```
   # Domain (общие entities/DTO) — JS/TS lib
   nx g @nx/js:lib domain --directory=libs/shared --buildable --bundler=rollup

   # Data-access (глобальные репозитории/use cases)
   nx g @nx/js:lib data-access --directory=libs/shared --buildable

   # UI (общие Angular-компоненты)
   nx g @nx/angular:lib ui --directory=libs/shared --buildable --style=scss

   # Utils (helpers/enums)
   nx g @nx/js:lib utils --directory=libs/shared --buildable
   ```

2. **Фича "orders"** (libs/orders/ — группирующая папка создастся автоматически):
   - **Shared подгруппа** (libs/orders/shared/):
     ```
     # Domain (orders-specific entities/DTO)
     nx g @nx/js:lib domain --directory=libs/orders/shared --buildable

     # Data-access (абстрактные репозитории/use cases)
     nx g @nx/js:lib data-access --directory=libs/orders/shared --buildable
     ```
   
   - **API подгруппа** (libs/orders/api/ — NestJS):
     ```
     # Data-access (конкретные impl, e.g., Prisma)
     nx g @nx/nest:lib data-access --directory=libs/orders/api --buildable

     # Feature (контроллеры/модули)
     nx g @nx/nest:lib feature --directory=libs/orders/api --buildable
     ```
   
   - **Web подгруппа** (libs/orders/web/ — Angular):
     ```
     # Data-access (сервисы/state)
     nx g @nx/angular:lib data-access --directory=libs/orders/web --buildable --bundler=rollup

     # Feature (роуты/контейнеры)
     nx g @nx/angular:feature feature --directory=libs/orders/web --standalone --routing

     # UI (reusable компоненты)
     nx g @nx/angular:lib ui --directory=libs/orders/web --buildable --style=scss
     ```

3. **Фича "users"** (libs/users/ — аналогично orders, замените "orders" на "users"):
   ```
   # Пример для shared/domain
   nx g @nx/js:lib domain --directory=libs/users/shared --buildable

   # ... остальные по шаблону выше
   ```

4. **Фича "products"** (libs/products/ — то же самое):
   ```
   # Аналогично users, замените "users" на "products"
   ```

#### После генерации
- **Настройка зависимостей**: В каждом project.json добавьте теги: `"tags": ["scope:orders", "type:domain"]` (для enforcement: `nx lint --fix`).
- **Импорты**: В tsconfig.base.json добавьте paths: `"@your-org/orders/shared/domain": ["libs/orders/shared/domain/src/index.ts"]`.
- **Тест/сборка**: `nx run-many --target=build --projects=shared-domain,orders-shared-domain`.
- **Автоматизация**: Создайте custom schematic (Nx plugin) для одной команды: `nx g @nx/plugin:generator` — генерируйте всю фичу (`libs/[feature]/`) одним вызовом.
- **Очистка**: Если удаляете старую структуру: `nx reset` (или rm -rf libs/orders/), затем генерируйте заново.

Это создаст полную структуру без ручного mkdir. Если Nx-версия <19, обновите: `nx migrate latest`. Для кастомных опций (e.g., --dry-run) — docs Nx. Если ошибка — покажите вывод!