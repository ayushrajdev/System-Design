# Open/Closed Principle (OCP) — TypeScript & Go

The **Open/Closed Principle (OCP)** is the **O** in **SOLID**.

> **Software entities should be open for extension, but closed for modification.**

In simple terms:

- **Open for extension** → new behavior can be added.
- **Closed for modification** → existing, stable code should not need to be changed every time a new variation is introduced.

A common way to achieve OCP is through:

- Interfaces / abstractions
- Polymorphism
- Dependency Injection
- Composition
- Strategy Pattern

---

# Table of Contents

1. [What Problem Does OCP Solve?](#1-what-problem-does-ocp-solve)
2. [TypeScript — OCP Violation](#2-typescript--ocp-violation)
3. [TypeScript — Applying OCP](#3-typescript--applying-ocp)
4. [TypeScript — Complete Payment Example](#4-typescript--complete-payment-example)
5. [TypeScript — Pricing Strategy Example](#5-typescript--pricing-strategy-example)
6. [Go — OCP Violation](#6-go--ocp-violation)
7. [Go — Applying OCP](#7-go--applying-ocp)
8. [Go — Complete Payment Example](#8-go--complete-payment-example)
9. [Understanding Dependency Injection](#9-understanding-dependency-injection)
10. [OCP and the Strategy Pattern](#10-ocp-and-the-strategy-pattern)
11. [How to Recognize an OCP Violation](#11-how-to-recognize-an-ocp-violation)
12. [OCP Does Not Mean "Never Modify Code"](#12-ocp-does-not-mean-never-modify-code)
13. [OCP in Backend Systems](#13-ocp-in-backend-systems)
14. [Key Mental Model](#14-key-mental-model)

---

# 1. What Problem Does OCP Solve?

Imagine a payment system.

Initially, it supports:

- Credit Card
- UPI
- PayPal

A naive implementation may put all payment logic inside one service.

```text
PaymentService
    |
    +-- Credit Card
    |
    +-- UPI
    |
    +-- PayPal
```

When Razorpay is added, the existing `PaymentService` must be modified.

When Stripe is added, it must be modified again.

When another payment method is added, it must be modified again.

This creates code that becomes increasingly difficult to maintain.

---

# 2. TypeScript — OCP Violation

## Bad Example

```ts
class PaymentService {
    pay(type: string, amount: number): void {
        if (type === "credit_card") {
            console.log(`Paid ₹${amount} using Credit Card`);
        } else if (type === "upi") {
            console.log(`Paid ₹${amount} using UPI`);
        } else if (type === "paypal") {
            console.log(`Paid ₹${amount} using PayPal`);
        }
    }
}
```

Usage:

```ts
const paymentService = new PaymentService();

paymentService.pay("credit_card", 1000);
paymentService.pay("upi", 2000);
paymentService.pay("paypal", 3000);
```

Output:

```text
Paid ₹1000 using Credit Card
Paid ₹2000 using UPI
Paid ₹3000 using PayPal
```

## Adding Razorpay

The problem appears when we add Razorpay.

We must modify the existing class:

```ts
class PaymentService {
    pay(type: string, amount: number): void {
        if (type === "credit_card") {
            console.log(`Paid ₹${amount} using Credit Card`);
        } else if (type === "upi") {
            console.log(`Paid ₹${amount} using UPI`);
        } else if (type === "paypal") {
            console.log(`Paid ₹${amount} using PayPal`);
        } else if (type === "razorpay") {
            console.log(`Paid ₹${amount} using Razorpay`);
        }
    }
}
```

Now the same class has to be changed every time a new payment method is added.

That is a typical **OCP violation**.

---

# 3. TypeScript — Applying OCP

Instead of making `PaymentService` know every payment implementation, define an abstraction.

```ts
interface PaymentMethod {
    pay(amount: number): void;
}
```

Now each payment implementation follows the same contract.

## Credit Card

```ts
class CreditCardPayment implements PaymentMethod {
    pay(amount: number): void {
        console.log(`Paid ₹${amount} using Credit Card`);
    }
}
```

## UPI

```ts
class UPIPayment implements PaymentMethod {
    pay(amount: number): void {
        console.log(`Paid ₹${amount} using UPI`);
    }
}
```

## PayPal

```ts
class PayPalPayment implements PaymentMethod {
    pay(amount: number): void {
        console.log(`Paid ₹${amount} using PayPal`);
    }
}
```

Now `PaymentService` depends only on the abstraction.

```ts
class PaymentService {
    constructor(private readonly paymentMethod: PaymentMethod) {}

    processPayment(amount: number): void {
        this.paymentMethod.pay(amount);
    }
}
```

## Usage

```ts
const creditCard = new CreditCardPayment();

const creditCardService = new PaymentService(creditCard);

creditCardService.processPayment(1000);
```

Output:

```text
Paid ₹1000 using Credit Card
```

UPI:

```ts
const upi = new UPIPayment();

const upiService = new PaymentService(upi);

upiService.processPayment(2000);
```

Output:

```text
Paid ₹2000 using UPI
```

---

# 4. TypeScript — Complete Payment Example

This is a complete runnable example.

## `payment-example.ts`

```ts
interface PaymentMethod {
    pay(amount: number): void;
}

class CreditCardPayment implements PaymentMethod {
    pay(amount: number): void {
        console.log(`Paid ₹${amount} using Credit Card`);
    }
}

class UPIPayment implements PaymentMethod {
    pay(amount: number): void {
        console.log(`Paid ₹${amount} using UPI`);
    }
}

class PayPalPayment implements PaymentMethod {
    pay(amount: number): void {
        console.log(`Paid ₹${amount} using PayPal`);
    }
}

class RazorpayPayment implements PaymentMethod {
    pay(amount: number): void {
        console.log(`Paid ₹${amount} using Razorpay`);
    }
}

class StripePayment implements PaymentMethod {
    pay(amount: number): void {
        console.log(`Paid ₹${amount} using Stripe`);
    }
}

class PaymentService {
    constructor(private readonly paymentMethod: PaymentMethod) {}

    processPayment(amount: number): void {
        this.paymentMethod.pay(amount);
    }
}

function main(): void {
    const creditCardService = new PaymentService(
        new CreditCardPayment()
    );

    creditCardService.processPayment(1000);

    const upiService = new PaymentService(
        new UPIPayment()
    );

    upiService.processPayment(2000);

    const paypalService = new PaymentService(
        new PayPalPayment()
    );

    paypalService.processPayment(3000);

    const razorpayService = new PaymentService(
        new RazorpayPayment()
    );

    razorpayService.processPayment(4000);

    const stripeService = new PaymentService(
        new StripePayment()
    );

    stripeService.processPayment(5000);
}

main();
```

Output:

```text
Paid ₹1000 using Credit Card
Paid ₹2000 using UPI
Paid ₹3000 using PayPal
Paid ₹4000 using Razorpay
Paid ₹5000 using Stripe
```

## Why is this OCP?

Suppose tomorrow a new payment method is required:

```ts
class ApplePayPayment implements PaymentMethod {
    pay(amount: number): void {
        console.log(`Paid ₹${amount} using Apple Pay`);
    }
}
```

You only add the new implementation.

You do **not** need to modify:

```ts
PaymentService
```

You do **not** need to modify:

```ts
CreditCardPayment
```

You do **not** need to modify:

```ts
UPIPayment
```

This is the essence of OCP.

---

# 5. TypeScript — Pricing Strategy Example

OCP is not limited to payment systems.

Consider a hotel booking system with different pricing rules.

## OCP Violation

```ts
class RoomPriceCalculator {
    calculate(type: string, basePrice: number): number {
        if (type === "regular") {
            return basePrice;
        }

        if (type === "weekend") {
            return basePrice * 1.2;
        }

        if (type === "festival") {
            return basePrice * 1.5;
        }

        if (type === "premium") {
            return basePrice * 2;
        }

        return basePrice;
    }
}
```

Every new pricing rule requires modifying `RoomPriceCalculator`.

---

## Apply OCP

Create an abstraction:

```ts
interface PricingStrategy {
    calculate(basePrice: number): number;
}
```

### Regular Pricing

```ts
class RegularPricing implements PricingStrategy {
    calculate(basePrice: number): number {
        return basePrice;
    }
}
```

### Weekend Pricing

```ts
class WeekendPricing implements PricingStrategy {
    calculate(basePrice: number): number {
        return basePrice * 1.2;
    }
}
```

### Festival Pricing

```ts
class FestivalPricing implements PricingStrategy {
    calculate(basePrice: number): number {
        return basePrice * 1.5;
    }
}
```

### Luxury Pricing

```ts
class LuxuryPricing implements PricingStrategy {
    calculate(basePrice: number): number {
        return basePrice * 3;
    }
}
```

The calculator depends only on the abstraction.

```ts
class RoomPriceCalculator {
    constructor(private readonly strategy: PricingStrategy) {}

    calculate(basePrice: number): number {
        return this.strategy.calculate(basePrice);
    }
}
```

## Complete Example

```ts
interface PricingStrategy {
    calculate(basePrice: number): number;
}

class RegularPricing implements PricingStrategy {
    calculate(basePrice: number): number {
        return basePrice;
    }
}

class WeekendPricing implements PricingStrategy {
    calculate(basePrice: number): number {
        return basePrice * 1.2;
    }
}

class FestivalPricing implements PricingStrategy {
    calculate(basePrice: number): number {
        return basePrice * 1.5;
    }
}

class LuxuryPricing implements PricingStrategy {
    calculate(basePrice: number): number {
        return basePrice * 3;
    }
}

class RoomPriceCalculator {
    constructor(private readonly strategy: PricingStrategy) {}

    calculate(basePrice: number): number {
        return this.strategy.calculate(basePrice);
    }
}

function main(): void {
    const regularCalculator = new RoomPriceCalculator(
        new RegularPricing()
    );

    console.log("Regular:", regularCalculator.calculate(1000));

    const weekendCalculator = new RoomPriceCalculator(
        new WeekendPricing()
    );

    console.log("Weekend:", weekendCalculator.calculate(1000));

    const festivalCalculator = new RoomPriceCalculator(
        new FestivalPricing()
    );

    console.log("Festival:", festivalCalculator.calculate(1000));

    const luxuryCalculator = new RoomPriceCalculator(
        new LuxuryPricing()
    );

    console.log("Luxury:", luxuryCalculator.calculate(1000));
}

main();
```

Output:

```text
Regular: 1000
Weekend: 1200
Festival: 1500
Luxury: 3000
```

This is essentially the **Strategy Pattern**, which is a common way to implement OCP.

---

# 6. Go — OCP Violation

Go can have the same problem.

```go
package main

import "fmt"

type PaymentService struct{}

func (p PaymentService) Pay(paymentType string, amount float64) {
	switch paymentType {
	case "credit_card":
		fmt.Printf("Paid ₹%.2f using Credit Card\n", amount)

	case "upi":
		fmt.Printf("Paid ₹%.2f using UPI\n", amount)

	case "paypal":
		fmt.Printf("Paid ₹%.2f using PayPal\n", amount)
	}
}

func main() {
	service := PaymentService{}

	service.Pay("credit_card", 1000)
	service.Pay("upi", 2000)
	service.Pay("paypal", 3000)
}
```

Adding Razorpay means modifying the existing `Pay` method:

```go
case "razorpay":
    fmt.Printf("Paid ₹%.2f using Razorpay\n", amount)
```

Again, this is an OCP violation.

---

# 7. Go — Applying OCP

Go uses interfaces.

Define:

```go
type PaymentMethod interface {
    Pay(amount float64)
}
```

Credit Card:

```go
type CreditCardPayment struct{}

func (c CreditCardPayment) Pay(amount float64) {
    fmt.Printf("Paid ₹%.2f using Credit Card\n", amount)
}
```

UPI:

```go
type UPIPayment struct{}

func (u UPIPayment) Pay(amount float64) {
    fmt.Printf("Paid ₹%.2f using UPI\n", amount)
}
```

PayPal:

```go
type PayPalPayment struct{}

func (p PayPalPayment) Pay(amount float64) {
    fmt.Printf("Paid ₹%.2f using PayPal\n", amount)
}
```

Payment service:

```go
type PaymentService struct {
    paymentMethod PaymentMethod
}

func (p PaymentService) ProcessPayment(amount float64) {
    p.paymentMethod.Pay(amount)
}
```

The important relationship is:

```text
PaymentService
      |
      v
PaymentMethod
      ^
      |
  Implementations
```

`PaymentService` does not need to know the concrete payment type.

---

# 8. Go — Complete Payment Example

## `payment-example.go`

```go
package main

import "fmt"

type PaymentMethod interface {
	Pay(amount float64)
}

type CreditCardPayment struct{}

func (c CreditCardPayment) Pay(amount float64) {
	fmt.Printf("Paid ₹%.2f using Credit Card\n", amount)
}

type UPIPayment struct{}

func (u UPIPayment) Pay(amount float64) {
	fmt.Printf("Paid ₹%.2f using UPI\n", amount)
}

type PayPalPayment struct{}

func (p PayPalPayment) Pay(amount float64) {
	fmt.Printf("Paid ₹%.2f using PayPal\n", amount)
}

type RazorpayPayment struct{}

func (r RazorpayPayment) Pay(amount float64) {
	fmt.Printf("Paid ₹%.2f using Razorpay\n", amount)
}

type StripePayment struct{}

func (s StripePayment) Pay(amount float64) {
	fmt.Printf("Paid ₹%.2f using Stripe\n", amount)
}

type PaymentService struct {
	paymentMethod PaymentMethod
}

func NewPaymentService(paymentMethod PaymentMethod) *PaymentService {
	return &PaymentService{
		paymentMethod: paymentMethod,
	}
}

func (p *PaymentService) ProcessPayment(amount float64) {
	p.paymentMethod.Pay(amount)
}

func main() {
	creditCardService := NewPaymentService(
		CreditCardPayment{},
	)

	creditCardService.ProcessPayment(1000)

	upiService := NewPaymentService(
		UPIPayment{},
	)

	upiService.ProcessPayment(2000)

	paypalService := NewPaymentService(
		PayPalPayment{},
	)

	paypalService.ProcessPayment(3000)

	razorpayService := NewPaymentService(
		RazorpayPayment{},
	)

	razorpayService.ProcessPayment(4000)

	stripeService := NewPaymentService(
		StripePayment{},
	)

	stripeService.ProcessPayment(5000)
}
```

Output:

```text
Paid ₹1000.00 using Credit Card
Paid ₹2000.00 using UPI
Paid ₹3000.00 using PayPal
Paid ₹4000.00 using Razorpay
Paid ₹5000.00 using Stripe
```

---

# 9. Understanding Dependency Injection

Notice how `PaymentService` receives its payment implementation from outside.

TypeScript:

```ts
class PaymentService {
    constructor(private readonly paymentMethod: PaymentMethod) {}
}
```

Go:

```go
type PaymentService struct {
    paymentMethod PaymentMethod
}
```

The service does **not** create the dependency itself.

Bad:

```ts
class PaymentService {
    private paymentMethod = new UPIPayment();
}
```

Better:

```ts
class PaymentService {
    constructor(private readonly paymentMethod: PaymentMethod) {}
}
```

Now the caller decides what implementation should be used:

```ts
new PaymentService(new UPIPayment());
new PaymentService(new CreditCardPayment());
new PaymentService(new PayPalPayment());
```

This is **Dependency Injection**.

OCP and Dependency Injection often work very well together.

---

# 10. OCP and the Strategy Pattern

The pricing example is a Strategy Pattern.

The core idea:

```text
              PricingStrategy
                    ^
                    |
       +------------+------------+
       |            |            |
    Regular      Weekend      Festival
```

The calculator does not care which strategy it receives.

```ts
class RoomPriceCalculator {
    constructor(private readonly strategy: PricingStrategy) {}

    calculate(basePrice: number): number {
        return this.strategy.calculate(basePrice);
    }
}
```

Adding a new strategy means adding a new class:

```ts
class DynamicPricing implements PricingStrategy {
    calculate(basePrice: number): number {
        return basePrice * 1.75;
    }
}
```

The existing calculator stays unchanged.

This is a very practical application of OCP.

---

# 11. How to Recognize an OCP Violation

Look for code like:

```ts
if (type === "A") {
    ...
} else if (type === "B") {
    ...
} else if (type === "C") {
    ...
}
```

Or:

```go
switch paymentType {
case "upi":
    ...
case "card":
    ...
case "paypal":
    ...
}
```

Then ask:

> **Is this list likely to grow?**

If yes, consider using an abstraction.

Instead of:

```text
if/switch
    |
    +-- behavior A
    +-- behavior B
    +-- behavior C
```

you can often use:

```text
Interface / Abstraction
          ^
          |
   +------+------+
   |      |      |
   A      B      C
```

This is not a rule that every `if` or `switch` must be replaced. It is a design signal.

---

# 12. OCP Does Not Mean "Never Modify Code"

A common misunderstanding is:

> "OCP means I should never modify existing code."

That is not what it means.

The principle is about **protecting stable code from frequent modification when new variations of behavior are introduced**.

For example, this may still be completely reasonable:

```ts
class PaymentService {
    processAndLogPayment() {
        // changed business requirement
    }
}
```

OCP is not a prohibition against changing code.

The goal is to avoid repeatedly changing a core class just because another implementation was added.

---

# 13. OCP in Backend Systems

OCP becomes especially useful in larger backend applications.

## Payments

```text
PaymentService
      |
      v
PaymentMethod
      ^
      |
+-----+--------+---------+
|              |         |
UPI          Stripe    Razorpay
```

## Notifications

```text
NotificationService
         |
         v
NotificationSender
         ^
         |
+--------+---------+---------+
|                  |         |
Email              SMS      Push
```

## Hotel Pricing

```text
PriceCalculator
      |
      v
PricingStrategy
      ^
      |
+-----+-----------+---------+
|                 |         |
Regular        Weekend    Festival
```

## File Storage

```text
StorageService
      |
      v
StorageProvider
      ^
      |
+-----+---------+--------+
|               |        |
S3           GCS      Azure
```

## Authentication

```text
AuthService
    |
    v
AuthProvider
    ^
    |
+---+------+---------+
|          |         |
JWT      OAuth     API Key
```

The pattern is the same:

```text
Business Logic
      |
      v
  Abstraction
      ^
      |
Concrete implementations
```

---

# 14. Key Mental Model

## Without OCP

```text
                    PaymentService
                          |
             "I know every payment type"
                          |
          +---------------+---------------+
          |               |               |
         UPI             Card           PayPal
```

When a new payment method is added:

```text
Modify PaymentService
        |
        v
Change existing code
        |
        v
Retest existing behavior
```

---

## With OCP

```text
                    PaymentService
                          |
                          v
                   PaymentMethod
                          ^
                          |
          +---------------+---------------+
          |               |               |
         UPI             Card           PayPal
```

When a new payment method is added:

```text
                  PaymentMethod
                        ^
                        |
                     Stripe
```

Existing implementations remain unchanged.

---

# Final Summary

The most important idea to remember is:

> **Depend on abstractions so that new behavior can be added through new implementations instead of repeatedly changing existing business logic.**

The common structure is:

```text
        Interface / Abstraction
                  ^
                  |
        +---------+---------+
        |         |         |
   Implementation A
             B
             C

Business Service
       |
       v
Interface
```

In TypeScript:

```ts
interface PaymentMethod {
    pay(amount: number): void;
}
```

In Go:

```go
type PaymentMethod interface {
    Pay(amount float64)
}
```

Then the business service depends on the interface, not a concrete implementation.

That is the core of the **Open/Closed Principle**.
