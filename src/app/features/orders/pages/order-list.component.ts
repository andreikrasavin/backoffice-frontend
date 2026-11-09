import { Component, inject } from '@angular/core';
import { EmptyStateComponent } from '@shared/ui';
import { CurrencyPipe } from '@shared/pipes';
import { OrderStatusBadgeComponent } from '@features/orders/components';
import { OrdersService } from '@features/orders/data-access';

@Component({
  selector: 'bf-order-list',
  imports: [EmptyStateComponent, CurrencyPipe, OrderStatusBadgeComponent],
  template: `
    <h1>Заказы</h1>
    @if (orders.orders().length === 0) {
      <bf-empty-state description="Заказы пока отсутствуют" />
    } @else {
      <ul class="order-list">
        @for (order of orders.orders(); track order.id) {
          <li class="order-item">
            <span>#{{ order.id }}</span>
            <bf-order-status-badge [status]="order.status" />
            <span>{{ order.total | bfCurrency }}</span>
          </li>
        }
      </ul>
    }
  `,
  styles: [
    `
      .order-list {
        list-style: none;
        padding: 0;
      }
      .order-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
      }
    `,
  ],
})
export class OrderListComponent {
  protected readonly orders = inject(OrdersService);
}
