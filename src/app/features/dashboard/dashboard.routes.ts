import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { DashboardService } from './data-access/dashboard.service';

export const DASHBOARD_ROUTES: Routes = [
  { path: '', providers: [DashboardService], component: DashboardComponent },
];
