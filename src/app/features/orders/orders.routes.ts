import { Routes } from '@angular/router';
import {
  OrderDetailsStore,
  OrdersService,
  ProductionAreasService,
} from '@features/orders/data-access';
import {
  OrderDetailsLayoutComponent,
  OrderInfoTabComponent,
  OrderListComponent,
  OrderMapTabComponent,
} from '@features/orders/pages';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    providers: [OrdersService, ProductionAreasService],
    children: [
      { path: '', component: OrderListComponent },
      {
        path: ':id',
        component: OrderDetailsLayoutComponent,
        providers: [OrderDetailsStore],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'detail' },
          {
            path: 'detail',
            component: OrderInfoTabComponent,
            data: { title: 'Информация' },
          },
          {
            path: 'map',
            component: OrderMapTabComponent,
            data: { title: 'Карта прохождения' },
          },
          { path: '**', redirectTo: 'detail' },
        ],
      },
    ],
  },
];
