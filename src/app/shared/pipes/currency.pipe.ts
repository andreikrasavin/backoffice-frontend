import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '@shared/utils';

@Pipe({ name: 'bfCurrency' })
export class CurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value == null ? '' : formatCurrency(value);
  }
}
