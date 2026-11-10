import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  PRODUCTION_AREA_ORDER,
  ProductionArea,
  ProductionAreaType,
  ProductionOperation,
} from '@features/orders/models';
import { OrdersService } from './orders.service';
import { ProductionAreasService } from './production-areas.service';

@Injectable()
export class OrderDetailsStore {
  private readonly ordersService = inject(OrdersService);
  private readonly productionAreasService = inject(ProductionAreasService);
  private readonly message = inject(NzMessageService);

  private readonly currentId = signal<string | null>(null);
  private readonly areasOverride = signal<ProductionArea[] | null>(null);

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

  readonly order = computed(() =>
    this.orderResource.hasValue() ? this.orderResource.value() : null,
  );
  readonly orderLoading = this.orderResource.isLoading;
  readonly orderError = this.orderResource.error;

  readonly areas = computed<readonly ProductionArea[]>(() => {
    const override = this.areasOverride();
    if (override) {
      return override;
    }
    return this.areasResource.hasValue() ? this.areasResource.value() : [];
  });
  readonly areasLoading = this.areasResource.isLoading;
  readonly areasError = this.areasResource.error;

  readonly addingArea = signal(false);
  readonly removingAreaId = signal<string | null>(null);
  readonly clearingAreaId = signal<string | null>(null);
  readonly updatingAreaId = signal<string | null>(null);

  readonly sortedAreas = computed<readonly ProductionArea[]>(() =>
    [...this.areas()].sort(
      (first, second) =>
        PRODUCTION_AREA_ORDER.indexOf(first.type) - PRODUCTION_AREA_ORDER.indexOf(second.type),
    ),
  );

  readonly availableAreaTypes = computed<readonly ProductionAreaType[]>(() => {
    const usedTypes = new Set(this.areas().map((area) => area.type));

    return PRODUCTION_AREA_ORDER.filter((type) => !usedTypes.has(type));
  });

  load(id: string): void {
    if (!id) {
      return;
    }

    this.areasOverride.set(null);

    if (this.currentId() === id) {
      this.reload();
      return;
    }

    this.currentId.set(id);
  }

  retryAreas(): void {
    void this.areasResource.reload();
  }

  async addArea(type: ProductionAreaType): Promise<void> {
    const orderId = this.currentId();

    if (!orderId || this.addingArea()) {
      return;
    }

    this.addingArea.set(true);

    try {
      const area = await this.productionAreasService.addArea(orderId, type);
      this.areasOverride.set([...this.areas(), area]);
    } catch {
      this.message.error('Не удалось добавить участок');
    } finally {
      this.addingArea.set(false);
    }
  }

  async removeArea(areaId: string): Promise<void> {
    const orderId = this.currentId();

    if (!orderId || this.removingAreaId() || this.clearingAreaId()) {
      return;
    }

    this.removingAreaId.set(areaId);

    try {
      await this.productionAreasService.removeArea(orderId, areaId);
      this.areasOverride.set(this.areas().filter((area) => area.id !== areaId));
    } catch {
      this.message.error('Не удалось удалить участок');
    } finally {
      this.removingAreaId.set(null);
    }
  }

  async clearArea(areaId: string): Promise<void> {
    const orderId = this.currentId();

    if (!orderId || this.removingAreaId() || this.clearingAreaId()) {
      return;
    }

    this.clearingAreaId.set(areaId);

    try {
      await this.productionAreasService.clearArea(orderId, areaId);
      this.areasOverride.set(
        this.areas().map((area) => (area.id === areaId ? { ...area, operations: [] } : area)),
      );
    } catch {
      this.message.error('Не удалось очистить участок');
    } finally {
      this.clearingAreaId.set(null);
    }
  }

  async updateArea(areaId: string, operations: ProductionOperation[]): Promise<boolean> {
    const orderId = this.currentId();

    if (!orderId || this.updatingAreaId()) {
      return false;
    }

    this.updatingAreaId.set(areaId);

    try {
      const updated = await this.productionAreasService.updateArea(orderId, areaId, { operations });
      this.areasOverride.set(this.areas().map((area) => (area.id === areaId ? updated : area)));
      this.message.success('Участок сохранён');

      return true;
    } catch {
      this.message.error('Не удалось сохранить участок');

      return false;
    } finally {
      this.updatingAreaId.set(null);
    }
  }

  private reload(): void {
    void this.orderResource.reload();
    void this.areasResource.reload();
  }
}
