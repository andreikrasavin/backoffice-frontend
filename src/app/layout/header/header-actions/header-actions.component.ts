import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService, UserService } from '@core/auth';
import { ThemeService } from '@core/theme';
import { NotificationsBellComponent, ThemeToggleComponent, UserMenuComponent } from '@shared/ui';
import type { UserMenuAction } from '@shared/ui';

@Component({
  selector: 'bf-header-actions',
  imports: [NotificationsBellComponent, ThemeToggleComponent, UserMenuComponent],
  template: `
    <div class="header-actions">
      <bf-notifications-bell />
      <bf-theme-toggle [dark]="theme.isDark()" (themeChange)="theme.toggle()" />
      <bf-user-menu
        [name]="user.displayName()"
        [initials]="user.initials()"
        [avatarUrl]="user.user()?.avatarUrl"
        (action)="onUserAction($event)"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        margin-inline-start: auto;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: var(--app-spacing-xs);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderActionsComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly user = inject(UserService);
  private readonly auth = inject(AuthService);

  protected onUserAction(action: UserMenuAction): void {
    if (action === 'logout') {
      this.auth.logout();
    }
  }
}
