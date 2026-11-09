# AGENTS.md

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project Context

This is an Angular back-office application for managing orders of a small furniture factory (`backoffice-frontend`).

- **UI component library:** `ng-zorro-antd` is the primary UI library. Use its components (`nz-table`, `nz-form`, `nz-modal`, `nz-drawer`, `nz-button`, `nz-message`, `nz-notification`, `nz-date-picker`, `nz-layout`, etc.) instead of custom UI implementations or any other UI library.
- **Testing:** Automated tests are NOT used in this project. Do NOT create `*.spec.ts` files, do NOT configure Karma/Jasmine/Vitest, and do NOT suggest adding tests. Verify your changes by ensuring `ng build` succeeds and by reasoning through the logic manually.
- **Key commands:** `npm install`, `ng serve`, `ng build`, `ng lint`.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.
  - For images rendered inside `ng-zorro-antd` components (e.g. `nz-avatar`, `nz-card`, `nz-image`), follow the component's own image API.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
- Prefer `ng-zorro-antd` components — most of them already ship with built-in ARIA attributes and keyboard support.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

### ng-zorro-antd usage

- Import `ng-zorro-antd` modules individually per component (its components are standalone); do NOT import a global `NgZorroAntdModule` barrel.
- Use `nz-*` components for every interactive UI element: tables, forms, modals, drawers, notifications, date pickers, layout, navigation, popovers, tooltips.
- Use `NzMessageService`, `NzNotificationService`, and `NzModalService` for user feedback and confirmations instead of custom solutions.
- `ng-zorro-antd` form controls must be wired through Angular Reactive Forms (`FormGroup`, `FormControl`) or Signal Forms — do NOT mix them with Template-driven forms.
- Do NOT override `ng-zorro-antd` styles globally. If customization is required, scope it to the component and prefer `ng-zorro-antd`'s theming mechanisms (LESS variables / CSS custom properties) over raw CSS overrides.
- Do NOT introduce any other UI library (Angular Material, Bootstrap, PrimeNG, etc.) alongside `ng-zorro-antd`.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
- For server data, prefer `HttpClient` + signals (`httpResource` / `resource`) unless an explicit pattern is requested.

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection