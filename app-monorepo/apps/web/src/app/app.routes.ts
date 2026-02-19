import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'orders',
    loadChildren: () =>
      import('@app-monorepo/orders-feature').then(
        (m) => m.ordersFeatureRoutes
      ),
  },
];
