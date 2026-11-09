import { Component } from '@angular/core';
import { NzHeaderComponent } from 'ng-zorro-antd/layout';

@Component({
  selector: 'bf-header',
  imports: [NzHeaderComponent],
  template: `
    <nz-header class="shell-header">
      <span class="shell-title">Backoffice</span>
    </nz-header>
  `,
  styles: [
    `
      .shell-header {
        display: flex;
        align-items: center;
        background: #fff;
        padding: 0 24px;
      }
      .shell-title {
        font-size: 18px;
        font-weight: 600;
      }
    `,
  ],
})
export class HeaderComponent {}
