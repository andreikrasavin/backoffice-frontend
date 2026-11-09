import { Pipe } from '@angular/core';
import { formatCurrency } from '@shared/utils/format';

@Pipe({ name: 'bfCurrency' })
export class CurrencyPipe {
  transform(value: number | null | undefined): string {
    return value == null ? '' : formatCurrency(value);
  }
}
