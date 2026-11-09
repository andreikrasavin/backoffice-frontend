import { DOCUMENT, Injectable, Provider, computed, effect, inject, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'bf-theme';
const DARK_STYLESHEET_ID = 'bf-theme-dark';
const DARK_STYLESHEET_HREF = 'assets/ng-zorro-antd/ng-zorro-antd.dark.min.css';

@Injectable()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly themeState = signal<AppTheme>(this.readInitialTheme());

  readonly theme = this.themeState.asReadonly();
  readonly isDark = computed(() => this.themeState() === 'dark');

  constructor() {
    effect(() => this.apply(this.themeState()));
  }

  toggle(): void {
    this.set(this.isDark() ? 'light' : 'dark');
  }

  set(theme: AppTheme): void {
    if (theme === this.themeState()) {
      return;
    }

    this.themeState.set(theme);
    this.persist(theme);
  }

  private apply(theme: AppTheme): void {
    const root = this.document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    const stylesheet = this.document.getElementById(DARK_STYLESHEET_ID);

    if (theme === 'dark') {
      if (stylesheet) {
        return;
      }

      const link = this.document.createElement('link');
      link.id = DARK_STYLESHEET_ID;
      link.rel = 'stylesheet';
      link.href = DARK_STYLESHEET_HREF;
      this.document.head.appendChild(link);
      return;
    }

    stylesheet?.remove();
  }

  private readInitialTheme(): AppTheme {
    try {
      return this.document.defaultView?.localStorage.getItem(STORAGE_KEY) === 'dark'
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  }

  private persist(theme: AppTheme): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode); the in-memory state still applies.
    }
  }
}

export function provideTheme(): Provider[] {
  return [ThemeService];
}
