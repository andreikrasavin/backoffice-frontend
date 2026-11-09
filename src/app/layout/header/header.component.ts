import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LogoComponent } from './logo/logo.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { HeaderActionsComponent } from './header-actions/header-actions.component';

@Component({
  selector: 'bf-header',
  imports: [LogoComponent, MainNavComponent, HeaderActionsComponent],
  template: `
    <div class="header app-container">
      <bf-logo />
      <bf-main-nav />
      <bf-header-actions />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .header {
        display: flex;
        align-items: center;
        gap: var(--app-spacing-lg);
        height: 100%;
      }

      bf-main-nav {
        min-width: 0;
      }

      @media (max-width: 767px) {
        .header {
          gap: var(--app-spacing-sm);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
