import { Injectable, signal } from '@angular/core';
import { Order } from '@core/models';

@Injectable()
export class OrdersService {
  readonly orders = signal<Order[]>([]);
}
