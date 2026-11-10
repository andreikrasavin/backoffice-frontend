import { Routes } from '@angular/router';
import { OrdersService } from '@features/orders/data-access';
import { OrderDetailsPageComponent, OrderListComponent } from '@features/orders/pages';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    providers: [OrdersService],
    children: [
      { path: '', component: OrderListComponent },
      { path: ':id', component: OrderDetailsPageComponent },
    ],
  },
];
