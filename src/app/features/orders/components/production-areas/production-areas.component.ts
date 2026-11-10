import {
  ChangeDetectionStrategy,
  Component,
  ViewContainerRef,
  computed,
  inject,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  PRODUCTION_AREA_LABELS,
  ProductionArea,
  ProductionAreaType,
} from '@features/orders/models';
import { OrderDetailsStore } from '@features/orders/data-access';
import { OrderDetailsSkeletonComponent } from '@features/orders/components/order-details-skeleton/order-details-skeleton.component';
import { ProductionAreaCardComponent } from '@features/orders/components/production-area-card/production-area-card.component';
import {
  ProductionAreaFormModalComponent,
  ProductionAreaFormModalData,
} from '@features/orders/components/production-area-form-modal/production-area-form-modal.component';

@Component({
  selector: 'bf-production-areas',
  imports: [
    NzButtonModule,
    NzCardModule,
    NzDropdownModule,
    NzEmptyModule,
    NzIconModule,
    NzMenuModule,
    NzTooltipModule,
    OrderDetailsSkeletonComponent,
    ProductionAreaCardComponent,
  ],
  templateUrl: './production-areas.component.html',
  styleUrl: './production-areas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionAreasComponent {
  protected readonly store = inject(OrderDetailsStore);

  private readonly modal = inject(NzModalService);
  private readonly viewContainerRef = inject(ViewContainerRef);

  protected readonly labels = PRODUCTION_AREA_LABELS;

  protected readonly isAddDisabled = computed(
    () => this.store.addingArea() || this.store.availableAreaTypes().length === 0,
  );

  protected readonly addTooltip = computed(() => {
    if (this.store.availableAreaTypes().length > 0) {
      return null;
    }

    return 'Все участки уже добавлены';
  });

  protected async onAdd(type: ProductionAreaType): Promise<void> {
    if (this.store.addingArea()) {
      return;
    }

    await this.store.addArea(type);

    const area = this.store.areas().find((item) => item.type === type);

    if (area) {
      this.openAreaForm(area);
    }
  }

  protected onEdit(area: ProductionArea): void {
    this.openAreaForm(area);
  }

  private openAreaForm(area: ProductionArea): void {
    this.modal.create<ProductionAreaFormModalComponent, ProductionAreaFormModalData>({
      nzTitle: PRODUCTION_AREA_LABELS[area.type],
      nzContent: ProductionAreaFormModalComponent,
      nzData: { area },
      nzFooter: null,
      nzWidth: 'min(800px, 90vw)',
      nzMaskClosable: false,
      nzKeyboard: true,
      nzViewContainerRef: this.viewContainerRef,
      nzOnCancel: (component) => !component.isSaving(),
    });
  }
}
