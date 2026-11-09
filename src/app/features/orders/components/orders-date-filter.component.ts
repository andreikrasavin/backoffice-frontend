import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { DateRangeFilter, fromIsoDate, toIsoDate } from '@features/orders/data-access';

/** `YYYY-MM-DD` → `dd.MM.yyyy`; подсказка всегда показывает локальную дату. */
function formatIsoDate(value: string): string {
  const [year, month, day] = value.split('-');

  return year && month && day ? `${day}.${month}.${year}` : value;
}

/**
 * Фильтр по диапазону дат: обе границы необязательны, пустой фильтр означает
 * «за всё время». Модель хранит только даты `YYYY-MM-DD`, без времени и TZ.
 */
@Component({
  selector: 'bf-orders-date-filter',
  imports: [FormsModule, NzDatePickerModule],
  template: `
    <div class="date-filter">
      <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
      <label class="date-filter__field">
        <span class="date-filter__label">С даты</span>
        <nz-date-picker
          nzFormat="dd.MM.yyyy"
          nzPlaceHolder="Любая дата"
          [ngModel]="fromDate()"
          (ngModelChange)="onFromChange($event)"
        />
      </label>

      <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
      <label class="date-filter__field">
        <span class="date-filter__label">По дату</span>
        <nz-date-picker
          nzFormat="dd.MM.yyyy"
          nzPlaceHolder="Любая дата"
          [ngModel]="toDate()"
          (ngModelChange)="onToChange($event)"
        />
      </label>

      <p class="date-filter__hint" [class.date-filter__hint--error]="rangeInvalid()" role="status">
        {{ hint() }}
      </p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .date-filter {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .date-filter__field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .date-filter__label {
      color: var(--app-color-text-secondary);
      font-size: 12px;
      line-height: 1.4;
    }

    .date-filter__field nz-date-picker {
      width: 100%;
    }

    .date-filter__hint {
      margin: 0;
      color: var(--app-color-text-secondary);
      font-size: 12px;
      line-height: 1.4;
    }

    .date-filter__hint--error {
      color: #ff4d4f;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersDateFilterComponent {
  readonly value = input.required<DateRangeFilter>();
  readonly valueChange = output<DateRangeFilter>();

  readonly fromDate = computed(() => fromIsoDate(this.value().from));
  readonly toDate = computed(() => fromIsoDate(this.value().to));

  readonly rangeInvalid = computed(() => {
    const { from, to } = this.value();

    return from !== null && to !== null && from > to;
  });

  readonly hint = computed(() => {
    const { from, to } = this.value();

    if (this.rangeInvalid()) {
      return 'Дата «с» позже даты «по»';
    }

    if (from !== null && to !== null) {
      return `С ${formatIsoDate(from)} по ${formatIsoDate(to)}`;
    }

    if (from !== null) {
      return `С ${formatIsoDate(from)} по сегодня`;
    }

    if (to !== null) {
      return `До ${formatIsoDate(to)}`;
    }

    return 'Все заказы за всё время';
  });

  onFromChange(date: Date | null): void {
    this.valueChange.emit({ ...this.value(), from: date === null ? null : toIsoDate(date) });
  }

  onToChange(date: Date | null): void {
    this.valueChange.emit({ ...this.value(), to: date === null ? null : toIsoDate(date) });
  }
}
