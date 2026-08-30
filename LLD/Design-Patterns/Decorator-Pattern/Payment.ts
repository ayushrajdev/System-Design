// -------------------------------------
// Component
// -------------------------------------

interface PaymentService {
  pay(amount: number): void;
}


// -------------------------------------
// Concrete Component
// -------------------------------------

class BasicPaymentService implements PaymentService {
  pay(amount: number): void {
    console.log(
      `Processing payment of ₹${amount}`
    );
  }
}


// -------------------------------------
// Logging Decorator
// -------------------------------------

class LoggingPaymentDecorator
  implements PaymentService {

  constructor(
    private paymentService: PaymentService
  ) {}

  pay(amount: number): void {
    console.log("Payment started");

    this.paymentService.pay(amount);

    console.log("Payment completed");
  }
}


// -------------------------------------
// Authentication Decorator
// -------------------------------------

class AuthenticationPaymentDecorator
  implements PaymentService {

  constructor(
    private paymentService: PaymentService
  ) {}

  pay(amount: number): void {
    console.log("Checking authentication...");

    const authenticated = true;

    if (!authenticated) {
      console.log("Authentication failed");
      return;
    }

    this.paymentService.pay(amount);
  }
}


// -------------------------------------
// Metrics Decorator
// -------------------------------------

class MetricsPaymentDecorator
  implements PaymentService {

  constructor(
    private paymentService: PaymentService
  ) {}

  pay(amount: number): void {
    const start = Date.now();

    this.paymentService.pay(amount);

    const end = Date.now();

    console.log(
      `Payment processing took ${end - start}ms`
    );
  }
}


// -------------------------------------
// Application
// -------------------------------------

const basicPayment =
  new BasicPaymentService();

const loggingPayment =
  new LoggingPaymentDecorator(
    basicPayment
  );

const authenticatedPayment =
  new AuthenticationPaymentDecorator(
    loggingPayment
  );

const metricsPayment =
  new MetricsPaymentDecorator(
    authenticatedPayment
  );

metricsPayment.pay(1000);