## -1. Install NX

Install nx globally:
```bash
npm add --global nx
```




Окей, вот тут как раз классический кейс для Nx: **один монорепо, два приложения — Angular (web) + NestJS (api)**.
Сделаем так, чтобы это было не через жопу, а сразу по-уму.

Я дам тебе **конкретный сценарий “с нуля” с командами и структурой**.

---

## 0. База

Предположим:

* Node ≥ 18
* Пакетный менеджер: пока оставим `npm` (потом можно перейти на pnpm)
* Папку проекта назовём, например, `app-monorepo` (подставь своё)

---

## 1. Создаём Nx workspace

В корневой папке, где хочешь репозиторий:

```bash
npx create-nx-workspace@latest app-monorepo --preset=apps
```


Когда мастер спросит:

1. **What to create? / Preset?**
   Выбираешь что-то вроде:
   `Apps (e.g. React, Angular, Node, Nest)` или `Integrated Monorepo` (если есть выбор).
   Главное — чтобы это был **integrated workspace**, а не “standalone react” и т.п.

2. **Package manager** — `npm` (или что хочешь).

3. Далее можно вообще **НЕ создавать сразу приложение**, а начать с пустого integrated workspace, если Nx спросит. В этом случае ты потом сам создашь Angular и Nest приложухи руками через генераторы Nx.
   Это вариант, который я тебе и предлагаю.

В итоге должен получиться скелет:

```text
app-monorepo/
  nx.json
  package.json
  tsconfig.base.json
  apps/
  libs/
  ...
```

Пока без приложений.

Если мастер прям настойчиво предлагает сразу сделать app — можно сделать сразу Angular, а Nest потом добавить. Но дальше я буду считать, что ты начал с “пустой” монорепы.

---

## 2. Добавляем Angular-приложение (web)

Из корня:

```bash
cd app-monorepo

npm add -D @nx/angular

npx nx g @nx/angular:application apps/web --standalone=true --routing=true --style=scss
```

Пояснения:

* `web` — имя приложения (папка `apps/web`)
* `standalone=true` — сразу на standalone компонентах
* `routing=true` — сразу будет `app.routes.ts` или аналог
* `style=scss` — на вкус, поменяй если хочешь

После этого структура:

```text
apps/
  web/
    src/
      app/
      main.ts
      app.config.ts / app.routes.ts
```

Проверяем, что оно живо:

```bash
npx nx serve web
```

---

## 3. Добавляем NestJS API приложение (api)

Дальше добавляем NestJS. Всё так же через Nx:

```bash
npm add -D @nx/nest

npx nx g @nx/nest:application apps/api
```

Nx создаст тебе:

```text
apps/
  api/
    src/
      main.ts
      app.module.ts
      app.controller.ts
      app.service.ts
```

Проверяем:

```bash
npx nx serve api
```

Обычно Nest по дефолту на `http://localhost:3333` или что-то рядом (Nx так любит).
Но по факту `http://localhost:3000`
Проверяем `http://localhost:3000/api`

---

## 4. Сейчас у тебя уже есть:

* `apps/web` — Angular фронт
* `apps/api` — NestJS бек

Оба живут в одном монорепо, видны Nx, могут использовать общие libs.

Дальше начинается **магия архитектуры**.

---

## 5. Раскладываем архитектуру по libs (для обоих приложений)

Ты можешь завести **общий доменный слой** в `libs/` и использовать его и из Angular, и из Nest.

Например, общий домен `orders`:

### 5.1. Общий domain (pure TS / models / rules)

```bash
npx nx g @nx/js:library orders-domain --directory=libs/orders/domain --unitTestRunner=jest
```

Это создаст:

```text
libs/
  orders/
    domain/
      src/
        lib/
          order.model.ts
          order.rules.ts
      project.json
```

Это **чистый TypeScript**, без Angular/Nest — его можно юзать с обоих сторон.

---

### 5.2. Data-access для API (Nest side)

Например, модуль для работы с базой / репозитории:

```bash
npx nx g @nx/nest:library --name=orders-data-access --directory=libs/orders/api-data-access
```

Структура:

```text
libs/
  orders/
    api-data-access/
      src/
        lib/
          orders.repository.ts
          orders.module.ts
```

Эту либу будет использовать `apps/api`.

---

### 5.3. Data-access для фронта (Angular side)

```bash
npx nx g @nx/angular:library --name=orders-web-data-access --directory=libs/orders/web-data-access --routing=false
```

Здесь будут:

* сервисы с HttpClient
* adapters / mappers доменных моделей
* SignalStore для фронтенда

---

### 5.4. UI и feature для фронта

UI:

```bash
npx nx g @nx/angular:library --name=orders-ui --directory=libs/orders/web-ui --routing=false
```

Feature (контейнер + маршруты):

```bash
npx nx g @nx/angular:library --name=orders-feature --directory=libs/orders/web-feature --routing=true
```

---

## 6. Связка Angular ↔ Nest через общий домен

Идея такая:

* **`orders/domain`** — модели, enum’ы, бизнес-правила, которые одинаковы и для фронта, и для бека.
* **API (Nest):**

  * `apps/api` использует `orders/api-data-access` + `orders/domain`
  * контроллеры Nest возвращают DTO, которые легко мапятся на доменные модели
* **Web (Angular):**

  * `apps/web` → `orders/web-feature` → `orders/web-data-access` → `orders/domain`
  * Http-сервисы получают DTO от Nest, мапят в доменные модели из `orders/domain`

Это даёт тебе:

* Один источник правды по моделям/enum’ам
* Общие правила валидации/логики (можно использовать и там и там)
* Понятное разделение по слоям и tags в Nx

---

## 7. Как всё это выглядит в `nx graph`

Из корня:

```bash
npx nx graph
```

Откроется веб-UI, где ты увидишь:

* `web` → зависит от:

  * `orders/web-feature`
  * `orders/web-ui`
  * `orders/web-data-access`
  * `orders/domain`

* `api` → зависит от:

  * `orders/api-data-access`
  * `orders/domain`

Так ты будешь прямо визуально видеть архитектуру. Это то, чего ты хотел — **работать с архитектурой как с физическим объектом**, а не с абстрактной кашей.

---

## 8. Что дальше можно сделать (следующий шаг)

Дальше разумно:

1. **Ввести теги и правила модульных границ** в `nx.json`, чтобы:

   * web-feature не могла ходить напрямую в api-data-access
   * ui не лазила в data-access
   * домен не зависел от Angular/Nest

2. Сформировать **шаблон фичи** (готовый набор команд или свой генератор), чтобы под новую область сразу получать:

   * `X/domain`
   * `X/api-data-access`
   * `X/web-data-access`
   * `X/web-ui`
   * `X/web-feature`

3. Определить **контракт между frontend data-access ↔ backend API** (DTO, endpoints, error-handling, auth и т.д.)



---

Если хочешь, next step я могу:

* расписать **контракт между слоями для одной фичи** (web-feature → web-data-access → domain → api-data-access → api)
* дать **пример файлов**: `order.model.ts`, `order.dto.ts`, `orders.controller.ts`, `orders-api.service.ts`, `orders-store.ts` на SignalStore
* предложить **схему tags и правил module boundaries** под твой стиль разработки.
