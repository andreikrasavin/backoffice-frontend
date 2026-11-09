import { Order, OrderStatus, OrderType } from '@features/orders/models';

export interface OrdersFilter {
  /** Поиск по номеру заказа (подстрока, без учёта регистра). */
  number: string;
  customerIds: readonly string[];
  managerIds: readonly string[];
  createdRange: readonly Date[] | null;
  shippedRange: readonly Date[] | null;
  types: readonly OrderType[];
  statuses: readonly OrderStatus[];
}

export const EMPTY_ORDERS_FILTER: OrdersFilter = {
  number: '',
  customerIds: [],
  managerIds: [],
  createdRange: null,
  shippedRange: null,
  types: [],
  statuses: [],
};

/** Приводит дату к числу вида YYYYMMDD, чтобы сравнивать только календарные дни. */
export function toDayKey(value: string | Date): number {
  const date = value instanceof Date ? value : new Date(value);

  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function isWithinRange(value: string | null, range: readonly Date[] | null): boolean {
  if (!range || range.length < 2) {
    return true;
  }

  const [from, to] = range;

  if (!from || !to) {
    return true;
  }

  if (value === null) {
    return false;
  }

  const key = toDayKey(value);

  return key >= toDayKey(from) && key <= toDayKey(to);
}

/**
 * Чистая функция клиентской фильтрации: применяет все фильтры последовательно.
 * Никаких побочных эффектов — её можно вызывать из `computed()` и тестировать отдельно.
 */
export function filterOrders(orders: readonly Order[], filter: OrdersFilter): readonly Order[] {
  const number = filter.number.trim().toLowerCase();

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

    if (!isWithinRange(order.createdAt, filter.createdRange)) {
      return false;
    }

    return isWithinRange(order.shippedAt, filter.shippedRange);
  });
}
