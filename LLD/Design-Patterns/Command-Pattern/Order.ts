// ------------------------------------
// Command
// ------------------------------------

export interface Command {
  execute(): void;
}


// ------------------------------------
// Receiver
// ------------------------------------

class OrderService {
  placeOrder(orderId: string): void {
    console.log(`Placing order ${orderId}`);
  }

  cancelOrder(orderId: string): void {
    console.log(`Cancelling order ${orderId}`);
  }

  refundOrder(orderId: string): void {
    console.log(`Refunding order ${orderId}`);
  }
}


// ------------------------------------
// Concrete Command
// ------------------------------------

class PlaceOrderCommand implements Command {
  constructor(
    private orderService: OrderService,
    private orderId: string
  ) {}

  execute(): void {
    this.orderService.placeOrder(this.orderId);
  }
}


// ------------------------------------
// Concrete Command
// ------------------------------------

class CancelOrderCommand implements Command {
  constructor(
    private orderService: OrderService,
    private orderId: string
  ) {}

  execute(): void {
    this.orderService.cancelOrder(this.orderId);
  }
}


// ------------------------------------
// Concrete Command
// ------------------------------------

class RefundOrderCommand implements Command {
  constructor(
    private orderService: OrderService,
    private orderId: string
  ) {}

  execute(): void {
    this.orderService.refundOrder(this.orderId);
  }
}


// ------------------------------------
// Invoker
// ------------------------------------

class CommandInvoker {
  execute(command: Command): void {
    command.execute();
  }
}


// ------------------------------------
// Client
// ------------------------------------

const orderService = new OrderService();

const invoker = new CommandInvoker();

const placeCommand = new PlaceOrderCommand(
  orderService,
  "ORD-1001"
);

const cancelCommand = new CancelOrderCommand(
  orderService,
  "ORD-1001"
);

const refundCommand = new RefundOrderCommand(
  orderService,
  "ORD-1001"
);

invoker.execute(placeCommand);
invoker.execute(cancelCommand);
invoker.execute(refundCommand);