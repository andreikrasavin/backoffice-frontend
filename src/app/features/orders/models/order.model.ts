export type OrderType = 'standard' | 'claim';

export type OrderStatus =
  | 'new'
  | 'in_progress'
  | 'confirmed'
  | 'in_production'
  | 'ready_to_ship'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export interface OrderCustomer {
  id: string;
  name: string;
  address: string;
}

export interface OrderManager {
  id: string;
  fullName: string;
}

export interface Order {
  id: string;
  /** Номер заказа в формате `YYYY-NNNNN`. */
  number: string;
  customer: OrderCustomer;
  manager: OrderManager;
  /** ISO-строка даты оформления. */
  createdAt: string;
  /** ISO-строка даты реализации или `null`, если заказ ещё не отгружен. */
  shippedAt: string | null;
  type: OrderType;
  status: OrderStatus;
  /**
   * Общее описание заказа: комментарий менеджера, условия доставки, детали
   * рекламации и т.п. Не является атрибутом только рекламаций.
   */
  description: string | null;
  /** Стоимость заказа в копейках: целое число, чтобы обойтись без плавающей точки. */
  totalAmountKopecks: number;
}

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  standard: 'Стандарт',
  claim: 'Рекламация',
};

export const ORDER_TYPE_COLORS: Record<OrderType, string> = {
  standard: 'blue',
  claim: 'red',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  in_progress: 'В работе',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready_to_ship: 'Готов к отгрузке',
  shipped: 'Отгружен',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'default',
  in_progress: 'processing',
  confirmed: 'blue',
  in_production: 'geekblue',
  ready_to_ship: 'cyan',
  shipped: 'green',
  completed: 'success',
  cancelled: 'error',
};
