# Strategy Design Pattern

The **Strategy Design Pattern** is a behavioral design pattern used when a system has **one responsibility or job, but multiple interchangeable ways to perform that job**.

The central idea is:

> **Encapsulate the behavior that varies, expose a common contract, and let the context use whichever strategy it needs without knowing the implementation details.**

This README explains how to recognize the pattern, how to think about it, how the runtime flow works, and how to implement it in **TypeScript** and **Go**.

---

## 1. Start With the Problem

Do not start by asking, "Where can I use Strategy?"

Start by looking at the business problem:

> **Do I have one job that can be performed in multiple ways?**

For example, imagine a hotel booking system that calculates a room price.

At first, there may be only one pricing rule:

```text
Calculate Booking Price
        |
        v
   Normal Pricing
```

No Strategy Pattern is necessary because there is only one algorithm.

Later, the business introduces:

```text
Calculate Booking Price
        |
        +-------------------+
        |         |         |
        v         v         v
      Normal    Premium   Weekend
      Pricing   Pricing   Pricing
```

Now there are multiple algorithms for the **same responsibility**.

That is where Strategy becomes a strong candidate.

---

## 2. The Core Thinking Rule

The easiest rule to remember is:

```text
                 ONE JOB
                   |
          +--------+--------+
          |        |        |
          v        v        v
       Way A     Way B     Way C
          |        |        |
          +--------+--------+
                   |
                   v
             STRATEGY PATTERN
```

Examples:

| One Job | Possible Strategies |
|---|---|
| Payment | Card, UPI, PayPal |
| Pricing | Normal, Premium, Festival |
| Shipping | Standard, Express, Same Day |
| Notification | Email, SMS, Push |
| Compression | ZIP, GZIP, Brotli |
| Refund | Full, Partial, No Refund |
| Authentication | Password, OAuth, API Key |

The important part is not the number of `if` statements. The important part is whether the branches represent **different algorithms or behaviors for the same responsibility**.

---

## 3. The Problem Without Strategy

Suppose payment is implemented like this:

```ts
class PaymentService {
  pay(type: string, amount: number) {
    if (type === "upi") {
      // UPI implementation
    } else if (type === "card") {
      // Card implementation
    } else if (type === "paypal") {
      // PayPal implementation
    }
  }
}
```

This creates a growing class:

```text
                     PaymentService
                           |
                 +---------+---------+
                 |         |         |
                 v         v         v
                UPI       Card     PayPal
             algorithm   algorithm  algorithm
```

The service now knows how every payment mechanism works.

As more payment methods are added, the same class keeps changing:

```text
UPI
Card
PayPal
Stripe
Wallet
Net Banking
...
```

This creates several problems:

- The class grows.
- The class becomes responsible for multiple algorithms.
- Adding a new algorithm requires modifying existing code.
- Individual algorithms become harder to test independently.
- The service becomes tightly coupled to implementation details.

The deeper problem is:

> **The class that uses the behavior is also responsible for implementing every variation of that behavior.**

---

## 4. Strategy Pattern Solution

Strategy extracts the varying behavior behind a common interface.

```text
                         CONTEXT
                    +---------------+
                    | PaymentService |
                    +-------+-------+
                            |
                           HAS-A
                            |
                            v
                  +--------------------+
                  |  PaymentStrategy   |
                  |    <<interface>>   |
                  |                    |
                  | pay(amount)        |
                  +---------+----------+
                            ^
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
         +---------+    +---------+    +---------+
         |   UPI   |    |  Card   |    | PayPal  |
         +---------+    +---------+    +---------+
```

The `PaymentService` now knows only:

```text
"I have something that can perform pay(amount)."
```

It does not need to know how UPI, Card, or PayPal works internally.

---

## 5. The Three Main Parts

### Strategy

The Strategy is the common contract for all algorithms.

Example:

```ts
interface PaymentStrategy {
  pay(amount: number): Promise<void>;
}
```

Every payment implementation must follow that contract.

### Concrete Strategy

A Concrete Strategy contains one specific algorithm.

```text
PaymentStrategy
    |
    +-- UPIPayment
    +-- CardPayment
    +-- PayPalPayment
```

### Context

The Context is the class that needs the behavior.

```text
PaymentService
      |
      +-- uses PaymentStrategy
```

The Context delegates the work to the Strategy.

---

## 6. How the Runtime Flow Works

Suppose the customer selected UPI.

The flow is:

```text
             User selects UPI
                    |
                    v
          Create UPIPayment
                    |
                    v
          Give it to Context
                    |
                    v
            PaymentService
                    |
                    | pay(5000)
                    v
           PaymentStrategy
                    |
                    v
              UPIPayment
                    |
                    v
            UPI algorithm
                    |
                    v
                Result
```

The most important execution sequence is:

```text
1. Choose a strategy.
2. Give that strategy to the context.
3. Context calls the common method.
4. Polymorphism routes the call to the selected implementation.
5. The selected strategy executes its algorithm.
6. The result returns to the context.
```

---

## 7. How to Decide Whether to Use Strategy

Use this decision process while designing code.

```text
             I have some functionality
                       |
                       v
           Are there multiple ways to
                perform this job?
                  /          \
                NO            YES
                |              |
                v              v
        Probably don't   Are they different
          need Strategy   algorithms for the
                         same responsibility?
                             /      \
                           NO        YES
                           |          |
                           v          v
                    Probably don't   Are these
                      need Strategy   algorithms likely
                                     to change independently?
                                          /      \
                                        NO        YES
                                        |          |
                                        v          v
                                   Maybe keep it   Strategy is
                                   simple for now    a strong candidate
```

### The questions to ask

1. **What is the single job?**
2. **Can that job be performed in multiple ways?**
3. **Are those ways genuinely different algorithms or behaviors?**
4. **Could those algorithms change independently?**
5. **Would keeping them together create a growing `if/else` or `switch`?**
6. **Would it be useful to swap the algorithm without changing the main class?**

If the answers are mostly yes, Strategy is probably appropriate.

---

## 8. Do Not Use Strategy Just Because You See `if/else`

This is an important distinction.

The presence of `if/else` by itself does **not** mean Strategy should be used.

For example:

```ts
if (age < 18) {
  return "minor";
}

return "adult";
```

This is not automatically a Strategy problem.

Instead ask:

> **Are the branches different implementations of the same business behavior?**

Compare:

```ts
if (paymentType === "upi") {
  payUsingUPI();
} else if (paymentType === "card") {
  payUsingCard();
}
```

Here both branches perform the same conceptual job:

```text
              PAYMENT
                 |
          +------+------+
          |             |
         UPI           CARD
```

That is a strong Strategy candidate.

---

## 9. The "What Varies?" Question

A very useful design principle is:

> **Identify what is likely to vary and separate it from what is likely to stay stable.**

For example:

```text
Stable part:
    BookingService

Changing part:
    Pricing algorithm

Stable part:
    call calculatePrice()

Changing part:
    how calculatePrice() actually works
```

So the changing part becomes the Strategy.

```text
                BookingService
                      |
                      | uses
                      v
               PricingStrategy
                      ^
          +-----------+-----------+
          |           |           |
          v           v           v
       Normal      Premium      Weekend
       Strategy    Strategy     Strategy
```

---

## 10. Strategy and Composition

Strategy is usually built using **composition** rather than inheritance.

The Context:

```text
PaymentService HAS-A PaymentStrategy
```

In code:

```ts
class PaymentService {
  constructor(private strategy: PaymentStrategy) {}
}
```

That is different from inheritance:

```text
PaymentService IS-A PaymentStrategy
```

Strategy is generally about saying:

> "This object has a behavior that can be replaced."

---

# TypeScript Implementation

## 11. Complete TypeScript Example

We will build a payment system with:

- UPI
- Card
- PayPal
- A `PaymentStrategy` interface
- A `PaymentService` context
- A small factory to choose the strategy

### Step 1: Define the Strategy

```ts
export interface PaymentStrategy {
  pay(amount: number): Promise<void>;
}
```

This is the contract shared by all payment algorithms.

---

### Step 2: Implement Concrete Strategies

#### UPI

```ts
import { PaymentStrategy } from "./PaymentStrategy";

export class UPIPayment implements PaymentStrategy {
  async pay(amount: number): Promise<void> {
    console.log(`Processing UPI payment of ₹${amount}`);

    // Simulate calling UPI provider
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("UPI payment successful");
  }
}
```

#### Card

```ts
import { PaymentStrategy } from "./PaymentStrategy";

export class CardPayment implements PaymentStrategy {
  async pay(amount: number): Promise<void> {
    console.log(`Processing Card payment of ₹${amount}`);

    // Simulate calling card gateway
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("Card payment successful");
  }
}
```

#### PayPal

```ts
import { PaymentStrategy } from "./PaymentStrategy";

export class PayPalPayment implements PaymentStrategy {
  async pay(amount: number): Promise<void> {
    console.log(`Processing PayPal payment of ₹${amount}`);

    // Simulate calling PayPal provider
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("PayPal payment successful");
  }
}
```

---

## 12. Create the Context

```ts
import { PaymentStrategy } from "./PaymentStrategy";

export class PaymentService {
  constructor(private readonly strategy: PaymentStrategy) {}

  async pay(amount: number): Promise<void> {
    await this.strategy.pay(amount);
  }
}
```

Notice what `PaymentService` does **not** contain:

```text
No UPI logic
No Card logic
No PayPal logic
No provider-specific conditions
```

It simply delegates:

```ts
await this.strategy.pay(amount);
```

---

## 13. Select the Strategy

A simple factory can decide which implementation to create.

```ts
import { PaymentStrategy } from "./PaymentStrategy";
import { UPIPayment } from "./UPIPayment";
import { CardPayment } from "./CardPayment";
import { PayPalPayment } from "./PayPalPayment";

export type PaymentType = "upi" | "card" | "paypal";

export class PaymentStrategyFactory {
  static create(type: PaymentType): PaymentStrategy {
    switch (type) {
      case "upi":
        return new UPIPayment();

      case "card":
        return new CardPayment();

      case "paypal":
        return new PayPalPayment();

      default:
        throw new Error(`Unsupported payment type: ${type}`);
    }
  }
}
```

The factory is responsible for **selection**.

The concrete strategy is responsible for **implementation**.

The context is responsible for **using the behavior**.

That gives us:

```text
Factory
   |
   | chooses
   v
Strategy
   |
   | implements
   v
Algorithm
   |
   | used by
   v
Context
```

---

## 14. Complete TypeScript Project Example

Recommended structure:

```text
src/
├── strategy/
│   └── PaymentStrategy.ts
├── strategies/
│   ├── UPIPayment.ts
│   ├── CardPayment.ts
│   └── PayPalPayment.ts
├── PaymentService.ts
├── PaymentStrategyFactory.ts
└── index.ts
```

### `PaymentStrategy.ts`

```ts
export interface PaymentStrategy {
  pay(amount: number): Promise<void>;
}
```

### `UPIPayment.ts`

```ts
import { PaymentStrategy } from "../strategy/PaymentStrategy";

export class UPIPayment implements PaymentStrategy {
  async pay(amount: number): Promise<void> {
    console.log(`Processing UPI payment of ₹${amount}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("UPI payment successful");
  }
}
```

### `CardPayment.ts`

```ts
import { PaymentStrategy } from "../strategy/PaymentStrategy";

export class CardPayment implements PaymentStrategy {
  async pay(amount: number): Promise<void> {
    console.log(`Processing Card payment of ₹${amount}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Card payment successful");
  }
}
```

### `PayPalPayment.ts`

```ts
import { PaymentStrategy } from "../strategy/PaymentStrategy";

export class PayPalPayment implements PaymentStrategy {
  async pay(amount: number): Promise<void> {
    console.log(`Processing PayPal payment of ₹${amount}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("PayPal payment successful");
  }
}
```

### `PaymentService.ts`

```ts
import { PaymentStrategy } from "./strategy/PaymentStrategy";

export class PaymentService {
  constructor(private readonly strategy: PaymentStrategy) {}

  async pay(amount: number): Promise<void> {
    await this.strategy.pay(amount);
  }
}
```

### `PaymentStrategyFactory.ts`

```ts
import { PaymentStrategy } from "./strategy/PaymentStrategy";
import { UPIPayment } from "./strategies/UPIPayment";
import { CardPayment } from "./strategies/CardPayment";
import { PayPalPayment } from "./strategies/PayPalPayment";

export type PaymentType = "upi" | "card" | "paypal";

export class PaymentStrategyFactory {
  static create(type: PaymentType): PaymentStrategy {
    switch (type) {
      case "upi":
        return new UPIPayment();

      case "card":
        return new CardPayment();

      case "paypal":
        return new PayPalPayment();

      default:
        throw new Error(`Unsupported payment type: ${type}`);
    }
  }
}
```

### `index.ts`

```ts
import { PaymentService } from "./PaymentService";
import { PaymentStrategyFactory } from "./PaymentStrategyFactory";

async function main() {
  const paymentType = "upi" as const;

  const strategy = PaymentStrategyFactory.create(paymentType);

  const paymentService = new PaymentService(strategy);

  await paymentService.pay(5000);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

Execution:

```text
User selects "upi"
        |
        v
PaymentStrategyFactory
        |
        v
new UPIPayment()
        |
        v
PaymentService(strategy)
        |
        v
paymentService.pay(5000)
        |
        v
strategy.pay(5000)
        |
        v
UPIPayment.pay(5000)
```

---

## 15. Functional Strategy in TypeScript

In TypeScript and JavaScript, Strategy does not have to use classes.

A function can itself be the strategy.

```ts
type PricingStrategy = (roomPrice: number) => number;

const normalPricing: PricingStrategy = (price) => price;

const premiumPricing: PricingStrategy = (price) => price * 0.9;

const weekendPricing: PricingStrategy = (price) => price * 1.2;
```

The context can accept the function:

```ts
class BookingService {
  constructor(private readonly pricingStrategy: PricingStrategy) {}

  calculatePrice(roomPrice: number): number {
    return this.pricingStrategy(roomPrice);
  }
}
```

Usage:

```ts
const service = new BookingService(premiumPricing);

const finalPrice = service.calculatePrice(5000);

console.log(finalPrice); // 4500
```

Conceptually this is still Strategy:

```text
Context
   |
   v
Function contract
   |
   +-- normalPricing
   +-- premiumPricing
   +-- weekendPricing
```

The pattern is about the **design**, not about requiring a class.

---

# Go Implementation

## 16. Strategy Pattern in Go

Go does not have classes or traditional inheritance like Java/C#.

Strategy fits very naturally with Go interfaces.

The common contract can be:

```go
type PaymentStrategy interface {
    Pay(amount float64) error
}
```

Concrete types implement this interface implicitly.

---

## 17. Complete Go Example

### `payment_strategy.go`

```go
package main

type PaymentStrategy interface {
    Pay(amount float64) error
}
```

### `upi_payment.go`

```go
package main

import "fmt"

type UPIPayment struct{}

func (u UPIPayment) Pay(amount float64) error {
    fmt.Printf("Processing UPI payment of ₹%.2f\n", amount)
    fmt.Println("UPI payment successful")

    return nil
}
```

### `card_payment.go`

```go
package main

import "fmt"

type CardPayment struct{}

func (c CardPayment) Pay(amount float64) error {
    fmt.Printf("Processing Card payment of ₹%.2f\n", amount)
    fmt.Println("Card payment successful")

    return nil
}
```

### `paypal_payment.go`

```go
package main

import "fmt"

type PayPalPayment struct{}

func (p PayPalPayment) Pay(amount float64) error {
    fmt.Printf("Processing PayPal payment of ₹%.2f\n", amount)
    fmt.Println("PayPal payment successful")

    return nil
}
```

---

## 18. Context in Go

```go
package main

type PaymentService struct {
    strategy PaymentStrategy
}

func NewPaymentService(strategy PaymentStrategy) *PaymentService {
    return &PaymentService{
        strategy: strategy,
    }
}

func (p *PaymentService) Pay(amount float64) error {
    return p.strategy.Pay(amount)
}
```

The important line is:

```go
strategy PaymentStrategy
```

The context depends on the interface instead of a specific implementation.

---

## 19. Strategy Factory in Go

```go
package main

import "fmt"

type PaymentType string

const (
    PaymentUPI    PaymentType = "upi"
    PaymentCard   PaymentType = "card"
    PaymentPayPal PaymentType = "paypal"
)

func NewPaymentStrategy(paymentType PaymentType) (PaymentStrategy, error) {
    switch paymentType {
    case PaymentUPI:
        return UPIPayment{}, nil

    case PaymentCard:
        return CardPayment{}, nil

    case PaymentPayPal:
        return PayPalPayment{}, nil

    default:
        return nil, fmt.Errorf("unsupported payment type: %s", paymentType)
    }
}
```

---

## 20. `main.go`

```go
package main

import "fmt"

func main() {
    strategy, err := NewPaymentStrategy(PaymentUPI)
    if err != nil {
        fmt.Println(err)
        return
    }

    paymentService := NewPaymentService(strategy)

    err = paymentService.Pay(5000)
    if err != nil {
        fmt.Println("payment failed:", err)
        return
    }
}
```

The runtime flow is:

```text
PaymentUPI
    |
    v
NewPaymentStrategy()
    |
    v
UPIPayment{}
    |
    v
NewPaymentService(strategy)
    |
    v
PaymentService.Pay(5000)
    |
    v
strategy.Pay(5000)
    |
    v
UPIPayment.Pay(5000)
```

---

## 21. Complete Go Project Structure

```text
strategy-pattern/
├── main.go
├── payment_strategy.go
├── payment_service.go
├── payment_factory.go
├── upi_payment.go
├── card_payment.go
└── paypal_payment.go
```

For a production project, these can be organized into packages such as:

```text
internal/
├── payment/
│   ├── strategy.go
│   ├── service.go
│   ├── factory.go
│   └── strategies/
│       ├── upi.go
│       ├── card.go
│       └── paypal.go
```

---

## 22. TypeScript vs Go

The design is the same in both languages.

| Concept | TypeScript | Go |
|---|---|---|
| Strategy contract | `interface` | `interface` |
| Concrete strategy | `class implements Interface` | `struct` + methods |
| Context | `class` | `struct` |
| Dependency | Constructor injection | Constructor function / struct field |
| Polymorphism | Interface dispatch | Interface dispatch |
| Strategy selection | Factory/function | Factory/function |

The important thing is to understand the architecture, not the language syntax.

---

# Hotel Booking Example

## 23. Strategy in a Real Hotel System

Strategy can appear naturally in a hotel booking system.

### Pricing

```text
PricingStrategy
      |
      +-- NormalPricing
      +-- WeekendPricing
      +-- FestivalPricing
      +-- PremiumMemberPricing
```

### Cancellation

```text
CancellationStrategy
      |
      +-- FlexibleCancellation
      +-- PartialRefundCancellation
      +-- NonRefundableCancellation
```

### Payment

```text
PaymentStrategy
      |
      +-- UPI
      +-- Card
      +-- PayPal
```

### Notification

```text
NotificationStrategy
      |
      +-- Email
      +-- SMS
      +-- Push
```

The pattern should only be introduced when these are actually **interchangeable implementations of the same responsibility**.

---

## 24. Example: Cancellation Strategy

A booking system might have:

```ts
interface CancellationStrategy {
  calculateRefund(
    bookingAmount: number,
    cancellationTime: Date
  ): number;
}
```

Flexible cancellation:

```ts
class FlexibleCancellation implements CancellationStrategy {
  calculateRefund(
    bookingAmount: number,
    cancellationTime: Date
  ): number {
    return bookingAmount;
  }
}
```

Non-refundable:

```ts
class NonRefundableCancellation implements CancellationStrategy {
  calculateRefund(
    bookingAmount: number,
    cancellationTime: Date
  ): number {
    return 0;
  }
}
```

Partial refund:

```ts
class PartialRefundCancellation implements CancellationStrategy {
  calculateRefund(
    bookingAmount: number,
    cancellationTime: Date
  ): number {
    return bookingAmount * 0.5;
  }
}
```

Context:

```ts
class BookingService {
  constructor(
    private readonly cancellationStrategy: CancellationStrategy
  ) {}

  cancelBooking(amount: number, time: Date): number {
    return this.cancellationStrategy.calculateRefund(amount, time);
  }
}
```

The key separation is:

```text
BookingService
      |
      v
CancellationStrategy
      |
      +-- Flexible
      +-- Partial
      +-- Non-refundable
```

---

# Strategy + Factory

## 25. Why They Are Often Used Together

Strategy answers:

> **How can I keep multiple algorithms interchangeable?**

Factory answers:

> **How should I create/select the correct algorithm?**

So the two patterns complement each other.

```text
               Request
                  |
                  v
              Factory
                  |
           chooses strategy
                  |
                  v
              Strategy
                  |
             executes in
                  |
                  v
              Context
```

Example:

```ts
const strategy = PaymentStrategyFactory.create("upi");

const service = new PaymentService(strategy);

await service.pay(5000);
```

The factory chooses.

The strategy executes.

The context coordinates.

---

# Strategy + Dependency Injection

## 26. Why Dependency Injection Fits Naturally

Strategy works very well with Dependency Injection because the Context does not create the algorithm itself.

Instead:

```ts
class PaymentService {
  constructor(private readonly strategy: PaymentStrategy) {}
}
```

The caller supplies the strategy:

```ts
const service = new PaymentService(new UPIPayment());
```

This creates loose coupling:

```text
Caller
  |
  v
chooses strategy
  |
  v
Context <---- Strategy interface
                ^
                |
           concrete object
```

This also makes testing easier.

---

# Testing Benefit

## 27. Testing the Context Independently

Suppose `PaymentService` is your Context.

You can supply a fake strategy:

```ts
class FakePaymentStrategy implements PaymentStrategy {
  public called = false;

  async pay(amount: number): Promise<void> {
    this.called = true;
  }
}
```

Test:

```ts
const fakeStrategy = new FakePaymentStrategy();

const service = new PaymentService(fakeStrategy);

await service.pay(5000);

console.log(fakeStrategy.called); // true
```

Now the test does not need a real UPI provider or payment gateway.

The context is tested against the **contract** rather than a real external implementation.

---

# Common Mistakes

## 28. Mistake: Creating Strategies Too Early

Do not create a Strategy hierarchy just because you have one algorithm today.

Bad reason:

```text
"Maybe someday we will have more pricing algorithms."
```

If there is only one implementation and no real variation, plain code may be better.

Use Strategy when the variation is meaningful.

---

## 29. Mistake: Strategy Classes That Only Wrap One Line

Avoid unnecessary abstraction such as:

```ts
class AddOneStrategy {
  execute(value: number) {
    return value + 1;
  }
}
```

if there is no real reason for interchangeability.

Patterns should solve a design problem, not increase the number of files.

---

## 30. Mistake: Putting the Selection Logic Everywhere

If different parts of the application independently contain:

```ts
if (type === "upi") ...
if (type === "card") ...
if (type === "paypal") ...
```

then the variation has not really been centralized.

A factory, resolver, dependency injection container, or application-level selection mechanism can own the strategy selection.

---

## 31. Mistake: Confusing Strategy With State

Strategy changes **how an operation is performed**.

State represents **different behavior because an object's internal state changed**.

Simple mental distinction:

```text
Strategy:
    "Which algorithm should I use?"

State:
    "What behavior should happen because my current state is X?"
```

---

## 32. Mistake: Confusing Strategy With Factory

They solve different problems.

```text
Strategy
   |
   +-- encapsulates interchangeable algorithms

Factory
   |
   +-- creates/selects an object
```

They can be used together, but they are not the same pattern.

---

# Strategy vs Other Patterns

## 33. Strategy vs State

| Strategy | State |
|---|---|
| Encapsulates interchangeable algorithms | Encapsulates behavior associated with state |
| Strategy is usually selected externally | State often changes internally as object state changes |
| Focus is algorithm replacement | Focus is state-dependent behavior |
| Example: payment method | Example: booking lifecycle state |

For a hotel booking:

```text
Strategy:
  PricingStrategy
    -> Normal
    -> Premium

State:
  BookingState
    -> Pending
    -> Confirmed
    -> Cancelled
```

---

## 34. Strategy vs Factory

| Strategy | Factory |
|---|---|
| Represents behavior | Represents object creation/selection |
| Solves algorithm variation | Solves creation logic |
| Context uses Strategy | Caller often uses Factory |
| Often used together | Often used together |

---

## 35. Strategy vs Template Method

Strategy uses **composition**:

```text
Context HAS-A Strategy
```

Template Method uses **inheritance**:

```text
BaseClass
   ^
   |
SubClass
```

Use Strategy when you want behavior to be replaceable at runtime or injected.

Use Template Method when the overall algorithm structure should remain fixed while subclasses customize particular steps.

---

# Open/Closed Principle

## 36. Why Strategy Helps With OCP

Without Strategy:

```text
Add new payment method
        |
        v
Modify PaymentService
```

With Strategy:

```text
Add new payment method
        |
        v
Create NewPaymentStrategy
```

The Context can remain unchanged.

This is one reason Strategy supports the **Open/Closed Principle**:

> **Open for extension, closed for modification.**

This does not mean there is literally never any modification anywhere. The point is that adding a new behavior can often happen by adding a new implementation rather than changing the stable core context.

---

# Interview Explanation

## 37. One-Minute Interview Answer

A strong interview answer is:

> **Strategy is a behavioral design pattern used when a system has multiple interchangeable algorithms for the same responsibility. We extract each algorithm behind a common interface and make the context depend on that interface instead of hard-coding the algorithms with conditionals. The required strategy can then be selected or injected independently, which improves extensibility, testability, and separation of concerns.**

Example:

> **In a payment system, `PaymentService` can depend on `PaymentStrategy`, while `UPIPayment`, `CardPayment`, and `PayPalPayment` implement that interface. `PaymentService` only calls `strategy.pay(amount)` and does not know how each payment method works.**

---

# Mental Model for Notes

## 38. The Diagram to Memorize

```text
                         STRATEGY PATTERN
                               |
                               v
                         ONE BUSINESS JOB
                               |
                    Multiple ways to do it
                               |
              +----------------+----------------+
              |                |                |
              v                v                v
          Algorithm A      Algorithm B      Algorithm C
              |                |                |
              +----------------+----------------+
                               |
                               v
                    Common Strategy Interface
                               ^
                               |
               +---------------+---------------+
               |               |               |
               v               v               v
           Concrete A      Concrete B      Concrete C
                               ^
                               |
                            injected
                               |
                               v
                            CONTEXT
                               |
                               v
                     calls common operation
```

Under the diagram, write:

```text
ONE JOB
  ↓
MANY WAYS
  ↓
EXTRACT THE VARYING BEHAVIOR
  ↓
COMMON INTERFACE
  ↓
CONCRETE STRATEGIES
  ↓
INJECT / SELECT ONE
  ↓
CONTEXT USES IT
```

---

# Practical Decision Checklist

## 39. Before Using Strategy

Ask:

```text
[ ] Do I have one conceptual responsibility?

[ ] Are there multiple ways to perform it?

[ ] Are those ways actual algorithms/behaviors?

[ ] Can those algorithms change independently?

[ ] Is a large switch/if-else beginning to grow?

[ ] Would I like to test each algorithm independently?

[ ] Would I like to swap the behavior without changing the Context?
```

If most of these are checked, Strategy is a good candidate.

---

# Final Summary

The Strategy Pattern is fundamentally about **separating a stable piece of code from a behavior that varies**.

Instead of this:

```text
Context
   |
   +-- if A -> algorithm A
   +-- if B -> algorithm B
   +-- if C -> algorithm C
```

you move to this:

```text
Context
   |
   v
Strategy Interface
   ^
   +-- Algorithm A
   +-- Algorithm B
   +-- Algorithm C
```

The Context becomes stable:

```text
strategy.execute()
```

while the behavior becomes interchangeable:

```text
Algorithm A
Algorithm B
Algorithm C
```

The best mental sentence to remember is:

> **Strategy Pattern = one job, multiple interchangeable ways of doing that job. Extract the varying algorithm behind a common contract and let the context use the selected strategy.**

---

# Quick Reference

```text
Strategy Pattern

Behavioral design pattern

Main problem:
    Multiple algorithms for the same responsibility

Main idea:
    Encapsulate the algorithms

Main abstraction:
    Strategy interface

Main user of Strategy:
    Context

Relationship:
    Context HAS-A Strategy

Main benefit:
    Behavior becomes interchangeable

Common signal:
    Growing conditional branches for alternative algorithms

Common companion:
    Factory + Dependency Injection

Key question:
    "What varies?"

Memory rule:
    "One job, many ways."
```
