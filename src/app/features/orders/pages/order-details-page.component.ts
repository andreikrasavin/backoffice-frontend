import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
} from '@features/orders/models';
import { OrdersService } from '@features/orders/data-access';
import { OrderDetailsSkeletonComponent } from '@features/orders/components';
import { MoneyRubPipe } from '@shared/pipes';
import { getInitials } from '@shared/utils';

@Component({
  selector: 'bf-order-details',
  imports: [
    DatePipe,
    RouterLink,
    NzAvatarModule,
    NzButtonModule,
    NzCardModule,
    NzEmptyModule,
    NzIconModule,
    NzTagModule,
    NzTooltipModule,
    MoneyRubPipe,
    OrderDetailsSkeletonComponent,
  ],
  templateUrl: './order-details-page.component.html',
  styleUrl: './order-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersService = inject(OrdersService);

  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly statusColors = ORDER_STATUS_COLORS;
  protected readonly typeLabels = ORDER_TYPE_LABELS;

  protected readonly initials = getInitials;

  private readonly orderId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  private readonly orderResource = resource({
    params: () => this.orderId(),
    loader: ({ params }) =>
      params ? this.ordersService.getOrderById(params) : Promise.resolve(null),
  });

  protected readonly order = computed(() => this.orderResource.value() ?? null);
  protected readonly isLoading = this.orderResource.isLoading;
  protected readonly loadError = this.orderResource.error;

  protected retry(): void {
    void this.orderResource.reload();
  }
}
