import { Injectable, signal } from '@angular/core';
import { Order } from '@features/orders/models';
import { MOCK_ORDERS } from './orders.mock';

@Injectable()
export class OrdersService {
  private readonly state = signal<readonly Order[]>(MOCK_ORDERS);

  readonly orders = this.state.asReadonly();

  remove(ids: ReadonlySet<string>): void {
    // TODO: call API
    this.state.update((orders) => orders.filter((order) => !ids.has(order.id)));
  }
}
