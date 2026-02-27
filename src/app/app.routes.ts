import { Routes } from '@angular/router';
import { PublicLayoutComponent } from '@app/layouts/public-layout/public-layout.component';
import { AppShellComponent } from '@app/layouts/app-shell/app-shell.component';
import { authGuard } from '@core/guards/auth.guard';
import { publicOnlyGuard } from '@core/guards/public-only.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@features/marketing/marketing.routes').then((m) => m.MARKETING_ROUTES),
      },
      {
        path: 'login',
        canActivate: [publicOnlyGuard],
        loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
      },
    ],
  },

  {
    path: 'app',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('@features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'tasks',
        loadChildren: () => import('@features/tasks/tasks.routes').then((m) => m.TASKS_ROUTES),
      },
      {
        path: 'insights',
        loadChildren: () =>
          import('@features/insights/insights.routes').then((m) => m.INSIGHTS_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('@features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },

  { path: '404', loadComponent: () => import('@features/not-found/not-found.page').then((m) => m.NotFoundPage) },
  { path: '**', redirectTo: '404' },
];