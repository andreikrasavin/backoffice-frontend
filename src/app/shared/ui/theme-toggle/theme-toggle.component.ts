import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'bf-theme-toggle',
  imports: [NzButtonModule, NzIconModule],
  template: `
    <button
      class="theme-toggle"
      type="button"
      nz-button
      nzType="text"
      nzShape="circle"
      [attr.aria-pressed]="dark()"
      [attr.aria-label]="label()"
      [title]="label()"
      (click)="themeChange.emit()"
    >
      <nz-icon [nzType]="dark() ? 'sun' : 'moon'" nzTheme="outline" />
    </button>
  `,
  styles: [
    `
      .theme-toggle {
        color: var(--app-color-text);
      }

      .theme-toggle nz-icon {
        font-size: 18px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  readonly dark = input.required<boolean>();
  readonly themeChange = output<void>();

  protected readonly label = computed(() =>
    this.dark() ? 'Включить светлую тему' : 'Включить тёмную тему',
  );
}
