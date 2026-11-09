import { Routes } from '@angular/router';
import { DashboardService } from '@features/dashboard/data-access';
import { DashboardComponent } from '@features/dashboard/pages';

export const DASHBOARD_ROUTES: Routes = [
  { path: '', providers: [DashboardService], component: DashboardComponent },
];
