import { Routes } from '@angular/router';
import { OrderListComponent } from './pages/order-list.component';
import { OrdersService } from './data-access/orders.service';

export const ORDERS_ROUTES: Routes = [
  { path: '', providers: [OrdersService], component: OrderListComponent },
];
