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
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  Order,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  OrderStatus,
  OrderType,
} from '@features/orders/models';
import {
  AmountRangeFilter,
  DateRangeFilter,
  EMPTY_AMOUNT_FILTER,
  EMPTY_DATE_FILTER,
  exportOrdersToCsv,
  filterOrders,
  isAmountFilterActive,
  isDateFilterActive,
  OrdersFilter,
  OrdersService,
} from '@features/orders/data-access';
import {
  OrdersAmountFilterComponent,
  OrdersCheckboxFilterComponent,
  OrdersDateFilterComponent,
  OrdersFilterPanelComponent,
} from '@features/orders/components';
import { MoneyRubPipe } from '@shared/pipes';

const PAGE_SIZE_OPTIONS: number[] = [25, 50, 100];
const DEFAULT_PAGE_SIZE = 50;

type OrderFilterKey =
  'number' | 'customer' | 'manager' | 'created' | 'shipped' | 'status' | 'amount';

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
    NzTableModule,
    NzTagModule,
    NzTooltipModule,
    MoneyRubPipe,
    OrdersAmountFilterComponent,
    OrdersCheckboxFilterComponent,
    OrdersDateFilterComponent,
    OrdersFilterPanelComponent,
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
  readonly createdFilter = signal<DateRangeFilter>(EMPTY_DATE_FILTER);
  readonly shippedFilter = signal<DateRangeFilter>(EMPTY_DATE_FILTER);
  readonly typeFilter = signal<readonly OrderType[]>([]);
  readonly statusFilter = signal<readonly OrderStatus[]>([]);
  readonly amountFilter = signal<AmountRangeFilter>(EMPTY_AMOUNT_FILTER);

  /** Ключ открытого попапа фильтра — нужен, чтобы «Применить» закрывал его. */
  readonly openFilter = signal<OrderFilterKey | null>(null);

  readonly selectedIds = signal<ReadonlySet<string>>(new Set<string>());
  readonly pageIndex = signal(1);
  readonly pageSize = signal(DEFAULT_PAGE_SIZE);

  readonly currentPage = signal<readonly Order[]>([]);

  readonly filter = computed<OrdersFilter>(() => ({
    number: this.numberFilter(),
    customerIds: this.customerFilter(),
    managerIds: this.managerFilter(),
    created: this.createdFilter(),
    shipped: this.shippedFilter(),
    types: this.typeFilter(),
    statuses: this.statusFilter(),
    amount: this.amountFilter(),
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

  readonly createdActive = computed(() => isDateFilterActive(this.createdFilter()));

  readonly shippedActive = computed(() => isDateFilterActive(this.shippedFilter()));

  readonly amountActive = computed(() => isAmountFilterActive(this.amountFilter()));

  readonly hasActiveFilters = computed(
    () =>
      this.numberFilter().trim().length > 0 ||
      this.customerFilter().length > 0 ||
      this.managerFilter().length > 0 ||
      this.createdActive() ||
      this.shippedActive() ||
      this.typeFilter().length > 0 ||
      this.statusFilter().length > 0 ||
      this.amountActive(),
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

  readonly sortByAmount = (a: Order, b: Order): number =>
    a.totalAmountKopecks - b.totalAmountKopecks;

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

  setCreatedFilter(filter: DateRangeFilter): void {
    this.createdFilter.set(filter);
    this.resetPage();
  }

  setShippedFilter(filter: DateRangeFilter): void {
    this.shippedFilter.set(filter);
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

  setAmountFilter(filter: AmountRangeFilter): void {
    this.amountFilter.set(filter);
    this.resetPage();
  }

  /** Чекбокс-список отдаёт строки; оставляем только известные типы. */
  onTypeFilterChange(values: readonly string[]): void {
    this.setTypeFilter(values.filter((value): value is OrderType => value in ORDER_TYPE_LABELS));
  }

  /** Чекбокс-список отдаёт строки; оставляем только известные статусы. */
  onStatusFilterChange(values: readonly string[]): void {
    this.setStatusFilter(
      values.filter((value): value is OrderStatus => value in ORDER_STATUS_LABELS),
    );
  }

  resetFilters(): void {
    this.numberFilter.set('');
    this.customerFilter.set([]);
    this.managerFilter.set([]);
    this.createdFilter.set(EMPTY_DATE_FILTER);
    this.shippedFilter.set(EMPTY_DATE_FILTER);
    this.typeFilter.set([]);
    this.statusFilter.set([]);
    this.amountFilter.set(EMPTY_AMOUNT_FILTER);
    this.openFilter.set(null);
    this.resetPage();
  }

  /** Сброс колонки «Номер заказа»: там же живёт фильтр по типу, поэтому чистим оба. */
  resetNumberFilter(): void {
    this.numberFilter.set('');
    this.typeFilter.set([]);
    this.resetPage();
  }

  resetCustomerFilter(): void {
    this.setCustomerFilter([]);
  }

  resetManagerFilter(): void {
    this.setManagerFilter([]);
  }

  resetCreatedFilter(): void {
    this.setCreatedFilter(EMPTY_DATE_FILTER);
  }

  resetShippedFilter(): void {
    this.setShippedFilter(EMPTY_DATE_FILTER);
  }

  resetStatusFilter(): void {
    this.setStatusFilter([]);
  }

  resetAmountFilter(): void {
    this.setAmountFilter(EMPTY_AMOUNT_FILTER);
  }

  setFilterVisible(key: OrderFilterKey, visible: boolean): void {
    this.openFilter.set(visible ? key : null);
  }

  applyFilter(): void {
    this.openFilter.set(null);
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
