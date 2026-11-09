import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  Order,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_COLORS,
  ORDER_TYPE_LABELS,
  OrderStatus,
  OrderType,
} from '@features/orders/models';
import {
  exportOrdersToCsv,
  filterOrders,
  OrdersFilter,
  OrdersService,
} from '@features/orders/data-access';

const PAGE_SIZE_OPTIONS: number[] = [25, 50, 100];
const DEFAULT_PAGE_SIZE = 50;
const STATUS_ORDER: readonly OrderStatus[] = [
  'new',
  'in_progress',
  'confirmed',
  'in_production',
  'ready_to_ship',
  'shipped',
  'completed',
  'cancelled',
];

@Component({
  selector: 'bf-order-list',
  imports: [
    FormsModule,
    RouterLink,
    NzAvatarModule,
    NzButtonModule,
    NzDatePickerModule,
    NzDropdownModule,
    NzIconModule,
    NzInputModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzTooltipModule,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListComponent {
  private readonly ordersService = inject(OrdersService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly orders = this.ordersService.orders;

  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  readonly typeLabels = ORDER_TYPE_LABELS;
  readonly typeColors = ORDER_TYPE_COLORS;
  readonly statusLabels = ORDER_STATUS_LABELS;
  readonly statusColors = ORDER_STATUS_COLORS;
  readonly typeOptions = (Object.keys(ORDER_TYPE_LABELS) as OrderType[]).map((value) => ({
    value,
    label: ORDER_TYPE_LABELS[value],
  }));
  readonly statusOptions = STATUS_ORDER.map((value) => ({
    value,
    label: ORDER_STATUS_LABELS[value],
  }));

  readonly numberFilter = signal('');
  readonly customerFilter = signal<readonly string[]>([]);
  readonly managerFilter = signal<readonly string[]>([]);
  readonly createdFilter = signal<readonly Date[] | null>(null);
  readonly shippedFilter = signal<readonly Date[] | null>(null);
  readonly typeFilter = signal<readonly OrderType[]>([]);
  readonly statusFilter = signal<readonly OrderStatus[]>([]);

  readonly selectedIds = signal<ReadonlySet<string>>(new Set<string>());
  readonly pageIndex = signal(1);
  readonly pageSize = signal(DEFAULT_PAGE_SIZE);

  readonly currentPage = signal<readonly Order[]>([]);

  readonly filter = computed<OrdersFilter>(() => ({
    number: this.numberFilter(),
    customerIds: this.customerFilter(),
    managerIds: this.managerFilter(),
    createdRange: this.createdFilter(),
    shippedRange: this.shippedFilter(),
    types: this.typeFilter(),
    statuses: this.statusFilter(),
  }));

  readonly filteredOrders = computed(() => filterOrders(this.orders(), this.filter()));

  readonly customerOptions = computed(() => {
    const names = new Map<string, string>();

    for (const order of this.orders()) {
      names.set(order.customer.id, order.customer.name);
    }

    return [...names].map(([value, label]) => ({ value, label }));
  });

  readonly managerOptions = computed(() => {
    const names = new Map<string, string>();

    for (const order of this.orders()) {
      names.set(order.manager.id, order.manager.fullName);
    }

    return [...names].map(([value, label]) => ({ value, label }));
  });

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly hasActiveFilters = computed(
    () =>
      this.numberFilter().trim().length > 0 ||
      this.customerFilter().length > 0 ||
      this.managerFilter().length > 0 ||
      this.createdFilter() !== null ||
      this.shippedFilter() !== null ||
      this.typeFilter().length > 0 ||
      this.statusFilter().length > 0,
  );

  readonly pageAllSelected = computed(() => {
    const page = this.currentPage();

    return page.length > 0 && page.every((order) => this.selectedIds().has(order.id));
  });

  readonly pagePartiallySelected = computed(() => {
    const page = this.currentPage();

    return !this.pageAllSelected() && page.some((order) => this.selectedIds().has(order.id));
  });

  readonly sortByNumber = (a: Order, b: Order): number => a.number.localeCompare(b.number);

  readonly sortByCreatedAt = (a: Order, b: Order): number => a.createdAt.localeCompare(b.createdAt);

  // `null` (ещё не отгружен) уходит в конец при сортировке по возрастанию.
  readonly sortByShippedAt = (a: Order, b: Order): number =>
    (a.shippedAt ?? '9999-12-31').localeCompare(b.shippedAt ?? '9999-12-31');

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const page = Number(params.get('page') ?? 1);
      const size = Number(params.get('pageSize') ?? DEFAULT_PAGE_SIZE);

      if (Number.isInteger(page) && page > 0) {
        this.pageIndex.set(page);
      }

      if (PAGE_SIZE_OPTIONS.includes(size)) {
        this.pageSize.set(size);
      }
    });
  }

  onPageIndexChange(index: number): void {
    this.pageIndex.set(index);
    this.syncQueryParams();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.syncQueryParams();
  }

  onCurrentPageDataChange(orders: readonly Order[]): void {
    this.currentPage.set(orders);
  }

  setNumberFilter(value: string): void {
    this.numberFilter.set(value);
    this.resetPage();
  }

  setCustomerFilter(ids: readonly string[]): void {
    this.customerFilter.set(ids);
    this.resetPage();
  }

  setManagerFilter(ids: readonly string[]): void {
    this.managerFilter.set(ids);
    this.resetPage();
  }

  setCreatedFilter(range: readonly Date[] | null): void {
    this.createdFilter.set(range);
    this.resetPage();
  }

  setShippedFilter(range: readonly Date[] | null): void {
    this.shippedFilter.set(range);
    this.resetPage();
  }

  setTypeFilter(types: readonly OrderType[]): void {
    this.typeFilter.set(types);
    this.resetPage();
  }

  setStatusFilter(statuses: readonly OrderStatus[]): void {
    this.statusFilter.set(statuses);
    this.resetPage();
  }

  resetFilters(): void {
    this.numberFilter.set('');
    this.customerFilter.set([]);
    this.managerFilter.set([]);
    this.createdFilter.set(null);
    this.shippedFilter.set(null);
    this.typeFilter.set([]);
    this.statusFilter.set([]);
    this.resetPage();
  }

  toggleRow(order: Order, checked: boolean): void {
    this.selectedIds.update((ids) => {
      const next = new Set(ids);

      if (checked) {
        next.add(order.id);
      } else {
        next.delete(order.id);
      }

      return next;
    });
  }

  togglePage(checked: boolean): void {
    const page = this.currentPage();

    this.selectedIds.update((ids) => {
      const next = new Set(ids);

      for (const order of page) {
        if (checked) {
          next.add(order.id);
        } else {
          next.delete(order.id);
        }
      }

      return next;
    });
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  createOrder(): void {
    // TODO: navigate to the order creation page when it exists
    this.message.info('Создание заказа будет добавлено позже');
  }

  editOrder(order: Order): void {
    // TODO: navigate to the order editing page when it exists
    this.message.info(`Редактирование заказа ${order.number} будет добавлено позже`);
  }

  exportFiltered(): void {
    const selected = this.selectedIds();
    const orders =
      selected.size > 0
        ? this.orders().filter((order) => selected.has(order.id))
        : this.filteredOrders();

    if (orders.length === 0) {
      this.message.info('Нет заказов для экспорта');

      return;
    }

    exportOrdersToCsv(orders);
  }

  exportSelected(): void {
    const selected = this.selectedIds();
    const orders = this.orders().filter((order) => selected.has(order.id));

    if (orders.length === 0) {
      return;
    }

    exportOrdersToCsv(orders);
  }

  exportOrder(order: Order): void {
    exportOrdersToCsv([order]);
  }

  deleteOrder(order: Order): void {
    this.deleteOrders(new Set([order.id]));
  }

  deleteSelected(): void {
    const ids = this.selectedIds();

    this.modal.confirm({
      nzTitle: 'Удалить выбранные заказы?',
      nzContent: `Будет удалено заказов: ${ids.size}. Действие нельзя отменить.`,
      nzOkText: 'Удалить',
      nzOkDanger: true,
      nzOnOk: () => this.deleteOrders(ids),
    });
  }

  formatDay(iso: string | null): string {
    if (iso === null) {
      return '—';
    }

    const date = new Date(iso);

    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
  }

  initials(fullName: string): string {
    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  private deleteOrders(ids: ReadonlySet<string>): void {
    // TODO: call API
    this.ordersService.remove(ids);
    this.selectedIds.update((selected) => {
      const next = new Set(selected);

      for (const id of ids) {
        next.delete(id);
      }

      return next;
    });

    const lastPage = Math.max(1, Math.ceil(this.filteredOrders().length / this.pageSize()));

    if (this.pageIndex() > lastPage) {
      this.pageIndex.set(lastPage);
      this.syncQueryParams();
    }

    this.message.success(ids.size > 1 ? 'Заказы удалены' : 'Заказ удалён');
  }

  private resetPage(): void {
    if (this.pageIndex() === 1) {
      return;
    }

    this.pageIndex.set(1);
    this.syncQueryParams();
  }

  private syncQueryParams(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.pageIndex(), pageSize: this.pageSize() },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
