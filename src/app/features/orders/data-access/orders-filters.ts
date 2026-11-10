import { Order, OrderStatus, OrderType } from '@features/orders/models';

/** Открытый диапазон дат: обе границы необязательны. */
export interface DateRangeFilter {
  from: string | null;
  to: string | null;
}

/** Открытый диапазон стоимости: границы хранятся в рублях. */
export interface AmountRangeFilter {
  from: number | null;
  to: number | null;
}

export interface OrdersFilter {
  /** Поиск по номеру заказа (подстрока, без учёта регистра). */
  number: string;
  customerIds: readonly string[];
  managerIds: readonly string[];
  created: DateRangeFilter;
  shipped: DateRangeFilter;
  types: readonly OrderType[];
  statuses: readonly OrderStatus[];
  amount: AmountRangeFilter;
}

export const EMPTY_DATE_FILTER: DateRangeFilter = { from: null, to: null };

export const EMPTY_AMOUNT_FILTER: AmountRangeFilter = { from: null, to: null };

export const EMPTY_ORDERS_FILTER: OrdersFilter = {
  number: '',
  customerIds: [],
  managerIds: [],
  created: EMPTY_DATE_FILTER,
  shipped: EMPTY_DATE_FILTER,
  types: [],
  statuses: [],
  amount: EMPTY_AMOUNT_FILTER,
};

export function isDateFilterActive(filter: DateRangeFilter): boolean {
  return filter.from !== null || filter.to !== null;
}

export function isAmountFilterActive(filter: AmountRangeFilter): boolean {
  return filter.from !== null || filter.to !== null;
}

/**
 * Проверяет стоимость (в копейках) на попадание в диапазон, заданный в рублях.
 * `null` проходит только при неактивном фильтре.
 */
export function matchesAmountFilter(value: number | null, filter: AmountRangeFilter): boolean {
  if (!isAmountFilterActive(filter)) {
    return true;
  }

  if (value === null) {
    return false;
  }

  const from = filter.from === null ? null : filter.from * 100;
  const to = filter.to === null ? null : filter.to * 100;

  return (from === null || value >= from) && (to === null || value <= to);
}

/** Локальная дата → `YYYY-MM-DD` (без сдвига часового пояса). */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/** `YYYY-MM-DD` → локальная дата; `null`, если строка пустая или битая. */
export function fromIsoDate(value: string | null): Date | null {
  if (value === null) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return Number.isNaN(date.getTime()) ? null : date;
}

/** Приводит дату к числу вида YYYYMMDD, чтобы сравнивать только календарные дни. */
export function toDayKey(value: string | Date): number {
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

    if (match) {
      const [, year, month, day] = match;

      if (year && month && day) {
        return Number(year) * 10000 + Number(month) * 100 + Number(day);
      }
    }
  }

  const date = value instanceof Date ? value : new Date(value);

  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function matchesDateFilter(
  value: string | null,
  filter: DateRangeFilter,
  todayKey: number,
): boolean {
  if (!isDateFilterActive(filter)) {
    return true;
  }

  if (value === null) {
    return false;
  }

  const key = toDayKey(value);
  const from = filter.from === null ? null : toDayKey(filter.from);
  const to = filter.to === null ? null : toDayKey(filter.to);

  // Открытая верхняя граница для «с даты» не уводит фильтр в будущее.
  const upperBound = to ?? todayKey;

  return (from === null || key >= from) && key <= upperBound;
}

/**
 * Чистая функция клиентской фильтрации: применяет все фильтры последовательно.
 * Никаких побочных эффектов — её можно вызывать из `computed()` и тестировать отдельно.
 */
export function filterOrders(orders: readonly Order[], filter: OrdersFilter): readonly Order[] {
  const number = filter.number.trim().toLowerCase();
  const todayKey = toDayKey(new Date());

  return orders.filter((order) => {
    if (number && !order.number.toLowerCase().includes(number)) {
      return false;
    }

    if (filter.customerIds.length > 0 && !filter.customerIds.includes(order.customer.id)) {
      return false;
    }

    if (filter.managerIds.length > 0 && !filter.managerIds.includes(order.manager.id)) {
      return false;
    }

    if (filter.types.length > 0 && !filter.types.includes(order.type)) {
      return false;
    }

    if (filter.statuses.length > 0 && !filter.statuses.includes(order.status)) {
      return false;
    }

    if (!matchesAmountFilter(order.totalAmountKopecks, filter.amount)) {
      return false;
    }

    if (!matchesDateFilter(order.createdAt, filter.created, todayKey)) {
      return false;
    }

    return matchesDateFilter(order.shippedAt, filter.shipped, todayKey);
  });
}
