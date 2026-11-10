import { Pipe, PipeTransform } from '@angular/core';

const RUB_FORMATTER = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

/**
 * Форматирует стоимость из копеек в рубли без дробной части.
 * `null`/`undefined` превращаются в прочерк, чтобы таблица не показывала «0 ₽».
 */
@Pipe({ name: 'bfMoneyRub' })
export class MoneyRubPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value == null ? '—' : RUB_FORMATTER.format(value / 100);
  }
}
