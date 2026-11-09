import { Component, inject } from '@angular/core';
import { DashboardService } from '../data-access/dashboard.service';

@Component({
  selector: 'bf-dashboard',
  template: `
    <h1>Дашборд</h1>
    <p>Заказов: {{ dashboard.stats().orders }}</p>
    <p>Клиентов: {{ dashboard.stats().customers }}</p>
    <p>Продуктов: {{ dashboard.stats().products }}</p>
    <p>В производстве: {{ dashboard.stats().inProduction }}</p>
  `,
})
export class DashboardComponent {
  protected readonly dashboard = inject(DashboardService);
}
