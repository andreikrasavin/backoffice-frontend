import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

interface NavItem {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'bf-main-nav',
  imports: [
    RouterLink,
    RouterLinkActive,
    NzButtonModule,
    NzDropdownModule,
    NzIconModule,
    NzMenuModule,
  ],
  template: `
    <nav class="main-nav" aria-label="Основная навигация">
      <ul class="main-nav__desktop" nz-menu nzMode="horizontal">
        @for (item of items; track item.path) {
          <li nz-menu-item [routerLinkActive]="'ant-menu-item-selected'">
            <a
              class="main-nav__link"
              [routerLink]="item.path"
              routerLinkActive="main-nav__link--active"
              ariaCurrentWhenActive="page"
            >
              {{ item.label }}
            </a>
          </li>
        }
      </ul>

      <button
        class="main-nav__burger"
        type="button"
        nz-button
        nzType="text"
        nzShape="circle"
        nz-dropdown
        [nzDropdownMenu]="mobileMenu"
        nzTrigger="click"
        [nzVisible]="mobileOpen()"
        [attr.aria-expanded]="mobileOpen()"
        (nzVisibleChange)="mobileOpen.set($event)"
        aria-label="Открыть меню навигации"
        title="Меню"
      >
        <nz-icon nzType="menu" nzTheme="outline" />
      </button>

      <nz-dropdown-menu #mobileMenu="nzDropdownMenu">
        <ul class="main-nav__mobile" nz-menu>
          @for (item of items; track item.path) {
            <li nz-menu-item [routerLinkActive]="'ant-menu-item-selected'">
              <a
                class="main-nav__link"
                [routerLink]="item.path"
                routerLinkActive="main-nav__link--active"
                ariaCurrentWhenActive="page"
                (click)="mobileOpen.set(false)"
              >
                {{ item.label }}
              </a>
            </li>
          }
        </ul>
      </nz-dropdown-menu>
    </nav>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .main-nav {
        display: flex;
        align-items: center;
        height: 100%;
      }

      .main-nav__desktop {
        display: flex;
        align-items: center;
        height: 100%;
        background: transparent;
        border-bottom: none;
      }

      .main-nav__desktop > li {
        display: flex;
        align-items: center;
        height: 100%;
        padding: 0 var(--app-spacing-md);
        line-height: 1;
      }

      .main-nav__link {
        color: var(--app-color-text);
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .main-nav__link:hover,
      .main-nav__link--active {
        color: var(--app-color-primary);
      }

      .main-nav__burger {
        display: none;
      }

      .main-nav__mobile {
        min-width: 200px;
        border-right: none;
      }

      @media (max-width: 767px) {
        .main-nav__desktop {
          display: none;
        }

        .main-nav__burger {
          display: inline-flex;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNavComponent {
  protected readonly items: readonly NavItem[] = [
    { label: 'Дашборд', path: '/dashboard' },
    { label: 'Заказы', path: '/orders' },
  ];

  protected readonly mobileOpen = signal(false);
}
