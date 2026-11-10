import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

export interface BreadcrumbItem {
  label: string;
  link?: string | readonly string[] | null;
  loading?: boolean;
}

@Component({
  selector: 'bf-breadcrumbs',
  imports: [RouterLink, NzBreadCrumbModule],
  template: `
    <nz-breadcrumb class="app-breadcrumbs">
      @for (item of items(); track $index) {
        <nz-breadcrumb-item>
          @if (item.loading) {
            <span class="app-breadcrumbs__placeholder" aria-hidden="true"></span>
          } @else if (item.link) {
            <a [routerLink]="item.link">{{ item.label }}</a>
          } @else {
            <span>{{ item.label }}</span>
          }
        </nz-breadcrumb-item>
      }
    </nz-breadcrumb>
  `,
  styles: `
    :host {
      display: block;
    }

    .app-breadcrumbs {
      display: block;
    }

    .app-breadcrumbs__placeholder {
      display: inline-block;
      width: 120px;
      height: 14px;
      vertical-align: middle;
      background: var(--app-color-border);
      border-radius: 4px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent {
  readonly items = input.required<readonly BreadcrumbItem[]>();
}
