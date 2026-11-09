import { Injectable, signal } from '@angular/core';

export interface DashboardStats {
  orders: number;
  customers: number;
  products: number;
  inProduction: number;
}

@Injectable()
export class DashboardService {
  readonly stats = signal<DashboardStats>({
    orders: 0,
    customers: 0,
    products: 0,
    inProduction: 0,
  });
}
