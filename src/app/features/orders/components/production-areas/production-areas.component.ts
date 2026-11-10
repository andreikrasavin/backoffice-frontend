import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { PRODUCTION_AREA_LABELS, ProductionArea } from '@features/orders/models';
import { OrderDetailsStore } from '@features/orders/data-access';
import { OrderDetailsSkeletonComponent } from '@features/orders/components/order-details-skeleton/order-details-skeleton.component';
import { ProductionAreaCardComponent } from '@features/orders/components/production-area-card/production-area-card.component';

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
  private readonly message = inject(NzMessageService);

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

  protected onEdit(area: ProductionArea): void {
    this.message.info(
      `Редактирование участка «${PRODUCTION_AREA_LABELS[area.type]}» будет добавлено позже`,
    );
  }
}
