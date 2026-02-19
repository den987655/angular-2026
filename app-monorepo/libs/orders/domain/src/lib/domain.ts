export function domain(): string {
  return 'domain';
}

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type OrderId = Brand<string, 'OrderId'>;
export type CustomerId = Brand<string, 'CustomerId'>;
export type Email = Brand<string, 'Email'>;
export type SKU = Brand<string, 'SKU'>;

export interface Money {
  currency: string;
  amount: number;
}

export function makeOrderId(id: string): OrderId {
  return id as OrderId;
}

export function makeCustomerId(id: string): CustomerId {
  return id as CustomerId;
}

export function makeEmail(value: string): Email {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new InvalidEmailError('Invalid email');
  }
  return value as Email;
}

export function makeSKU(id: string): SKU {
  return id as SKU;
}

export function money(amount: number, currency = 'USD'): Money {
  if (amount < 0) {
    throw new DomainValidationError('Money amount cannot be negative');
  }
  return { amount, currency };
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new DomainValidationError('Currency mismatch');
  }
  return { currency: a.currency, amount: Number((a.amount + b.amount).toFixed(2)) };
}

export function multiplyMoney(m: Money, qty: number): Money {
  if (qty < 0) {
    throw new DomainValidationError('Quantity cannot be negative');
  }
  return { currency: m.currency, amount: Number((m.amount * qty).toFixed(2)) };
}

export enum OrderStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Paid = 'Paid',
  Cancelled = 'Cancelled',
}

export interface OrderItem {
  sku: SKU;
  name: string;
  unitPrice: Money;
  qty: number;
}

export interface DomainEvent<T = unknown> {
  type: string;
  occurredAt: Date;
  payload: T;
}

export interface OrderCreatedPayload {
  orderId: OrderId;
  customerId: CustomerId;
  total: Money;
}

export interface OrderCancelledPayload {
  orderId: OrderId;
  reason?: string;
}

export interface OrderPaidPayload {
  orderId: OrderId;
  total: Money;
}

export type OrderCreatedEvent = DomainEvent<OrderCreatedPayload>;
export type OrderCancelledEvent = DomainEvent<OrderCancelledPayload>;
export type OrderPaidEvent = DomainEvent<OrderPaidPayload>;

export class DomainError extends Error {}
export class DomainValidationError extends DomainError {}
export class InvalidEmailError extends DomainValidationError {}
export class OrderStateError extends DomainError {}

export class Order {
  readonly id: OrderId;
  readonly customerId: CustomerId;
  readonly customerEmail: Email;
  private _status: OrderStatus;
  private _items: OrderItem[];
  private _events: DomainEvent[];

  constructor(params: {
    id: OrderId;
    customerId: CustomerId;
    customerEmail: Email;
    items?: OrderItem[];
    status?: OrderStatus;
  }) {
    this.id = params.id;
    this.customerId = params.customerId;
    this.customerEmail = params.customerEmail;
    this._items = [...(params.items ?? [])];
    this._status = params.status ?? OrderStatus.Draft;
    this._events = [];
  }

  get status(): OrderStatus {
    return this._status;
  }

  get items(): ReadonlyArray<OrderItem> {
    return this._items;
  }

  get total(): Money {
    return this._items.reduce((acc, it) => addMoney(acc, multiplyMoney(it.unitPrice, it.qty)), money(0));
  }

  pullEvents(): DomainEvent[] {
    const out = [...this._events];
    this._events = [];
    return out;
  }

  addItem(item: OrderItem): void {
    if (this._status !== OrderStatus.Draft) {
      throw new OrderStateError('Can only add items in Draft');
    }
    if (item.qty <= 0) {
      throw new DomainValidationError('Quantity must be positive');
    }
    this._items.push(item);
  }

  removeItem(sku: SKU): void {
    if (this._status !== OrderStatus.Draft) {
      throw new OrderStateError('Can only remove items in Draft');
    }
    this._items = this._items.filter(i => i.sku !== sku);
  }

  submit(): void {
    if (this._status !== OrderStatus.Draft) {
      throw new OrderStateError('Only Draft orders can be submitted');
    }
    if (this._items.length === 0) {
      throw new DomainValidationError('Order must contain at least one item');
    }
    this._status = OrderStatus.Submitted;
    this._events.push({
      type: 'OrderCreated',
      occurredAt: new Date(),
      payload: { orderId: this.id, customerId: this.customerId, total: this.total },
    } satisfies OrderCreatedEvent);
  }

  cancel(reason?: string): void {
    if (this._status === OrderStatus.Cancelled) {
      return;
    }
    if (this._status === OrderStatus.Paid) {
      throw new OrderStateError('Cannot cancel a paid order');
    }
    this._status = OrderStatus.Cancelled;
    this._events.push({
      type: 'OrderCancelled',
      occurredAt: new Date(),
      payload: { orderId: this.id, reason },
    } satisfies OrderCancelledEvent);
  }

  pay(): void {
    if (this._status !== OrderStatus.Submitted) {
      throw new OrderStateError('Only Submitted orders can be paid');
    }
    this._status = OrderStatus.Paid;
    this._events.push({
      type: 'OrderPaid',
      occurredAt: new Date(),
      payload: { orderId: this.id, total: this.total },
    } satisfies OrderPaidEvent);
  }
}

export interface OrderRepository {
  getById(id: OrderId): Promise<Order | null>;
  save(order: Order): Promise<void>;
  findByCustomer(customerId: CustomerId): Promise<Order[]>;
}

export function createOrder(params: {
  id: OrderId;
  customerId: CustomerId;
  customerEmail: Email;
  items?: OrderItem[];
}): Order {
  return new Order({ ...params, status: OrderStatus.Draft });
}
