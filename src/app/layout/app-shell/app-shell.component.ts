import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzContentComponent, NzHeaderComponent, NzLayoutComponent } from 'ng-zorro-antd/layout';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'bf-app-shell',
  imports: [
    RouterOutlet,
    NzLayoutComponent,
    NzHeaderComponent,
    NzContentComponent,
    HeaderComponent,
  ],
  template: `
    <nz-layout class="app-shell">
      <nz-header class="app-shell__header">
        <bf-header />
      </nz-header>
      <nz-content class="app-shell__content">
        <main class="app-container">
          <router-outlet />
        </main>
      </nz-content>
    </nz-layout>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .app-shell {
        min-height: 100vh;
        background: var(--app-color-bg);
      }

      .app-shell__header {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        height: 64px;
        padding: 0;
        line-height: normal;
        background: var(--app-color-surface);
        border-bottom: 1px solid var(--app-color-border);
      }

      .app-shell__content {
        flex: 1;
        padding: 24px 0;
      }

      bf-header {
        flex: 1;
        min-width: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {}
