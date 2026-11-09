import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzLayoutComponent, NzContentComponent } from 'ng-zorro-antd/layout';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'bf-shell',
  imports: [
    NzLayoutComponent,
    NzContentComponent,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
  ],
  template: `
    <nz-layout class="shell">
      <bf-sidebar />
      <nz-layout>
        <bf-header />
        <nz-content class="shell-content">
          <router-outlet />
        </nz-content>
        <bf-footer />
      </nz-layout>
    </nz-layout>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }
      .shell {
        height: 100%;
      }
      .shell-content {
        padding: 24px;
      }
    `,
  ],
})
export class ShellComponent {}
