// observer.ts

// ------------------------------------
// Observer
// ------------------------------------

interface Observer {
  update(orderId: string): void;
}


// ------------------------------------
// Concrete Observers
// ------------------------------------

class EmailObserver implements Observer {
  update(orderId: string): void {
    console.log(
      `Sending email for order ${orderId}`
    );
  }
}


class NotificationObserver implements Observer {
  update(orderId: string): void {
    console.log(
      `Sending push notification for order ${orderId}`
    );
  }
}


class AnalyticsObserver implements Observer {
  update(orderId: string): void {
    console.log(
      `Updating analytics for order ${orderId}`
    );
  }
}


class WarehouseObserver implements Observer {
  update(orderId: string): void {
    console.log(
      `Notifying warehouse about order ${orderId}`
    );
  }
}


// ------------------------------------
// Subject
// ------------------------------------

interface Subject {
  subscribe(observer: Observer): void;
  unsubscribe(observer: Observer): void;
  notify(orderId: string): void;
}


// ------------------------------------
// Concrete Subject
// ------------------------------------

class OrderService implements Subject {
  private observers: Observer[] = [];

  subscribe(observer: Observer): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: Observer): void {
    this.observers = this.observers.filter(
      (item) => item !== observer
    );
  }

  notify(orderId: string): void {
    for (const observer of this.observers) {
      observer.update(orderId);
    }
  }

  createOrder(orderId: string): void {
    console.log(`Order ${orderId} created`);

    this.notify(orderId);
  }
}


// ------------------------------------
// Application
// ------------------------------------

const orderService = new OrderService();

const emailObserver = new EmailObserver();
const notificationObserver = new NotificationObserver();
const analyticsObserver = new AnalyticsObserver();
const warehouseObserver = new WarehouseObserver();


// Register observers

orderService.subscribe(emailObserver);
orderService.subscribe(notificationObserver);
orderService.subscribe(analyticsObserver);
orderService.subscribe(warehouseObserver);


// Create order

orderService.createOrder("ORD-1001");