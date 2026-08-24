# Liskov Substitution Principle (LSP)

The **Liskov Substitution Principle (LSP)** is the **L** in the SOLID principles.

It was introduced by **Barbara Liskov** and can be summarized as:

> **Objects of a superclass should be replaceable with objects of its subclasses without breaking the correctness of the program.**

In simpler words:

> **If `B` is a subtype of `A`, then wherever the program expects `A`, it should be safe to provide `B`.**

LSP is fundamentally about **behavioral compatibility**, not merely inheritance.

---

# Table of Contents

1. [What is LSP?](#what-is-lsp)
2. [The Core Idea](#the-core-idea)
3. [Simple Bird Example](#simple-bird-example)
4. [Fixing the Bird Example](#fixing-the-bird-example)
5. [Rectangle and Square Problem](#rectangle-and-square-problem)
6. [LSP and Contracts](#lsp-and-contracts)
7. [LSP Rules](#lsp-rules)
8. [TypeScript Example](#typescript-example)
9. [TypeScript LSP Violation](#typescript-lsp-violation)
10. [TypeScript Correct Design](#typescript-correct-design)
11. [Go Example](#go-example)
12. [Go LSP Violation](#go-lsp-violation)
13. [Go Correct Design](#go-correct-design)
14. [Real-World Payment Gateway Example](#real-world-payment-gateway-example)
15. [How to Identify LSP Violations](#how-to-identify-lsp-violations)
16. [LSP vs Inheritance](#lsp-vs-inheritance)
17. [LSP vs Other SOLID Principles](#lsp-vs-other-solid-principles)
18. [Key Takeaway](#key-takeaway)

---

# What is LSP?

Consider this relationship:

```text
             Parent
               |
       -----------------
       |               |
   Child A           Child B
```

If the parent exposes a contract:

```text
Parent
  |
  +-- operation()
```

then every valid child should be able to participate wherever the parent is expected.

For example:

```typescript
function process(payment: Payment) {
    payment.pay();
}
```

If `CreditCardPayment` extends `Payment`, then this should be safe:

```typescript
process(new CreditCardPayment());
```

If the program breaks when `CreditCardPayment` is substituted for `Payment`, the design violates LSP.

---

# The Core Idea

LSP is not simply:

```text
Child extends Parent
```

The important question is:

```text
Can Child safely replace Parent?
```

Compare:

```text
Inheritance:

    B extends A

LSP:

    B can safely substitute A
```

Therefore:

```text
Inheritance
    ↓
Structural relationship

LSP
    ↓
Behavioral relationship
```

---

# Simple Bird Example

Suppose we create a base class:

```typescript
abstract class Bird {
    abstract fly(): void;
}
```

Now create a Sparrow:

```typescript
class Sparrow extends Bird {
    fly(): void {
        console.log("Sparrow is flying");
    }
}
```

And a Penguin:

```typescript
class Penguin extends Bird {
    fly(): void {
        throw new Error("Penguins cannot fly");
    }
}
```

Now consider:

```typescript
function makeBirdFly(bird: Bird) {
    bird.fly();
}
```

This works:

```typescript
makeBirdFly(new Sparrow());
```

But:

```typescript
makeBirdFly(new Penguin());
```

throws an error.

The problem is not the Penguin.

The problem is our abstraction.

We created:

```text
Bird
 |
 +-- fly()
```

But not every bird can fly.

Therefore the `Bird` abstraction has an incorrect contract.

---

# Fixing the Bird Example

Instead of saying:

```text
Bird
 |
 +-- fly()
```

we should separate the capabilities:

```text
Bird
 |
 +-- Sparrow
 |     |
 |     +-- Flyable
 |
 +-- Penguin
```

TypeScript:

```typescript
abstract class Bird {
    abstract eat(): void;
}

interface Flyable {
    fly(): void;
}
```

Sparrow:

```typescript
class Sparrow extends Bird implements Flyable {
    eat(): void {
        console.log("Sparrow is eating");
    }

    fly(): void {
        console.log("Sparrow is flying");
    }
}
```

Penguin:

```typescript
class Penguin extends Bird {
    eat(): void {
        console.log("Penguin is eating");
    }
}
```

Now functions can depend on the capability they actually require:

```typescript
function makeBirdEat(bird: Bird) {
    bird.eat();
}

function makeBirdFly(bird: Flyable) {
    bird.fly();
}
```

This is safe:

```typescript
makeBirdEat(new Sparrow());
makeBirdEat(new Penguin());

makeBirdFly(new Sparrow());
```

And we don't try to make:

```typescript
makeBirdFly(new Penguin());
```

because Penguin is not `Flyable`.

---

# Rectangle and Square Problem

Another famous LSP example is:

```text
Rectangle
    |
    +-- Square
```

Mathematically, a square is a rectangle.

But that does not automatically mean:

```text
Square extends Rectangle
```

is a good object-oriented design.

Consider:

```typescript
class Rectangle {
    constructor(
        public width: number,
        public height: number
    ) {}

    setWidth(width: number): void {
        this.width = width;
    }

    setHeight(height: number): void {
        this.height = height;
    }

    getArea(): number {
        return this.width * this.height;
    }
}
```

A caller might reasonably expect:

```typescript
function resizeRectangle(rectangle: Rectangle): number {
    rectangle.setWidth(10);
    rectangle.setHeight(20);

    return rectangle.getArea();
}
```

For a normal rectangle:

```typescript
const rectangle = new Rectangle(5, 5);

console.log(resizeRectangle(rectangle));
```

The result is:

```text
200
```

Now create:

```typescript
class Square extends Rectangle {
    constructor(size: number) {
        super(size, size);
    }

    setWidth(width: number): void {
        this.width = width;
        this.height = width;
    }

    setHeight(height: number): void {
        this.width = height;
        this.height = height;
    }
}
```

Now:

```typescript
const square = new Square(5);

console.log(resizeRectangle(square));
```

The result becomes:

```text
400
```

Why?

After:

```typescript
square.setWidth(10);
```

the square becomes:

```text
width = 10
height = 10
```

Then:

```typescript
square.setHeight(20);
```

makes:

```text
width = 20
height = 20
```

Therefore:

```text
area = 20 × 20
     = 400
```

The caller expected Rectangle behavior but received different behavior.

Therefore:

```text
Square
```

cannot safely substitute:

```text
Rectangle
```

in this design.

That is an LSP violation.

---

# LSP and Contracts

The easiest way to understand LSP is through the concept of a **contract**.

Suppose:

```typescript
interface PaymentProcessor {
    process(amount: number): void;
}
```

The interface establishes an expectation:

```text
PaymentProcessor
        |
        +-- process(amount)
```

An implementation should honor that contract.

If we create:

```typescript
class CreditCardProcessor implements PaymentProcessor {
    process(amount: number): void {
        console.log(`Processing ${amount}`);
    }
}
```

then:

```typescript
function checkout(processor: PaymentProcessor) {
    processor.process(1000);
}
```

works:

```typescript
checkout(new CreditCardProcessor());
```

But if we create:

```typescript
class UnsupportedProcessor implements PaymentProcessor {
    process(amount: number): void {
        throw new Error("Payment is not supported");
    }
}
```

then:

```typescript
checkout(new UnsupportedProcessor());
```

breaks the expected contract.

The abstraction is probably wrong.

---

# LSP Rules

There are three useful rules to remember.

## 1. A subtype should not demand more

Suppose the parent allows:

```text
process(Order)
```

A child should not suddenly require:

```text
process(Order with payment + shipping + coupon)
```

The subtype should not make the preconditions stricter.

---

## 2. A subtype should not promise less

If the parent guarantees:

```text
returns a valid User
```

the child shouldn't unexpectedly return:

```text
null
```

or throw an exception in situations where the parent contract says the operation succeeds.

---

## 3. A subtype should preserve expected behavior

If the parent says:

```text
calculatePrice()
```

means:

```text
calculate the price
```

the child should not suddenly:

```text
throw an exception
```

or return an incompatible result.

---

# TypeScript Example

The following project contains:

```text
typescript-lsp/
│
├── package.json
├── tsconfig.json
└── src/
    ├── bird/
    │   ├── bad-example.ts
    │   └── good-example.ts
    │
    ├── rectangle/
    │   └── example.ts
    │
    └── payment/
        └── example.ts
```

---

# TypeScript Project Setup

## package.json

```json
{
  "name": "lsp-typescript",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

---

# TypeScript — Bad Bird Example

## src/bird/bad-example.ts

```typescript
abstract class Bird {
    abstract eat(): void;

    abstract fly(): void;
}

class Sparrow extends Bird {
    eat(): void {
        console.log("Sparrow is eating");
    }

    fly(): void {
        console.log("Sparrow is flying");
    }
}

class Penguin extends Bird {
    eat(): void {
        console.log("Penguin is eating");
    }

    fly(): void {
        throw new Error("Penguins cannot fly");
    }
}

function makeBirdFly(bird: Bird): void {
    bird.fly();
}

export function runBadBirdExample(): void {
    const sparrow = new Sparrow();
    const penguin = new Penguin();

    makeBirdFly(sparrow);

    try {
        makeBirdFly(penguin);
    } catch (error) {
        console.error(
            "Error:",
            error instanceof Error ? error.message : error
        );
    }
}
```

The problem is:

```typescript
abstract class Bird {
    abstract fly(): void;
}
```

The abstraction requires every Bird to support flying.

But Penguin cannot.

---

# TypeScript — Correct Bird Example

## src/bird/good-example.ts

```typescript
abstract class Bird {
    abstract eat(): void;
}

interface Flyable {
    fly(): void;
}

class Sparrow extends Bird implements Flyable {
    eat(): void {
        console.log("Sparrow is eating");
    }

    fly(): void {
        console.log("Sparrow is flying");
    }
}

class Penguin extends Bird {
    eat(): void {
        console.log("Penguin is eating");
    }
}

function makeBirdEat(bird: Bird): void {
    bird.eat();
}

function makeBirdFly(bird: Flyable): void {
    bird.fly();
}

export function runGoodBirdExample(): void {
    const sparrow = new Sparrow();
    const penguin = new Penguin();

    makeBirdEat(sparrow);
    makeBirdEat(penguin);

    makeBirdFly(sparrow);
}
```

Now the abstraction accurately represents the capabilities.

---

# TypeScript — Rectangle Example

## src/rectangle/example.ts

```typescript
class Rectangle {
    constructor(
        public width: number,
        public height: number
    ) {}

    setWidth(width: number): void {
        this.width = width;
    }

    setHeight(height: number): void {
        this.height = height;
    }

    getArea(): number {
        return this.width * this.height;
    }
}

class Square extends Rectangle {
    constructor(size: number) {
        super(size, size);
    }

    override setWidth(width: number): void {
        this.width = width;
        this.height = width;
    }

    override setHeight(height: number): void {
        this.width = height;
        this.height = height;
    }
}

function resizeRectangle(rectangle: Rectangle): number {
    rectangle.setWidth(10);
    rectangle.setHeight(20);

    return rectangle.getArea();
}

export function runRectangleExample(): void {
    const rectangle = new Rectangle(5, 5);

    console.log(
        "Rectangle area:",
        resizeRectangle(rectangle)
    );

    const square = new Square(5);

    console.log(
        "Square area:",
        resizeRectangle(square)
    );
}
```

Output:

```text
Rectangle area: 200
Square area: 400
```

This demonstrates the LSP violation.

---

# TypeScript — Payment Gateway Example

This is a more realistic backend example.

## src/payment/example.ts

```typescript
interface PaymentGateway {
    charge(amount: number): Promise<void>;
}

class StripeGateway implements PaymentGateway {
    async charge(amount: number): Promise<void> {
        console.log(
            `Charging ${amount} using Stripe`
        );
    }
}

class RazorpayGateway implements PaymentGateway {
    async charge(amount: number): Promise<void> {
        console.log(
            `Charging ${amount} using Razorpay`
        );
    }
}

class BookingService {
    constructor(
        private readonly paymentGateway: PaymentGateway
    ) {}

    async createBooking(amount: number): Promise<void> {
        await this.paymentGateway.charge(amount);

        console.log("Booking created successfully");
    }
}

export async function runPaymentExample(): Promise<void> {
    const stripeBookingService =
        new BookingService(
            new StripeGateway()
        );

    await stripeBookingService.createBooking(5000);

    const razorpayBookingService =
        new BookingService(
            new RazorpayGateway()
        );

    await razorpayBookingService.createBooking(5000);
}
```

The important point is:

```typescript
class BookingService {
    constructor(
        private readonly paymentGateway: PaymentGateway
    ) {}
}
```

`BookingService` doesn't care whether it receives:

```text
StripeGateway
```

or:

```text
RazorpayGateway
```

Both implementations honor the `PaymentGateway` contract.

---

# TypeScript — Main File

## src/index.ts

```typescript
import { runBadBirdExample } from "./bird/bad-example.js";
import { runGoodBirdExample } from "./bird/good-example.js";
import { runRectangleExample } from "./rectangle/example.js";
import { runPaymentExample } from "./payment/example.js";

async function main(): Promise<void> {
    console.log("\n===== BAD BIRD EXAMPLE =====");

    runBadBirdExample();

    console.log("\n===== GOOD BIRD EXAMPLE =====");

    runGoodBirdExample();

    console.log("\n===== RECTANGLE EXAMPLE =====");

    runRectangleExample();

    console.log("\n===== PAYMENT EXAMPLE =====");

    await runPaymentExample();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
```

Run:

```bash
npm install
npm run dev
```

Or build:

```bash
npm run build
npm start
```

---

# Go Example

Go does not have traditional class inheritance.

Instead, Go uses **interfaces**.

This makes LSP particularly important because implementations are commonly substituted through interfaces.

---

# Go Project Structure

```text
go-lsp/
│
├── go.mod
│
├── bird/
│   ├── bad_example.go
│   └── good_example.go
│
├── payment/
│   └── example.go
│
└── main.go
```

---

# Go Setup

## go.mod

```go
module lsp-example

go 1.23
```

---

# Go — Bad Bird Example

## bird/bad_example.go

```go
package bird

import "fmt"

type BadBird interface {
	Eat()
	Fly()
}

type BadSparrow struct{}

func (BadSparrow) Eat() {
	fmt.Println("Sparrow is eating")
}

func (BadSparrow) Fly() {
	fmt.Println("Sparrow is flying")
}

type BadPenguin struct{}

func (BadPenguin) Eat() {
	fmt.Println("Penguin is eating")
}

func (BadPenguin) Fly() {
	panic("penguins cannot fly")
}

func MakeBirdFly(bird BadBird) {
	bird.Fly()
}

func RunBadExample() {
	fmt.Println("Sparrow:")

	MakeBirdFly(BadSparrow{})

	fmt.Println("Penguin:")

	func() {
		defer func() {
			if err := recover(); err != nil {
				fmt.Println("Error:", err)
			}
		}()

		MakeBirdFly(BadPenguin{})
	}()
}
```

The problem is:

```go
type BadBird interface {
	Eat()
	Fly()
}
```

This interface requires every Bird to fly.

But Penguin cannot.

---

# Go — Correct Bird Example

## bird/good_example.go

```go
package bird

import "fmt"

type Bird interface {
	Eat()
}

type Flyable interface {
	Fly()
}

type Sparrow struct{}

func (Sparrow) Eat() {
	fmt.Println("Sparrow is eating")
}

func (Sparrow) Fly() {
	fmt.Println("Sparrow is flying")
}

type Penguin struct{}

func (Penguin) Eat() {
	fmt.Println("Penguin is eating")
}

func MakeBirdEat(bird Bird) {
	bird.Eat()
}

func MakeBirdFly(bird Flyable) {
	bird.Fly()
}

func RunGoodExample() {
	sparrow := Sparrow{}
	penguin := Penguin{}

	fmt.Println("Eating:")

	MakeBirdEat(sparrow)
	MakeBirdEat(penguin)

	fmt.Println("Flying:")

	MakeBirdFly(sparrow)
}
```

Notice the important design:

```go
type Bird interface {
    Eat()
}

type Flyable interface {
    Fly()
}
```

Instead of creating one large abstraction:

```text
Bird
 ├── Eat()
 └── Fly()
```

we separate the capabilities:

```text
Bird
 └── Eat()

Flyable
 └── Fly()
```

---

# Go — Payment Gateway Example

## payment/example.go

```go
package payment

import "fmt"

type PaymentGateway interface {
	Charge(amount float64) error
}

type StripeGateway struct{}

func (StripeGateway) Charge(amount float64) error {
	fmt.Printf(
		"Charging %.2f using Stripe\n",
		amount,
	)

	return nil
}

type RazorpayGateway struct{}

func (RazorpayGateway) Charge(amount float64) error {
	fmt.Printf(
		"Charging %.2f using Razorpay\n",
		amount,
	)

	return nil
}

type BookingService struct {
	paymentGateway PaymentGateway
}

func NewBookingService(
	paymentGateway PaymentGateway,
) *BookingService {
	return &BookingService{
		paymentGateway: paymentGateway,
	}
}

func (b *BookingService) CreateBooking(
	amount float64,
) error {

	if err := b.paymentGateway.Charge(amount); err != nil {
		return err
	}

	fmt.Println("Booking created successfully")

	return nil
}

func RunPaymentExample() {
	stripeService :=
		NewBookingService(StripeGateway{})

	if err := stripeService.CreateBooking(5000); err != nil {
		fmt.Println("Error:", err)
	}

	razorpayService :=
		NewBookingService(RazorpayGateway{})

	if err := razorpayService.CreateBooking(5000); err != nil {
		fmt.Println("Error:", err)
	}
}
```

The important part is:

```go
type PaymentGateway interface {
	Charge(amount float64) error
}
```

Both:

```text
StripeGateway
RazorpayGateway
```

satisfy the same contract.

Therefore they can substitute each other.

---

# Go — Main File

## main.go

```go
package main

import (
	"fmt"

	"lsp-example/bird"
	"lsp-example/payment"
)

func main() {
	fmt.Println("\n===== BAD BIRD EXAMPLE =====")

	bird.RunBadExample()

	fmt.Println("\n===== GOOD BIRD EXAMPLE =====")

	bird.RunGoodExample()

	fmt.Println("\n===== PAYMENT EXAMPLE =====")

	payment.RunPaymentExample()
}
```

Run:

```bash
go run .
```

---

# LSP in a Real Backend

Consider a hotel booking system.

We might have:

```text
BookingService
      |
      v
PaymentGateway
      |
      +------------------+
      |                  |
      v                  v
StripeGateway      RazorpayGateway
```

The booking service should only depend on:

```typescript
interface PaymentGateway {
    charge(amount: number): Promise<void>;
}
```

or in Go:

```go
type PaymentGateway interface {
    Charge(amount float64) error
}
```

Then the booking service doesn't care about the implementation.

This gives us:

```text
BookingService
      |
      | depends on abstraction
      v
PaymentGateway
      |
      +------ Stripe
      |
      +------ Razorpay
      |
      +------ PayPal
```

Every implementation can safely substitute the abstraction as long as it respects the contract.

---

# How to Identify LSP Violations

When reviewing code, ask the following questions.

## Question 1

Can I replace the parent implementation with the child implementation without changing the calling code?

If no, investigate for an LSP violation.

---

## Question 2

Does the child throw an exception for an operation that the parent promises to support?

Example:

```text
Parent:
sendEmail()

Child:
sendEmail() -> throws "Email not supported"
```

This is a strong warning sign.

---

## Question 3

Does the child require additional conditions?

Parent:

```text
process(order)
```

Child:

```text
process(order)
only if order.payment != null
```

The child has strengthened the requirements.

This can violate LSP.

---

## Question 4

Does the child provide weaker guarantees?

Parent:

```text
getUser()
```

guarantees:

```text
User
```

Child:

```text
null
```

This changes the expected contract.

---

## Question 5

Are you forcing a subclass to implement functionality it fundamentally cannot support?

Classic example:

```text
Bird
 |
 +-- Fly()
```

with:

```text
Penguin
```

If Penguin cannot fly, the abstraction is probably wrong.

---

# Common LSP Violations

## Violation 1 — Throwing Unsupported Exceptions

```typescript
class Bird {
    fly(): void {}
}

class Penguin extends Bird {
    fly(): void {
        throw new Error("Cannot fly");
    }
}
```

Bad abstraction.

---

## Violation 2 — Changing Method Meaning

Parent:

```typescript
calculatePrice()
```

means:

```text
Calculate price.
```

Child:

```typescript
calculatePrice()
```

means:

```text
Return a discount instead.
```

The child changed the behavior.

---

## Violation 3 — Strengthening Preconditions

Parent:

```text
process(Order)
```

Child requires:

```text
Order must contain payment information.
```

The child requires more than the parent.

---

## Violation 4 — Weakening Postconditions

Parent:

```text
getUser()
```

guarantees a valid user.

Child:

```text
getUser()
```

may return `null`.

The child provides less than the parent contract.

---

## Violation 5 — Mutable Invariants

The Rectangle/Square problem is an example.

The parent allows:

```text
width != height
```

while the child requires:

```text
width == height
```

The child cannot preserve the assumptions made by code working with the parent.

---

# LSP vs Inheritance

A common misconception is:

```text
"Square is a Rectangle,
so Square should inherit Rectangle."
```

LSP tells us to ask a different question:

```text
"Can Square behave as Rectangle
in every context where Rectangle is expected?"
```

If the answer is no, inheritance is probably the wrong design.

Therefore:

```text
Inheritance:
    B extends A

LSP:
    B can safely substitute A
```

These are not the same thing.

---

# LSP vs Other SOLID Principles

LSP works closely with the other SOLID principles.

## Single Responsibility Principle

A class should have one reason to change.

Bad abstractions often happen because a class has too many responsibilities.

---

## Open/Closed Principle

Software should be:

```text
Open for extension
Closed for modification
```

LSP helps make extensions safe.

If adding a new implementation breaks existing code, the abstraction may not satisfy LSP.

---

## Liskov Substitution Principle

The focus is:

```text
Can implementations safely replace the abstraction?
```

---

## Interface Segregation Principle

The focus is:

```text
Don't force implementations to depend on
methods they don't need.
```

The Bird example demonstrates both principles:

Bad:

```text
Bird
 ├── Eat()
 └── Fly()
```

Better:

```text
Bird
 └── Eat()

Flyable
 └── Fly()
```

---

## Dependency Inversion Principle

High-level code should depend on abstractions.

For example:

```text
BookingService
       |
       v
PaymentGateway
```

rather than:

```text
BookingService
       |
       v
StripeGateway
```

LSP then ensures that different implementations of `PaymentGateway` can actually substitute one another safely.

---

# The Most Important Mental Model

Whenever you create:

```text
Interface
     |
     +---- Implementation A
     |
     +---- Implementation B
```

ask:

```text
Can I replace A with B
without breaking the caller?
```

For example:

```typescript
function checkout(
    gateway: PaymentGateway
) {
    gateway.charge(1000);
}
```

Both:

```typescript
checkout(new StripeGateway());

checkout(new RazorpayGateway());
```

should be valid.

The caller should not need:

```typescript
if (gateway instanceof StripeGateway) {
    // special behavior
}

if (gateway instanceof RazorpayGateway) {
    // another special behavior
}
```

If you need lots of special cases based on the concrete implementation, your abstraction may be wrong.

---

# LSP in One Sentence

> **A subtype or implementation should honor the behavioral contract of the abstraction it replaces.**

Or remember it as:

```text
LSP = Safe Substitution
```

The central question is:

```text
             ┌──────────────────────┐
             │ Can I safely replace │
             │      this type?      │
             └──────────┬───────────┘
                        │
                       YES
                        │
                        ▼
                 LSP is satisfied
```

If replacing the implementation causes:

```text
- unexpected exceptions
- different results
- additional requirements
- missing guarantees
- broken invariants
- special-case handling
```

then the abstraction should be reconsidered.

---

# Final Summary

The Liskov Substitution Principle is **not simply about inheritance**.

It is about **behavioral contracts**.

A good abstraction looks like:

```text
                Abstraction
                    |
          ---------------------
          |                   |
          v                   v
   Implementation A    Implementation B
          |                   |
          |                   |
          +--------+----------+
                   |
                   v
          Same expected contract
```

A bad abstraction looks like:

```text
                Abstraction
                    |
          ---------------------
          |                   |
          v                   v
   Implementation A    Implementation B
          |                   |
          |                   |
          |              "I don't support
          |               this operation"
          |                   |
          +-------------------+
                    |
                    v
               LSP violation
```

The key principle is:

```text
If code expects A,
B should be usable wherever A is expected
without breaking the program.
```

That is the **Liskov Substitution Principle**.

---

# Quick Interview Definition

If asked in an interview:

> **What is LSP?**

A strong answer is:

> Liskov Substitution Principle states that a subtype should be substitutable for its base type without changing the correctness or expected behavior of the program. In practice, implementations should honor the contracts of the abstractions they implement and should not introduce stronger preconditions, weaker guarantees, or unsupported behavior.

A simple example is the **Bird/Penguin** problem: if `Bird` requires every bird to `fly()`, `Penguin` cannot safely substitute `Bird`, because it cannot fulfill that contract. The better design is to separate `Bird` from the `Flyable` capability.

---

# Project Structure Summary

## TypeScript

```text
typescript-lsp/
│
├── package.json
├── tsconfig.json
│
└── src/
    ├── index.ts
    │
    ├── bird/
    │   ├── bad-example.ts
    │   └── good-example.ts
    │
    ├── rectangle/
    │   └── example.ts
    │
    └── payment/
        └── example.ts
```

## Go

```text
go-lsp/
│
├── go.mod
├── main.go
│
├── bird/
│   ├── bad_example.go
│   └── good_example.go
│
└── payment/
    └── example.go
```

---

# One Final Rule to Remember

```text
Don't ask:

"Is B a subtype of A?"

Ask:

"Can B safely behave as A
in every context where A is expected?"
```

If the answer is **yes**, your design is likely respecting LSP.

If the answer is **no**, reconsider the abstraction.