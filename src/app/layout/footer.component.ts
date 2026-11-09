import { Component } from '@angular/core';
import { NzFooterComponent } from 'ng-zorro-antd/layout';

@Component({
  selector: 'bf-footer',
  imports: [NzFooterComponent],
  template: `<nz-footer class="shell-footer">Backoffice © {{ year }}</nz-footer>`,
  styles: [
    `
      :host {
        display: block;
      }

      .shell-footer {
        text-align: center;
        padding: 16px 24px;
      }
    `,
  ],
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
