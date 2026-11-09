import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { DateFilter, fromIsoDate, toIsoDate } from '@features/orders/data-access';

/**
 * Фильтр по дате: точный день или диапазон. Модель хранит только даты
 * в формате `YYYY-MM-DD`, поэтому часовой пояс не влияет на результат.
 */
@Component({
  selector: 'bf-orders-date-filter',
  imports: [FormsModule, NzDatePickerModule, NzRadioModule],
  template: `
    <div class="date-filter">
      <nz-radio-group
        nzSize="small"
        [ngModel]="value().mode"
        (ngModelChange)="onModeChange($event)"
      >
        <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
        <label nz-radio-button nzValue="single">Одна дата</label>
        <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
        <label nz-radio-button nzValue="range">Диапазон</label>
      </nz-radio-group>

      @if (value().mode === 'single') {
        <nz-date-picker
          class="date-filter__control"
          nzFormat="dd.MM.yyyy"
          nzPlaceHolder="Выберите дату"
          [ngModel]="singleDate()"
          (ngModelChange)="onSingleChange($event)"
        />
      } @else {
        <nz-range-picker
          class="date-filter__control"
          nzFormat="dd.MM.yyyy"
          [ngModel]="rangeDates()"
          (ngModelChange)="onRangeChange($event)"
        />
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .date-filter {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .date-filter__control {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersDateFilterComponent {
  readonly value = input.required<DateFilter>();
  readonly valueChange = output<DateFilter>();

  readonly singleDate = computed(() => {
    const value = this.value();

    return value.mode === 'single' ? fromIsoDate(value.date) : null;
  });

  readonly rangeDates = computed<Date[] | null>(() => {
    const value = this.value();

    if (value.mode !== 'range') {
      return null;
    }

    const from = fromIsoDate(value.from);
    const to = fromIsoDate(value.to);

    return from !== null && to !== null ? [from, to] : null;
  });

  onModeChange(mode: 'single' | 'range'): void {
    if (mode === this.value().mode) {
      return;
    }

    this.valueChange.emit(
      mode === 'single' ? { mode: 'single', date: null } : { mode: 'range', from: null, to: null },
    );
  }

  onSingleChange(date: Date | null): void {
    this.valueChange.emit({ mode: 'single', date: date === null ? null : toIsoDate(date) });
  }

  onRangeChange(dates: Date[] | null): void {
    const from = dates?.[0] ?? null;
    const to = dates?.[1] ?? null;

    this.valueChange.emit({
      mode: 'range',
      from: from === null ? null : toIsoDate(from),
      to: to === null ? null : toIsoDate(to),
    });
  }
}
