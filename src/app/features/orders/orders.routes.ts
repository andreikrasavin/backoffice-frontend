import { Routes } from '@angular/router';
import { OrdersService } from '@features/orders/data-access';
import { OrderListComponent } from '@features/orders/pages';

export const ORDERS_ROUTES: Routes = [
  { path: '', providers: [OrdersService], component: OrderListComponent },
];
