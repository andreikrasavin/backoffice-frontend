import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'bf-notifications-bell',
  imports: [NzBadgeModule, NzButtonModule, NzDropdownModule, NzIconModule],
  template: `
    <button
      class="notifications-bell"
      type="button"
      nz-button
      nzType="text"
      nzShape="circle"
      nz-dropdown
      [nzDropdownMenu]="notifications"
      nzTrigger="click"
      nzPlacement="bottomRight"
      [nzVisible]="open()"
      [attr.aria-expanded]="open()"
      (nzVisibleChange)="open.set($event)"
      aria-label="Уведомления"
      title="Уведомления"
    >
      <nz-badge nzDot>
        <nz-icon nzType="bell" nzTheme="outline" />
      </nz-badge>
    </button>

    <nz-dropdown-menu #notifications="nzDropdownMenu">
      <div class="notifications-bell__panel">Нет новых уведомлений</div>
    </nz-dropdown-menu>
  `,
  styles: [
    `
      .notifications-bell {
        color: var(--app-color-text);
      }

      .notifications-bell nz-icon {
        font-size: 18px;
      }

      .notifications-bell__panel {
        width: 240px;
        padding: var(--app-spacing-md);
        color: var(--app-color-text-secondary);
        text-align: center;
      }
    `,
  ],
  host: {
    '(document:keydown.escape)': 'close()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsBellComponent {
  protected readonly open = signal(false);

  protected close(): void {
    if (this.open()) {
      this.open.set(false);
    }
  }
}
