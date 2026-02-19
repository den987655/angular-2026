import { Component } from '@angular/core';
import { OrdersUi } from '@app-monorepo/orders-ui';

@Component({
  selector: 'lib-orders-feature',
  standalone: true,
  imports: [OrdersUi],
  templateUrl: './orders-feature.html',
  styleUrl: './orders-feature.css',
})
export class OrdersFeature {}
