import { Route } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const appRoutes: Route[] = [
  { path: '', loadComponent: () => import('./pages/landing/landing.component').then((m) => m.LandingComponent) },
  { path: 'confirm-email', loadComponent: () => import('./pages/confirm-email/confirm-email.component').then((m) => m.ConfirmEmailComponent) },
  { path: 'signin', canActivate: [guestGuard], loadComponent: () => import('./pages/signin/signin.component').then((m) => m.SignInComponent) },
  { path: 'signup', canActivate: [guestGuard], loadComponent: () => import('./pages/signup/signup.component').then((m) => m.SignUpComponent) },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'invites', loadComponent: () => import('./pages/stub/stub.component').then((m) => m.StubComponent) },
      { path: 'audience', loadComponent: () => import('./pages/stub/stub.component').then((m) => m.StubComponent) },
      { path: 'accounts', loadComponent: () => import('./pages/stub/stub.component').then((m) => m.StubComponent) },
      { path: 'tasks', loadComponent: () => import('./pages/stub/stub.component').then((m) => m.StubComponent) },
      { path: 'proxy', loadComponent: () => import('./pages/stub/stub.component').then((m) => m.StubComponent) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent) },
    ],
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('@app-monorepo/orders-feature').then((m) => m.ordersFeatureRoutes),
  },
];
