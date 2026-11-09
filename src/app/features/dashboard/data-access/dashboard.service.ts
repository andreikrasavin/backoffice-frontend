import { Injectable, signal } from '@angular/core';
import type { DashboardStats } from '@features/dashboard/models';

@Injectable()
export class DashboardService {
  readonly stats = signal<DashboardStats>({
    orders: 0,
    customers: 0,
    products: 0,
    inProduction: 0,
  });
}
