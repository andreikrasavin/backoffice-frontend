import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DashboardService } from '@features/dashboard/data-access';
import { BreadcrumbItem, BreadcrumbsComponent } from '@shared/ui';

@Component({
  selector: 'bf-dashboard',
  imports: [BreadcrumbsComponent],
  template: `
    <bf-breadcrumbs [items]="breadcrumbs" />

    <h1>Дашборд</h1>
    <p>Заказов: {{ dashboard.stats().orders }}</p>
    <p>Клиентов: {{ dashboard.stats().customers }}</p>
    <p>Продуктов: {{ dashboard.stats().products }}</p>
    <p>В производстве: {{ dashboard.stats().inProduction }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  protected readonly dashboard = inject(DashboardService);

  protected readonly breadcrumbs: readonly BreadcrumbItem[] = [{ label: 'Главная' }];
}
