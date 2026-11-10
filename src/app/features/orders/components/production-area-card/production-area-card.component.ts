import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  PRODUCTION_AREA_LABELS,
  ProductionArea,
  ProductionOperation,
  ProductionUnit,
} from '@features/orders/models';

const UNIT_ORDER: readonly ProductionUnit[] = ['шт', 'м²', 'м', 'кг'];
const DAY_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

@Component({
  selector: 'bf-production-area-card',
  imports: [
    NzButtonModule,
    NzDropdownModule,
    NzIconModule,
    NzMenuModule,
    NzTableModule,
    NzTooltipModule,
  ],
  templateUrl: './production-area-card.component.html',
  styleUrl: './production-area-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionAreaCardComponent {
  private readonly modal = inject(NzModalService);

  readonly area = input.required<ProductionArea>();
  readonly isRemoving = input(false);
  readonly isClearing = input(false);
  readonly isUpdating = input(false);

  readonly remove = output<void>();
  readonly clear = output<void>();
  readonly edit = output<void>();

  protected readonly label = computed(() => PRODUCTION_AREA_LABELS[this.area().type]);

  protected readonly isBusy = computed(
    () => this.isRemoving() || this.isClearing() || this.isUpdating(),
  );

  protected readonly dateRange = computed(() => {
    const starts = this.area()
      .operations.map((operation) => operation.startDate)
      .filter((value): value is string => value !== null)
      .map((value) => Date.parse(value));
    const ends = this.area()
      .operations.map((operation) => operation.endDate)
      .filter((value): value is string => value !== null)
      .map((value) => Date.parse(value));

    if (starts.length === 0 && ends.length === 0) {
      return 'Даты не заданы';
    }

    const first = starts.length > 0 ? Math.min(...starts) : null;
    const last = ends.length > 0 ? Math.max(...ends) : null;

    if (first !== null && last !== null) {
      return `${this.formatTimestamp(first)} — ${this.formatTimestamp(last)}`;
    }

    if (first !== null) {
      return `с ${this.formatTimestamp(first)}`;
    }

    return `до ${this.formatTimestamp(last ?? 0)}`;
  });

  protected readonly quantityText = computed(() => {
    const totals = new Map<ProductionUnit, number>();

    for (const operation of this.area().operations) {
      totals.set(operation.unit, (totals.get(operation.unit) ?? 0) + operation.quantity);
    }

    const parts = UNIT_ORDER.filter((unit) => (totals.get(unit) ?? 0) > 0).map(
      (unit) => `${totals.get(unit)} ${unit}`,
    );

    return parts.length > 0 ? parts.join(' · ') : '—';
  });

  protected formatOperationRange(operation: ProductionOperation): string {
    const start = operation.startDate
      ? this.formatTimestamp(Date.parse(operation.startDate))
      : null;
    const end = operation.endDate ? this.formatTimestamp(Date.parse(operation.endDate)) : null;

    if (start && end) {
      return `${start} — ${end}`;
    }

    if (start) {
      return `с ${start}`;
    }

    if (end) {
      return `до ${end}`;
    }

    return '—';
  }

  protected confirmClear(): void {
    this.modal.confirm({
      nzTitle: 'Очистить участок?',
      nzContent: `Очистить участок «${this.label()}»? Все операции будут удалены.`,
      nzOkText: 'Очистить',
      nzOkDanger: true,
      nzCancelText: 'Отмена',
      nzOnOk: () => this.clear.emit(),
    });
  }

  protected confirmRemove(): void {
    this.modal.confirm({
      nzTitle: 'Удалить участок?',
      nzContent: `Удалить участок «${this.label()}»? Все операции будут удалены.`,
      nzOkText: 'Удалить',
      nzOkDanger: true,
      nzCancelText: 'Отмена',
      nzOnOk: () => this.remove.emit(),
    });
  }

  private formatTimestamp(timestamp: number): string {
    return DAY_FORMATTER.format(new Date(timestamp));
  }
}
