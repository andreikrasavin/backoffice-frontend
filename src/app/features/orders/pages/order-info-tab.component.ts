import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
} from '@features/orders/models';
import { OrderDetailsStore } from '@features/orders/data-access';
import {
  OrderDetailsSkeletonComponent,
  ProductionAreasComponent,
} from '@features/orders/components';
import { MoneyRubPipe } from '@shared/pipes';
import { getInitials } from '@shared/utils';

@Component({
  selector: 'bf-order-info-tab',
  imports: [
    DatePipe,
    NzAvatarModule,
    NzCardModule,
    NzTagModule,
    MoneyRubPipe,
    OrderDetailsSkeletonComponent,
    ProductionAreasComponent,
  ],
  templateUrl: './order-info-tab.component.html',
  styleUrl: './order-info-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderInfoTabComponent {
  protected readonly store = inject(OrderDetailsStore);

  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly statusColors = ORDER_STATUS_COLORS;
  protected readonly typeLabels = ORDER_TYPE_LABELS;

  protected readonly initials = getInitials;
}
