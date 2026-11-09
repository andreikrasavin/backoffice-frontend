import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';

/**
 * Общая оболочка попапа фильтра: тело с произвольным содержимым и футер
 * с кнопками «Сбросить» и «Применить».
 */
@Component({
  selector: 'bf-orders-filter-panel',
  imports: [NzButtonModule],
  template: `
    <div class="filter-panel">
      <div class="filter-panel__body">
        <ng-content />
      </div>

      <footer class="filter-panel__footer">
        <button nz-button type="button" [disabled]="resetDisabled()" (click)="resetFilter.emit()">
          Сбросить
        </button>

        <button nz-button nzType="primary" type="button" (click)="apply.emit()">Применить</button>
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .filter-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 300px;
      padding: 12px;
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-md);
      box-shadow:
        0 6px 16px rgb(0 0 0 / 12%),
        0 3px 6px -4px rgb(0 0 0 / 12%);
    }

    .filter-panel__body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-panel__footer {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding-top: 12px;
      border-top: 1px solid var(--app-color-border);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersFilterPanelComponent {
  /** Кнопка «Сбросить» неактивна, когда фильтр этой колонки уже пуст. */
  readonly resetDisabled = input(false);
  readonly resetFilter = output<void>();
  readonly apply = output<void>();
}
