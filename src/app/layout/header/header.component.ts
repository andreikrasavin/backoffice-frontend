import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LogoComponent } from './logo/logo.component';
import { MainNavComponent } from './main-nav/main-nav.component';

@Component({
  selector: 'bf-header',
  imports: [LogoComponent, MainNavComponent],
  template: `
    <div class="header app-container">
      <bf-logo />
      <bf-main-nav />
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
