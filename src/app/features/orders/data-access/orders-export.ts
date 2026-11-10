import { Order, ORDER_STATUS_LABELS } from '@features/orders/models';
import { downloadCsv } from '@shared/utils';

const HEADER: readonly string[] = [
  'Номер заказа',
  'Заказчик',
  'Адрес',
  'Менеджер',
  'Дата оформления',
  'Дата реализации',
  'Статус',
  'Стоимость',
];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDay(iso: string | null): string {
  if (iso === null) {
    return '';
  }

  const date = new Date(iso);

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function toRow(order: Order): readonly string[] {
  return [
    order.number,
    order.customer.name,
    order.customer.address,
    order.manager.fullName,
    formatDay(order.createdAt),
    formatDay(order.shippedAt),
    ORDER_STATUS_LABELS[order.status],
    // Целые рубли без разделителей — так колонку проще обрабатывать в таблицах.
    String(Math.round(order.totalAmountKopecks / 100)),
  ];
}

export function exportOrdersToCsv(orders: readonly Order[]): void {
  const now = new Date();
  const filename = `orders-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.csv`;

  downloadCsv(filename, [HEADER, ...orders.map(toRow)]);
}
