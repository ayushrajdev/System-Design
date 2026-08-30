# Decorator Design Pattern in TypeScript

The **Decorator Design Pattern** is a structural design pattern that allows us to add new behavior to an existing object without modifying its original class.

The easiest way to understand the pattern is to start with the problem it solves.

---

# 1. Why do we need the Decorator Pattern?

Suppose we are building an e-commerce backend and we have a payment service.

The initial requirement is simple: the service should process a payment.

```ts
class PaymentService {
  pay(amount: number): void {
    console.log(`Processing payment of ₹${amount}`);
  }
}
```

At first, this class is perfectly fine.

But as the application grows, new requirements appear. Before processing a payment, we may need to check authentication. We may want to log the payment. We may want to measure execution time. We may need fraud detection, retry logic, caching, authorization, and so on.

A naive solution is to keep adding these responsibilities to `PaymentService`.

```ts
class PaymentService {
  pay(amount: number): void {
    console.log("Checking authentication...");
    console.log("Checking fraud...");
    console.log("Starting metrics...");
    console.log("Logging payment...");

    console.log(`Processing payment of ₹${amount}`);

    console.log("Recording metrics...");
  }
}
```

This creates a problem. `PaymentService` originally had one responsibility: processing payments. Now it knows about authentication, logging, metrics, fraud detection, and potentially many other concerns.

This also makes the class difficult to change and test.

The next common solution is inheritance. We could create different subclasses such as:

```text
LoggingPaymentService
AuthenticationPaymentService
MetricsPaymentService
```

But what happens when we need combinations?

```text
Logging + Authentication
Logging + Metrics
Authentication + Metrics
Logging + Authentication + Metrics
Logging + Authentication + Retry
...
```

We would need more and more classes to represent combinations of behavior.

This is called **class explosion**.

The Decorator Pattern provides another approach: instead of modifying the original object or creating a subclass for every combination, we **wrap the object with other objects that add behavior**.

---

# 2. What is the Decorator Pattern?

The Decorator Pattern is a **structural design pattern** that allows us to dynamically add responsibilities or behavior to an object without modifying its original class.

The decorator wraps another object and implements the same interface as the object it wraps.

Conceptually:

```text
Decorator
    |
    v
Original Object
```

Multiple decorators can be stacked:

```text
MetricsDecorator
       |
       v
AuthenticationDecorator
       |
       v
LoggingDecorator
       |
       v
BasicPaymentService
```

The important idea is that every layer implements the same interface.

This means the outer layer can treat the inner layer exactly like the original service.

---

# 3. Start with the common interface

Let's define the interface for our payment service.

```ts
interface PaymentService {
  pay(amount: number): void;
}
```

This interface says that anything that behaves like a payment service must provide a `pay()` method.

Now we create the original implementation.

```ts
class BasicPaymentService implements PaymentService {
  pay(amount: number): void {
    console.log(`Processing payment of ₹${amount}`);
  }
}
```

This is called the **Concrete Component**.

We can use it normally:

```ts
const paymentService = new BasicPaymentService();

paymentService.pay(1000);
```

Output:

```text
Processing payment of ₹1000
```

At this point there is no decorator involved.

---

# 4. Creating the first Decorator

Suppose we want to add logging.

We don't want to modify `BasicPaymentService`.

Instead, we create a decorator.

```ts
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
```

There are two very important things happening here.

First, the decorator implements the same interface:

```ts
implements PaymentService
```

Second, it contains another `PaymentService`:

```ts
private paymentService: PaymentService
```

This means the decorator can wrap the original service.

We can now write:

```ts
const basicPayment =
  new BasicPaymentService();

const loggingPayment =
  new LoggingPaymentDecorator(
    basicPayment
  );
```

The relationship now looks like:

```text
LoggingPaymentDecorator
          |
          v
BasicPaymentService
```

---

# 5. What actually happens when the method is called?

Now we call:

```ts
loggingPayment.pay(1000);
```

The variable `loggingPayment` points to the `LoggingPaymentDecorator`, so the first method that executes is:

```ts
LoggingPaymentDecorator.pay()
```

The decorator first executes:

```ts
console.log("Payment started");
```

Then it reaches:

```ts
this.paymentService.pay(amount);
```

The `paymentService` property contains the `BasicPaymentService` object.

Therefore the call moves into:

```ts
BasicPaymentService.pay()
```

which executes:

```ts
console.log(
  `Processing payment of ₹${amount}`
);
```

Once the original payment operation finishes, execution returns to the decorator.

The decorator then executes:

```ts
console.log("Payment completed");
```

Therefore the output is:

```text
Payment started
Processing payment of ₹1000
Payment completed
```

This is the fundamental behavior of the Decorator Pattern:

> The decorator receives the method call, performs additional behavior, delegates to the wrapped object, and can perform more behavior after the wrapped operation finishes.

---

# 6. Adding another Decorator

Now suppose we also want authentication.

We create another decorator:

```ts
class AuthenticationPaymentDecorator
  implements PaymentService {

  constructor(
    private paymentService: PaymentService
  ) {}

  pay(amount: number): void {
    console.log(
      "Checking authentication..."
    );

    const authenticated = true;

    if (!authenticated) {
      console.log(
        "Authentication failed"
      );

      return;
    }

    this.paymentService.pay(amount);
  }
}
```

Again, we haven't modified the original payment service.

We can now compose the decorators:

```ts
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
```

The structure is now:

```text
AuthenticationPaymentDecorator
             |
             v
     LoggingPaymentDecorator
             |
             v
      BasicPaymentService
```

When we call:

```ts
authenticatedPayment.pay(1000);
```

the call first enters the authentication decorator.

It checks authentication and then calls:

```ts
this.paymentService.pay(amount);
```

But the wrapped object is the logging decorator.

Therefore the call moves into the logging decorator.

The logging decorator performs its logging and then calls the original `BasicPaymentService`.

The execution therefore becomes:

```text
Checking authentication...
Payment started
Processing payment of ₹1000
Payment completed
```

The authentication decorator did not need to know whether it was wrapping `BasicPaymentService` or another decorator.

It only knows that the object implements:

```ts
PaymentService
```

That is what makes decorators composable.

---

# 7. Adding a Metrics Decorator

We can continue adding behavior without modifying any existing class.

```ts
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
```

Now we can create the complete chain:

```ts
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
```

The runtime structure becomes:

```text
MetricsPaymentDecorator
          |
          v
AuthenticationPaymentDecorator
          |
          v
LoggingPaymentDecorator
          |
          v
BasicPaymentService
```

From the outside, `metricsPayment` still behaves like a normal `PaymentService`.

---

# 8. Complete TypeScript Example

```ts
// -------------------------------------
// Component
// -------------------------------------

interface PaymentService {
  pay(amount: number): void;
}


// -------------------------------------
// Concrete Component
// -------------------------------------

class BasicPaymentService
  implements PaymentService {

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
    console.log(
      "Checking authentication..."
    );

    const authenticated = true;

    if (!authenticated) {
      console.log(
        "Authentication failed"
      );

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
```

Output will look like:

```text
Checking authentication...
Payment started
Processing payment of ₹1000
Payment completed
Payment processing took 0ms
```

The timing value can be different depending on execution time.

---

# 9. Understanding the runtime execution

The most important part of this pattern is understanding what happens when:

```ts
metricsPayment.pay(1000);
```

is called.

`metricsPayment` is a `MetricsPaymentDecorator`. Therefore the first method that executes is the `pay()` method inside the metrics decorator.

The metrics decorator records the start time and then executes:

```ts
this.paymentService.pay(amount);
```

Its `paymentService` is actually the `AuthenticationPaymentDecorator`.

The authentication decorator now receives the call. It performs the authentication check. Because authentication succeeds, it again delegates:

```ts
this.paymentService.pay(amount);
```

Its wrapped object is the `LoggingPaymentDecorator`.

The logging decorator receives the call and prints `"Payment started"`. It then delegates to its wrapped object.

Finally, the call reaches `BasicPaymentService`, which performs the actual payment processing.

Once `BasicPaymentService` finishes, execution returns to the logging decorator. The logging decorator prints `"Payment completed"` and returns.

Execution then returns to the authentication decorator, which also returns.

Finally, execution returns to the metrics decorator. It records the end time and calculates the duration.

The important thing is that the call travels **into the chain**, reaches the original operation, and then returns **back through the chain**.

---

# 10. Why do all decorators implement the same interface?

This is the most important design decision in the pattern.

We have:

```ts
interface PaymentService {
  pay(amount: number): void;
}
```

The original service implements it:

```ts
class BasicPaymentService
  implements PaymentService
```

The logging decorator implements it:

```ts
class LoggingPaymentDecorator
  implements PaymentService
```

The authentication decorator implements it:

```ts
class AuthenticationPaymentDecorator
  implements PaymentService
```

The metrics decorator implements it:

```ts
class MetricsPaymentDecorator
  implements PaymentService
```

Because every layer implements `PaymentService`, a decorator can accept another decorator.

For example:

```ts
new LoggingPaymentDecorator(
  new BasicPaymentService()
);
```

But this also works:

```ts
new LoggingPaymentDecorator(
  new AuthenticationPaymentDecorator(
    new BasicPaymentService()
  )
);
```

And this works too:

```ts
new MetricsPaymentDecorator(
  new LoggingPaymentDecorator(
    new AuthenticationPaymentDecorator(
      new BasicPaymentService()
    )
  )
);
```

The decorator doesn't care what is inside it.

It only cares that the wrapped object follows the expected interface.

---

# 11. Decorator uses composition instead of inheritance

The Decorator Pattern is a classic example of:

> **Favor composition over inheritance.**

Inheritance creates an "is-a" relationship.

For example:

```ts
class LoggingPaymentService
  extends BasicPaymentService {
}
```

Here `LoggingPaymentService` is a specialized type of `BasicPaymentService`.

Decorator uses composition.

```ts
class LoggingPaymentDecorator
  implements PaymentService {

  constructor(
    private paymentService: PaymentService
  ) {}
}
```

Here the decorator **has a** `PaymentService`.

The relationship is:

```text
LoggingPaymentDecorator
        |
        | has
        v
PaymentService
```

This gives us much more flexibility because the wrapped object can be changed at runtime.

---

# 12. Why not use inheritance?

Suppose we need these behaviors:

```text
Logging
Authentication
Metrics
Retry
Fraud Detection
Caching
Authorization
```

With inheritance, we could create individual classes:

```text
LoggingPaymentService
AuthenticationPaymentService
MetricsPaymentService
RetryPaymentService
```

But eventually we need combinations:

```text
Logging + Authentication
Logging + Metrics
Authentication + Metrics
Logging + Authentication + Metrics
Logging + Authentication + Retry
...
```

The number of combinations grows quickly.

Decorator allows us to create each behavior once and compose them:

```ts
const payment =
  new RetryDecorator(
    new MetricsDecorator(
      new LoggingDecorator(
        new AuthenticationDecorator(
          new BasicPaymentService()
        )
      )
    )
  );
```

We don't need a new class for the combination.

This is the main reason Decorator helps avoid class explosion.

---

# 13. Decorator order matters

Consider:

```ts
const payment =
  new LoggingPaymentDecorator(
    new AuthenticationPaymentDecorator(
      new BasicPaymentService()
    )
  );
```

Here logging is outside authentication.

Now reverse the order:

```ts
const payment =
  new AuthenticationPaymentDecorator(
    new LoggingPaymentDecorator(
      new BasicPaymentService()
    )
  );
```

The execution order changes.

This matters in real systems.

For example, if authentication is outside logging, an unauthenticated request may be rejected before it reaches the logging decorator.

If logging is outside authentication, the request can be logged before authentication rejects it.

The same issue appears with:

```text
Authentication
Authorization
Caching
Retry
Logging
Metrics
Transaction
Validation
```

Therefore, **decorator ordering is part of the behavior of the system**.

---

# 14. Real-world backend example

Decorator is particularly useful for repository and service abstractions.

Suppose we have:

```ts
interface UserRepository {
  findUser(id: string): Promise<string>;
}
```

The actual database implementation can be:

```ts
class DatabaseUserRepository
  implements UserRepository {

  async findUser(id: string): Promise<string> {
    console.log(
      `Querying database for user ${id}`
    );

    return `User-${id}`;
  }
}
```

Now we want caching without changing the database repository.

```ts
class CachedUserRepository
  implements UserRepository {

  private cache = new Map<string, string>();

  constructor(
    private repository: UserRepository
  ) {}

  async findUser(id: string): Promise<string> {
    const cachedUser = this.cache.get(id);

    if (cachedUser) {
      console.log(
        "Returning user from cache"
      );

      return cachedUser;
    }

    const user =
      await this.repository.findUser(id);

    this.cache.set(id, user);

    return user;
  }
}
```

We can also add logging:

```ts
class LoggedUserRepository
  implements UserRepository {

  constructor(
    private repository: UserRepository
  ) {}

  async findUser(id: string): Promise<string> {
    console.log(
      `Finding user ${id}`
    );

    const user =
      await this.repository.findUser(id);

    console.log(
      `User ${id} found`
    );

    return user;
  }
}
```

Now compose them:

```ts
const databaseRepository =
  new DatabaseUserRepository();

const cachedRepository =
  new CachedUserRepository(
    databaseRepository
  );

const loggedRepository =
  new LoggedUserRepository(
    cachedRepository
  );
```

The application only needs to know:

```ts
UserRepository
```

It doesn't need to know whether the implementation is a database repository, cached repository, logged repository, or a combination of all of them.

This is a practical example of using Decorator to add **caching and logging** without modifying the core repository.

---

# 15. Decorator vs Proxy

Decorator and Proxy can look very similar because both wrap another object.

The difference is mainly their **intent**.

Decorator primarily exists to **add behavior**.

For example:

```text
PaymentService
     |
     v
LoggingDecorator
     |
     v
PaymentService
```

Proxy primarily exists to **control access** to another object.

For example:

```text
Client
  |
  v
Proxy
  |
  | authorization
  | access control
  |
  v
Real Object
```

There can be overlap in implementation, but when explaining the patterns in an interview, focus on their intent.

**Decorator:** "I want to enhance this object."

**Proxy:** "I want to control access to this object."

---

# 16. Decorator vs Adapter

Adapter solves a different problem.

Suppose our application expects:

```ts
interface PaymentGateway {
  pay(amount: number): void;
}
```

But a third-party library provides:

```ts
class ThirdPartyPayment {
  makePayment(amount: number): void {
    console.log("Payment");
  }
}
```

The interfaces don't match.

An Adapter converts the third-party interface into the interface our application expects.

Decorator does not change the interface.

It keeps the same interface while adding behavior.

Therefore:

```text
Adapter   -> changes/adapts interface
Decorator -> adds behavior
```

---

# 17. Decorator vs Observer

These patterns solve completely different problems.

Observer is about **notification**.

A Subject notifies multiple interested observers:

```text
Subject
  |
  +---- Observer
  +---- Observer
  +---- Observer
```

Decorator is about **wrapping**.

One decorator wraps another object:

```text
Decorator
    |
    v
Decorator
    |
    v
Original Object
```

So remember:

```text
Observer  -> one object notifies many objects
Decorator -> one object wraps another object
```

---

# 18. Advantages of Decorator

The biggest advantage is that we can add behavior without modifying the original class. This follows the **Open/Closed Principle**: the core component can remain closed for modification while new behavior is introduced through new decorators.

Decorator also encourages composition. Instead of creating a large inheritance hierarchy, we can build behavior dynamically by combining small objects.

Another advantage is that each decorator can have one focused responsibility. Logging can remain responsible for logging, caching can remain responsible for caching, and metrics can remain responsible for metrics.

Decorators are also reusable. The same logging decorator can potentially wrap many implementations that follow the same interface.

---

# 19. Disadvantages of Decorator

The biggest disadvantage is that too many decorators can make the object structure difficult to understand.

For example:

```ts
new A(
  new B(
    new C(
      new D(
        new E(
          new Service()
        )
      )
    )
  )
);
```

It may become difficult to determine which behavior is executing and in what order.

Debugging can also become more complicated because a method call passes through multiple objects.

Decorator ordering can also introduce subtle bugs when behaviors depend on each other.

Therefore, Decorator is most useful when the additional behaviors are genuinely independent and composable.

---

# 20. TypeScript decorators vs Decorator Design Pattern

There is an important terminology distinction in TypeScript.

TypeScript also has a language feature called **decorators**, where code can look like:

```ts
@Something()
class MyClass {
}
```

That is a **language feature**.

The Decorator Design Pattern discussed in this README is the classic object-oriented structural design pattern where one object wraps another object and adds behavior.

They are related conceptually, but they are not the same thing.

When an interviewer asks about the **Decorator Design Pattern**, explain the object-wrapping and composition approach.

---

# 21. Interview-ready definition

If an interviewer asks:

> What is the Decorator Design Pattern?

A strong answer is:

> The Decorator Pattern is a structural design pattern that allows us to dynamically add responsibilities or behavior to an existing object without modifying its original class. A decorator implements the same interface as the object it wraps and contains a reference to that object. When a method is called, the decorator can perform additional behavior before or after delegating the operation to the wrapped object. Because decorators and the original object share the same interface, multiple decorators can be composed at runtime. This helps us favor composition over inheritance and avoid class explosion.

The essential structure is:

```ts
interface Component {
  operation(): void;
}

class ConcreteComponent implements Component {
  operation(): void {
    console.log("Original behavior");
  }
}

class Decorator implements Component {
  constructor(
    private component: Component
  ) {}

  operation(): void {
    console.log("Additional behavior");

    this.component.operation();

    console.log("More behavior");
  }
}
```

The most important mental model is:

```text
Decorator implements the same interface
Decorator contains another Component
Decorator adds behavior
Decorator delegates to the wrapped Component
Multiple decorators can be stacked
```

In one sentence:

> **Decorator lets you wrap an object with additional objects to add behavior dynamically while keeping the same interface and avoiding modification or subclass explosion.**
