import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

export type UserMenuAction = 'profile' | 'settings' | 'logout';

@Component({
  selector: 'bf-user-menu',
  imports: [NzAvatarModule, NzButtonModule, NzDropdownModule, NzIconModule, NzMenuModule],
  template: `
    <button
      class="user-menu__trigger"
      type="button"
      nz-button
      nzType="text"
      nz-dropdown
      [nzDropdownMenu]="menu"
      nzTrigger="click"
      nzPlacement="bottomRight"
      [nzVisible]="open()"
      [attr.aria-expanded]="open()"
      (nzVisibleChange)="open.set($event)"
      [attr.aria-label]="'Меню пользователя: ' + name()"
      title="Меню пользователя"
    >
      @if (avatarUrl()) {
        <nz-avatar [nzSrc]="avatarUrl()" [nzSize]="32" />
      } @else if (initials()) {
        <nz-avatar [nzText]="initials()" [nzSize]="32" />
      } @else {
        <nz-avatar nzIcon="user" [nzSize]="32" />
      }
      <span class="user-menu__name">{{ name() }}</span>
    </button>

    <nz-dropdown-menu #menu="nzDropdownMenu">
      <ul class="user-menu__list" nz-menu>
        <li nz-menu-item>
          <button class="user-menu__item" type="button" (click)="select('profile')">
            <nz-icon nzType="user" nzTheme="outline" />
            <span>Профиль</span>
          </button>
        </li>
        <li nz-menu-item>
          <button class="user-menu__item" type="button" (click)="select('settings')">
            <nz-icon nzType="setting" nzTheme="outline" />
            <span>Настройки</span>
          </button>
        </li>
        <li nz-menu-item>
          <button class="user-menu__item" type="button" (click)="select('logout')">
            <nz-icon nzType="logout" nzTheme="outline" />
            <span>Выйти</span>
          </button>
        </li>
      </ul>
    </nz-dropdown-menu>
  `,
  styles: [
    `
      .user-menu__trigger {
        display: inline-flex;
        align-items: center;
        gap: var(--app-spacing-sm);
        height: 40px;
        padding: 0 var(--app-spacing-sm);
        color: var(--app-color-text);
      }

      .user-menu__name {
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .user-menu__list {
        min-width: 180px;
        border-right: none;
      }

      .user-menu__item {
        display: flex;
        align-items: center;
        gap: var(--app-spacing-sm);
        width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      @media (max-width: 575px) {
        .user-menu__name {
          display: none;
        }
      }
    `,
  ],
  host: {
    '(document:keydown.escape)': 'close()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  readonly name = input.required<string>();
  readonly initials = input('');
  readonly avatarUrl = input<string>();
  readonly action = output<UserMenuAction>();

  protected readonly open = signal(false);

  protected select(action: UserMenuAction): void {
    this.action.emit(action);
    this.close();
  }

  protected close(): void {
    if (this.open()) {
      this.open.set(false);
    }
  }
}
