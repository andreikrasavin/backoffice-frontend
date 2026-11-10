import { Injectable, signal } from '@angular/core';
import { Order } from '@features/orders/models';
import { delay, getRandomDelay } from '@shared/utils';
import { MOCK_ORDERS } from './orders.mock';

@Injectable()
export class OrdersService {
  private readonly state = signal<readonly Order[]>(MOCK_ORDERS);

  readonly orders = this.state.asReadonly();

  remove(ids: ReadonlySet<string>): void {
    // TODO: call API
    this.state.update((orders) => orders.filter((order) => !ids.has(order.id)));
  }

  async getOrderById(id: string): Promise<Order | null> {
    // TODO: replace with HttpClient
    // TODO: remove artificial delay when real API is connected
    await delay(getRandomDelay());
    const order = this.state().find((item) => item.id === id);

    return order ?? null;
  }
}
