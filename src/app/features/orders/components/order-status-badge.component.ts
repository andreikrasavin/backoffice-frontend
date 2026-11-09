import { Component, computed, input } from '@angular/core';
import { OrderStatus } from '@core/models';
import { NzTagComponent } from 'ng-zorro-antd/tag';

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  inproduction: 'В производстве',
  ready: 'Готов',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  draft: 'default',
  confirmed: 'blue',
  inproduction: 'orange',
  ready: 'cyan',
  delivered: 'green',
  cancelled: 'red',
};

@Component({
  selector: 'bf-order-status-badge',
  imports: [NzTagComponent],
  template: `<nz-tag [nzColor]="color()">{{ label() }}</nz-tag>`,
})
export class OrderStatusBadgeComponent {
  readonly status = input.required<OrderStatus>();
  readonly label = computed(() => STATUS_LABELS[this.status()]);
  readonly color = computed(() => STATUS_COLORS[this.status()]);
}
