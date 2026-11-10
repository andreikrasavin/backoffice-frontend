import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@features/orders/models';
import { OrderDetailsStore } from '@features/orders/data-access';
import { OrderDetailsSkeletonComponent } from '@features/orders/components';
import { BreadcrumbItem, BreadcrumbsComponent } from '@shared/ui';

@Component({
  selector: 'bf-order-details',
  imports: [
    DatePipe,
    RouterLink,
    RouterOutlet,
    NzButtonModule,
    NzEmptyModule,
    NzIconModule,
    NzTabsModule,
    NzTagModule,
    NzTooltipModule,
    BreadcrumbsComponent,
    OrderDetailsSkeletonComponent,
  ],
  templateUrl: './order-details-page.component.html',
  styleUrl: './order-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsLayoutComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly store = inject(OrderDetailsStore);

  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly statusColors = ORDER_STATUS_COLORS;

  protected readonly orderId = signal(this.route.snapshot.paramMap.get('id') ?? '');

  protected readonly activeTabTitle = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.readTabTitle()),
    ),
    { initialValue: this.readTabTitle() },
  );

  protected readonly breadcrumbItems = computed<readonly BreadcrumbItem[]>(() => {
    const order = this.store.order();

    return [
      { label: 'Главная', link: '/dashboard' },
      { label: 'Заказы', link: '/orders' },
      order
        ? { label: order.number, link: ['/orders', order.id, 'detail'] }
        : { label: '', loading: true },
      { label: this.activeTabTitle() },
    ];
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id') ?? ''),
        takeUntilDestroyed(),
      )
      .subscribe((id) => {
        this.orderId.set(id);
        this.store.load(id);
      });
  }

  protected retryLoad(): void {
    this.store.load(this.orderId());
  }

  private readTabTitle(): string {
    let child = this.route.firstChild;

    while (child?.firstChild) {
      child = child.firstChild;
    }

    return (child?.snapshot?.data?.['title'] as string | undefined) ?? '';
  }
}
