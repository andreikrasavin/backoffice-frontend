# AGENTS.md — правила проекта

Backoffice мебельной фабрики: заказы, клиенты, продукты, производство.
Стек: Angular 22 (standalone, signals, zoneless), TypeScript strict, SCSS, ng-zorro-antd.

## Команды

```bash
npm start          # dev-сервер (development-конфигурация)
npm run build      # production-сборка
npm run lint       # ESLint (angular-eslint)
npm run format     # Prettier для src
npm run format:check
```

Тестов в проекте нет, тестовый раннер не добавляем без отдельного запроса.

## Архитектура

```
src/app/
├── core/       # синглтоны: auth, http, api, config, models, theme
├── shared/     # переиспользуемое: ui, directives, pipes, utils
├── features/   # вертикальные срезы: dashboard, orders
├── layout/     # app-shell, header (logo, main-nav, header-actions)
├── app.routes.ts
├── app.config.ts
└── app.ts
```

- Зависимости только в одну сторону: `features → shared`, `features → core`, `app → все`.
  `shared` не импортирует `core` и `features`; `core` не импортирует `features`.
- Каждая фича lazy-загружается через `loadChildren` и `*.routes.ts`.
- Доступ к данным — только через `data-access` фичи. Компоненты не используют `HttpClient`.
- `core`-сервисы регистрируются через `provideX()` в `app.config.ts`, без `providedIn: 'root'`.
- Состояние — signals (`signal`/`computed`) в сервисах `data-access`; NgRx не используется.
- Публичный API папки — `index.ts`. Импорты только через алиасы:
  `@core/*`, `@shared/*`, `@features/*`, `@layout/*`, `@env/*`.
  Импорты в обход барелей (`@core/config/app-config`) запрещены.
- Фичевые сервисы скоупятся через `providers` в конфиге маршрута фичи.

## Лейаут и тема

- Каркас — `layout/app-shell`: sticky-хэдер 64px (элементы выровнены по вертикали
  по центру), `<main>` с `.app-container` (`max-width: 1440px`, `margin-inline: auto`,
  отступы 24px / 16px на ≤768px). Футера нет.
- Навигация — горизонтальное `nz-menu` в хэдере; на ширине < 768px она сворачивается
  в бургер с `nz-dropdown`.
- `shared/ui` содержит только dumb-компоненты: они получают данные через `input()`
  и сообщают о действиях через `output()`. Сервисы (`ThemeService`, `UserService`,
  `AuthService`) инжектятся в `layout/header/header-actions`, чтобы `shared` не зависел
  от `core`.
- Тема — `core/theme/theme.service.ts`: сигнал `light | dark`, `localStorage` (`bf-theme`),
  атрибут `data-theme` на `<html>` и подключение `ng-zorro-antd.dark.min.css` из ассетов.
  Тема применяется до первого рендера inline-скриптом в `index.html`.
- NgZorro-стили подключаются по компонентам в `angular.json`; тёмная тема — отдельный
  CSS-файл, который копируется в `/assets/ng-zorro-antd/`.

## Именование

- Файлы — `kebab-case` с суффиксом: `orders.service.ts`, `auth.guard.ts`, `currency.pipe.ts`.
- Классы — `PascalCase`.
- Селекторы компонентов — префикс `bf-` (`bf-order-list`), директивы — `bfCamelCase`
  (`bfAutofocus`), пайпы — `bfCamelCase` (`bfCurrency`). Префикс `bf` зафиксирован
  осознанно (историческое имя проекта) и задан в `angular.json` → `prefix`.
- Маршруты — `kebab-case`, вложенность через `children`.

## TypeScript

Включены `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`,
`noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`,
`strictTemplates`, `strictInjectionParameters`.

Запрещено: `any`, `@ts-ignore`/`@ts-expect-error` без обоснования в комментарии.
Отключать strict-флаги молча нельзя — только с планом исправления.

## Окружения

- `src/environments/environment.ts` — production (`production: true`).
- `src/environments/environment.development.ts` — development (`production: false`),
  подставляется через `fileReplacements` в `development`-конфигурации `angular.json`.

## Коммиты

Angular Commit Conventions, сообщение на английском, заголовок ≤ 72 символов:

```
<type>(<scope>): <subject>
```

Типы: `feat`, `fix`, `refactor`, `chore`, `docs`, `perf`, `build`.

## Известные ограничения

- Разделы клиентов, продуктов и производства ещё не реализованы; в навигации только
  «Дашборд» и «Заказы».
- `authGuard` и `AuthService` готовы, но guard не подключён: страницы `/login` нет.
- `UserService` — заглушка с `null`: аватар показывает гостя, пункты «Профиль»
  и «Настройки» пока ничего не открывают.
- Уведомления статичны («Нет новых уведомлений»), счётчик непрочитанных не подключён.
- `OrdersService`/`DashboardService` — заглушки без HTTP-запросов.
