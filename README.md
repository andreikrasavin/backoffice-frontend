# Backoffice — мебельная фабрика

Backoffice для небольшой мебельной фабрики: заказы, клиенты, продукты и производственные
процессы. SPA на Angular 22 (standalone components, signals, zoneless), TypeScript strict,
SCSS и ng-zorro-antd.

## Требования

- Node.js 22+ (проверено на Node 26)
- npm 10+

## Запуск

```bash
npm install
npm start
```

Приложение будет доступно на `http://localhost:4200/`.

## Сборка и проверки

```bash
npm run build        # production-сборка в dist/
npm run lint         # ESLint + angular-eslint
npm run format       # Prettier
npm run format:check # проверка форматирования
```

## Структура

```
src/
├── app/
│   ├── core/       # синглтоны: api, auth, config, http, models, theme
│   ├── shared/     # ui, directives, pipes, utils — без зависимостей от фич
│   ├── features/   # вертикальные срезы: dashboard, orders
│   ├── layout/     # app-shell, header (logo, main-nav, header-actions)
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.ts
├── environments/   # environment.ts (prod) и environment.development.ts
├── styles/         # index.scss, _tokens.scss
└── main.ts
```

Алиасы путей: `@core/*`, `@shared/*`, `@features/*`, `@layout/*`, `@env/*`.

## Окружения

`environment.ts` используется в production-сборке, `environment.development.ts`
подставляется в development через `fileReplacements` в `angular.json`.

## Соглашения

Правила архитектуры, именования и коммитов описаны в [AGENTS.md](AGENTS.md).

## Статус

- Реализованы app shell с адаптивным хэдером, переключение светлой/тёмной темы (NgZorro),
  дашборд и список заказов (данные — заглушки).
- Хэдер: логотип, навигация «Дашборд»/«Заказы», уведомления, переключатель темы и меню
  пользователя. На экранах < 768px навигация сворачивается в бургер.
- Разделы клиентов, продуктов и производства пока не реализованы.
- Авторизация подготовлена (`AuthService`, `authGuard`), но не подключена.
