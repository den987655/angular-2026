import { Module } from '@nestjs/common';

import { OrderRepository, Order, CustomerId, OrderId } from '../../../domain/src';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

class InMemoryOrderRepository implements OrderRepository {
  private readonly store = new Map<OrderId, Order>();

  async getById(id: OrderId): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }

  async save(order: Order): Promise<void> {
    this.store.set(order.id, order);
  }

  async findByCustomer(customerId: CustomerId): Promise<Order[]> {
    return Array.from(this.store.values()).filter(o => o.customerId === customerId);
  }
}

@Module({
  controllers: [],
  providers: [
    {
      provide: ORDER_REPOSITORY,
      useClass: InMemoryOrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrdersDataAccessModule {}
