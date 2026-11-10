import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { ProductionArea } from '@features/orders/models';
import { OrdersService } from './orders.service';
import { ProductionAreasService } from './production-areas.service';

@Injectable()
export class OrderDetailsStore {
  private readonly ordersService = inject(OrdersService);
  private readonly productionAreasService = inject(ProductionAreasService);

  private readonly currentId = signal<string | null>(null);

  private readonly orderResource = resource({
    params: () => this.currentId(),
    loader: ({ params }) =>
      params ? this.ordersService.getOrderById(params) : Promise.resolve(null),
  });

  private readonly areasResource = resource({
    params: () => this.currentId(),
    loader: ({ params }) =>
      params
        ? this.productionAreasService.getAreasByOrderId(params)
        : Promise.resolve<ProductionArea[]>([]),
  });

  readonly order = computed(() => this.orderResource.value() ?? null);
  readonly orderLoading = this.orderResource.isLoading;
  readonly orderError = this.orderResource.error;

  readonly areas = computed(() => this.areasResource.value() ?? []);
  readonly areasLoading = this.areasResource.isLoading;
  readonly areasError = this.areasResource.error;

  load(id: string): void {
    if (!id) {
      return;
    }

    if (this.currentId() === id) {
      this.reload();
      return;
    }

    this.currentId.set(id);
  }

  retryAreas(): void {
    void this.areasResource.reload();
  }

  private reload(): void {
    void this.orderResource.reload();
    void this.areasResource.reload();
  }
}
