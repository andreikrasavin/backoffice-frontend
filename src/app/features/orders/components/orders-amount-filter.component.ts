import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { AmountRangeFilter } from '@features/orders/data-access';

const RUB_FORMATTER = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

/**
 * Диапазон стоимости: два необязательных поля в рублях.
 * Значения фильтра — целые рубли, поэтому копейки появляются только при сравнении.
 */
@Component({
  selector: 'bf-orders-amount-filter',
  imports: [FormsModule, NzInputNumberModule],
  template: `
    <div class="amount-filter">
      <span class="amount-filter__label" id="orders-amount-from-label">От, ₽</span>
      <nz-input-number
        [ngModel]="value().from"
        (ngModelChange)="onFromChange($event)"
        [nzMin]="0"
        [nzStep]="1000"
        [nzPrecision]="0"
        [nzFormatter]="formatAmount"
        [nzParser]="parseAmount"
        nzPlaceHolder="Без ограничения"
        aria-labelledby="orders-amount-from-label"
      />

      <span class="amount-filter__label" id="orders-amount-to-label">До, ₽</span>
      <nz-input-number
        [ngModel]="value().to"
        (ngModelChange)="onToChange($event)"
        [nzMin]="0"
        [nzStep]="1000"
        [nzPrecision]="0"
        [nzFormatter]="formatAmount"
        [nzParser]="parseAmount"
        nzPlaceHolder="Без ограничения"
        aria-labelledby="orders-amount-to-label"
      />

      <p class="amount-filter__hint" [class.amount-filter__hint--error]="invalid()">
        {{ hint() }}
      </p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .amount-filter {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    nz-input-number {
      width: 100%;
    }

    .amount-filter__label {
      color: var(--app-color-text-secondary);
      font-size: 12px;
    }

    .amount-filter__hint {
      margin: 2px 0 0;
      color: var(--app-color-text-secondary);
      font-size: 12px;
      line-height: 1.4;
    }

    .amount-filter__hint--error {
      color: var(--app-color-danger);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersAmountFilterComponent {
  readonly value = input.required<AmountRangeFilter>();

  readonly valueChange = output<AmountRangeFilter>();

  /** Тысячи разделяются при отображении, а в модель попадает целое число рублей. */
  readonly formatAmount = (value: number): string => value.toLocaleString('ru-RU');

  readonly parseAmount = (value: string): number => Number(value.replace(/[^\d]/g, '')) || 0;

  readonly invalid = computed(() => {
    const { from, to } = this.value();

    return from !== null && to !== null && from > to;
  });

  readonly hint = computed(() => {
    const { from, to } = this.value();

    if (this.invalid()) {
      return 'Сумма «от» больше суммы «до»';
    }

    if (from === null && to === null) {
      return 'Любая стоимость';
    }

    if (to === null && from !== null) {
      return `От ${RUB_FORMATTER.format(from)}`;
    }

    if (from === null && to !== null) {
      return `До ${RUB_FORMATTER.format(to)}`;
    }

    return `От ${RUB_FORMATTER.format(from ?? 0)} до ${RUB_FORMATTER.format(to ?? 0)}`;
  });

  onFromChange(value: number | null): void {
    this.valueChange.emit({ ...this.value(), from: value });
  }

  onToChange(value: number | null): void {
    this.valueChange.emit({ ...this.value(), to: value });
  }
}
