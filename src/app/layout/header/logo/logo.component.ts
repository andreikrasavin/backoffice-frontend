import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'bf-logo',
  imports: [RouterLink, NzIconModule],
  template: `
    <a class="logo" routerLink="/dashboard" aria-label="Backoffice — на главную">
      <nz-icon class="logo__icon" nzType="appstore" nzTheme="outline" />
      <span class="logo__text">Backoffice</span>
    </a>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .logo {
        display: inline-flex;
        align-items: center;
        gap: var(--app-spacing-sm);
        color: var(--app-color-text);
        font-size: 18px;
        font-weight: 600;
        line-height: 1;
        text-decoration: none;
        white-space: nowrap;
      }

      .logo:hover .logo__text,
      .logo:focus-visible .logo__text {
        color: var(--app-color-primary);
      }

      .logo:focus-visible {
        outline: 2px solid var(--app-color-primary);
        outline-offset: 4px;
        border-radius: var(--app-radius-md);
      }

      .logo__icon {
        color: var(--app-color-primary);
        font-size: 24px;
      }

      @media (max-width: 575px) {
        .logo__text {
          display: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {}
