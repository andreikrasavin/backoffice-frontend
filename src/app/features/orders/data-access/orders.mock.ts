import { Order, OrderManager, OrderStatus, OrderType } from '@features/orders/models';

const CUSTOMERS = [
  { id: 'c-01', name: 'ООО «Уютный дом»', address: 'г. Самара, ул. Ново-Садовая, 106' },
  { id: 'c-02', name: 'ИП Кузнецов А. В.', address: 'г. Тольятти, пр-т Ленина, 42' },
  { id: 'c-03', name: 'ООО «Мебель Плюс»', address: 'г. Казань, ул. Баумана, 15' },
  { id: 'c-04', name: 'АО «Гостиный двор»', address: 'г. Москва, ул. Тверская, 8' },
  { id: 'c-05', name: 'ООО «Интерьер-Стиль»', address: 'г. Санкт-Петербург, Невский пр-т, 60' },
  {
    id: 'c-06',
    name: 'ИП Смирнова Е. П.',
    address: 'г. Нижний Новгород, ул. Большая Покровская, 21',
  },
  { id: 'c-07', name: 'ООО «Кухни и фасады»', address: 'г. Екатеринбург, ул. Малышева, 71' },
  { id: 'c-08', name: 'ООО «Офис-Комплект»', address: 'г. Самара, Московское шоссе, 18' },
] as const;

const DEFAULT_CUSTOMER = CUSTOMERS[0] ?? { id: 'c-00', name: 'Без заказчика', address: '—' };

const MANAGERS = [
  { id: 'm-01', fullName: 'Иванов Иван Иванович' },
  { id: 'm-02', fullName: 'Петрова Анна Сергеевна' },
  { id: 'm-03', fullName: 'Сидоров Максим Олегович' },
  { id: 'm-04', fullName: 'Кузнецова Мария Андреевна' },
  { id: 'm-05', fullName: 'Соколов Дмитрий Павлович' },
] as const;

const DEFAULT_MANAGER = MANAGERS[0] ?? { id: 'm-00', fullName: 'Не назначен' };

const STATUSES: readonly OrderStatus[] = [
  'new',
  'in_progress',
  'confirmed',
  'in_production',
  'ready_to_ship',
  'shipped',
  'completed',
  'cancelled',
];

const SHIPPED_STATUSES = new Set<OrderStatus>(['shipped', 'completed']);

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0');
}

function toIsoDate(date: Date): string {
  return date.toISOString();
}

const MIN_AMOUNT_KOPECKS = 15_000 * 100;
const AMOUNT_SPREAD_KOPECKS = 1_350_000 * 100;

const CLAIM_DESCRIPTIONS: readonly string[] = [
  'Повреждена обивка при доставке',
  'Не соответствует размер, указанный в заказе',
  'Брак фурнитуры: не закрывается дверца',
  'Царапина на столешнице',
  'Комплектация неполная: отсутствуют ножки',
  'Оттенок ткани отличается от образца',
  'Скол на боковой панели шкафа',
  'Перепутаны фасады: цвет не совпадает с заказом',
  'Петли установлены с перекосом',
  'Повреждена упаковка, часть деталей поцарапана',
];

const STANDARD_DESCRIPTIONS: readonly string[] = [
  'Доставка после 18:00',
  'Самовывоз со склада',
  'Сборка на месте',
  'Позвонить за час до доставки',
];

/**
 * Детерминированная сумма заказа: 15 000–1 365 000 ₽.
 * У рекламаций сумма ниже — как правило, это возврат или компенсация.
 */
function createAmountKopecks(index: number, type: OrderType): number {
  const mixed = (index * 7_654_321 + 1_234_567) % AMOUNT_SPREAD_KOPECKS;
  const amount = MIN_AMOUNT_KOPECKS + mixed;

  return type === 'claim' ? Math.round(amount * 0.6) : amount;
}

function createDescription(index: number, type: OrderType): string | null {
  if (type === 'claim') {
    return CLAIM_DESCRIPTIONS[Math.floor(index / 7) % CLAIM_DESCRIPTIONS.length] ?? null;
  }

  // A few standard orders keep a neutral note: the field is common for all orders.
  if (index % 29 === 2) {
    return STANDARD_DESCRIPTIONS[index % STANDARD_DESCRIPTIONS.length] ?? null;
  }

  return null;
}

function createOrders(count: number): readonly Order[] {
  const start = Date.UTC(2025, 0, 6, 9, 0, 0);
  const day = 24 * 60 * 60 * 1000;

  return Array.from({ length: count }, (_, index) => {
    const createdAt = new Date(start + index * 2 * day);
    const status = STATUSES[index % STATUSES.length] ?? 'new';
    const type: OrderType = index % 7 === 0 ? 'claim' : 'standard';
    const shippedAt = SHIPPED_STATUSES.has(status)
      ? toIsoDate(new Date(createdAt.getTime() + (7 + (index % 5)) * day))
      : null;
    const customer = CUSTOMERS[index % CUSTOMERS.length] ?? DEFAULT_CUSTOMER;
    const manager: OrderManager = MANAGERS[index % MANAGERS.length] ?? DEFAULT_MANAGER;
    const editor: OrderManager = MANAGERS[(index + 1) % MANAGERS.length] ?? DEFAULT_MANAGER;
    // Roughly half of the orders have been edited at least once.
    const wasUpdated = index % 2 === 0;

    return {
      id: `order-${pad(index + 1, 4)}`,
      number: `2025-${pad(index + 1, 5)}`,
      customer,
      manager,
      createdAt: toIsoDate(createdAt),
      shippedAt,
      type,
      status,
      description: createDescription(index, type),
      totalAmountKopecks: createAmountKopecks(index, type),
      createdBy: manager.fullName,
      updatedBy: wasUpdated ? editor.fullName : null,
      updatedAt: wasUpdated
        ? toIsoDate(new Date(createdAt.getTime() + (1 + (index % 3)) * day))
        : null,
    };
  });
}

// TODO: replace with real API
export const MOCK_ORDERS: readonly Order[] = createOrders(137);
