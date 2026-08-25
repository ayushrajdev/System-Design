# Dependency Inversion Principle (DIP)

The **Dependency Inversion Principle (DIP)** is the **D** in the SOLID principles.

> **High-level modules should not depend on low-level modules. Both should depend on abstractions.**

It also says:

> **Abstractions should not depend on details. Details should depend on abstractions.**

In simple terms:

**Your business logic should not directly depend on concrete implementations such as MySQL, Redis, Stripe, SendGrid, or a specific external API. It should depend on an abstraction.**

---

# Table of Contents

1. [What is DIP?](#what-is-dip)
2. [The Two Rules of DIP](#the-two-rules-of-dip)
3. [What is a High-Level Module?](#what-is-a-high-level-module)
4. [What is a Low-Level Module?](#what-is-a-low-level-module)
5. [The Problem Without DIP](#the-problem-without-dip)
6. [TypeScript — Bad Example](#typescript--bad-example)
7. [TypeScript — Applying DIP](#typescript--applying-dip)
8. [Complete TypeScript Example](#complete-typescript-example)
9. [Dependency Injection in TypeScript](#dependency-injection-in-typescript)
10. [Real-World TypeScript Example](#real-world-typescript-example)
11. [Go — Bad Example](#go--bad-example)
12. [Go — Applying DIP](#go--applying-dip)
13. [Complete Go Example](#complete-go-example)
14. [Dependency Injection in Go](#dependency-injection-in-go)
15. [Consumer-Side Interfaces in Go](#consumer-side-interfaces-in-go)
16. [DIP and Dependency Injection](#dip-and-dependency-injection)
17. [DIP vs Dependency Injection](#dip-vs-dependency-injection)
18. [DIP vs Dependency Inversion](#dip-vs-dependency-inversion)
19. [DIP vs ISP](#dip-vs-isp)
20. [How to Recognize a DIP Violation](#how-to-recognize-a-dip-violation)
21. [Testing Benefits](#testing-benefits)
22. [Complete Architecture](#complete-architecture)
23. [Key Takeaways](#key-takeaways)

---

# What is DIP?

Consider an order service:

```ts
class OrderService {
    private database = new MySQLDatabase();

    createOrder(): void {
        this.database.save();
    }
}
```

The high-level business logic:

```text
OrderService
```

directly depends on:

```text
MySQLDatabase
```

The dependency looks like:

```text
OrderService
      │
      │ depends directly on
      ▼
MySQLDatabase
```

This creates tight coupling.

If tomorrow we want PostgreSQL:

```text
OrderService
      │
      ▼
PostgreSQLDatabase
```

we need to modify `OrderService`.

If we want MongoDB, we modify it again.

If we want an in-memory database for testing, we modify it again.

This is exactly the kind of coupling that DIP tries to eliminate.

---

# The Two Rules of DIP

The Dependency Inversion Principle has two parts.

## Rule 1

> **High-level modules should not depend on low-level modules. Both should depend on abstractions.**

Instead of:

```text
High-Level Module
        │
        ▼
Low-Level Module
```

we want:

```text
High-Level Module
        │
        ▼
   Abstraction
        ▲
        │
Low-Level Module
```

For example:

```text
OrderService
     │
     │ depends on
     ▼
OrderRepository
     ▲
     │ implements
     │
MySQLOrderRepository
```

The important part is that `OrderService` does **not** know that MySQL exists.

---

# Rule 2

> **Abstractions should not depend on details. Details should depend on abstractions.**

Bad:

```text
Abstraction
     │
     ▼
Concrete detail
```

Good:

```text
Concrete detail
      │
      ▼
 Abstraction
```

For example:

```text
Database
   ▲
   │
   ├── MySQLDatabase
   ├── PostgreSQLDatabase
   └── MongoDatabase
```

The abstraction defines what the application needs.

The implementations provide the details.

---

# What is a High-Level Module?

A high-level module contains **business rules** or application logic.

Examples:

```text
OrderService
PaymentService
UserService
BookingService
NotificationService
```

For example:

```ts
class OrderService {
    createOrder(): void {
        // business logic
    }
}
```

`OrderService` is high-level because it represents a business operation.

---

# What is a Low-Level Module?

A low-level module contains implementation details.

Examples:

```text
MySQLRepository
RedisCache
StripePayment
SMTPEmailSender
AWSStorage
KafkaProducer
```

For example:

```ts
class MySQLRepository {
    save(): void {
        // SQL implementation
    }
}
```

This is a detail.

The business logic should not be tightly coupled to this implementation.

---

# The Problem Without DIP

Imagine an e-commerce application.

We have:

```text
OrderService
      │
      ▼
MySQLDatabase
```

The service might directly create the database:

```ts
class OrderService {
    private database: MySQLDatabase;

    constructor() {
        this.database = new MySQLDatabase();
    }

    createOrder(): void {
        this.database.save();
    }
}
```

This creates multiple problems.

### 1. Tight coupling

`OrderService` knows about `MySQLDatabase`.

### 2. Difficult to change

Changing MySQL to PostgreSQL requires changing `OrderService`.

### 3. Difficult to test

Testing `OrderService` requires dealing with the real database implementation.

### 4. Business logic knows infrastructure details

The business layer now knows about the database technology.

---

# TypeScript — Bad Example

Consider a notification system.

```ts
class EmailService {
    sendEmail(message: string): void {
        console.log(`Sending email: ${message}`);
    }
}
```

Now:

```ts
class NotificationService {
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    notify(message: string): void {
        this.emailService.sendEmail(message);
    }
}
```

The architecture is:

```text
NotificationService
        │
        ▼
   EmailService
```

`NotificationService` is tightly coupled to `EmailService`.

Suppose we want SMS:

```ts
class SMSService {
    sendSMS(message: string): void {
        console.log(`Sending SMS: ${message}`);
    }
}
```

Now `NotificationService` must be rewritten.

What if we want:

```text
Email
SMS
WhatsApp
Push Notification
```

The business logic shouldn't need to know all of these implementation details.

---

# TypeScript — Applying DIP

First define an abstraction:

```ts
interface NotificationSender {
    send(message: string): void;
}
```

Now the high-level service depends on the abstraction:

```ts
class NotificationService {
    constructor(
        private readonly sender: NotificationSender
    ) {}

    notify(message: string): void {
        this.sender.send(message);
    }
}
```

Now concrete implementations implement the abstraction.

### Email

```ts
class EmailService implements NotificationSender {
    send(message: string): void {
        console.log(`Sending email: ${message}`);
    }
}
```

### SMS

```ts
class SMSService implements NotificationSender {
    send(message: string): void {
        console.log(`Sending SMS: ${message}`);
    }
}
```

The architecture has changed to:

```text
             NotificationSender
                 ▲       ▲
                 │       │
                 │       │
          EmailService  SMSService
                 ▲       ▲
                  \     /
                   \   /
              NotificationService
```

`NotificationService` depends on the abstraction.

It does not depend directly on Email or SMS.

---

# Complete TypeScript Example

```ts
interface NotificationSender {
    send(message: string): void;
}

class EmailService implements NotificationSender {
    send(message: string): void {
        console.log(`Sending email: ${message}`);
    }
}

class SMSService implements NotificationSender {
    send(message: string): void {
        console.log(`Sending SMS: ${message}`);
    }
}

class NotificationService {
    constructor(
        private readonly sender: NotificationSender
    ) {}

    notify(message: string): void {
        console.log("NotificationService started");

        this.sender.send(message);
    }
}

function main(): void {
    const emailService = new EmailService();

    const emailNotification = new NotificationService(emailService);

    emailNotification.notify("Your order has been created");

    const smsService = new SMSService();

    const smsNotification = new NotificationService(smsService);

    smsNotification.notify("Your OTP is 123456");
}

main();
```

Output:

```text
NotificationService started
Sending email: Your order has been created

NotificationService started
Sending SMS: Your OTP is 123456
```

The important point is:

```ts
NotificationService
```

does not know whether the message is being sent through:

```text
Email
SMS
WhatsApp
Push Notification
```

It only knows:

```ts
NotificationSender
```

---

# Dependency Injection in TypeScript

This example also demonstrates **Dependency Injection**.

Instead of doing:

```ts
class NotificationService {
    private sender = new EmailService();
}
```

we pass the dependency from outside:

```ts
class NotificationService {
    constructor(
        private readonly sender: NotificationSender
    ) {}
}
```

Then:

```ts
const service = new NotificationService(
    new EmailService()
);
```

The dependency is injected into the class.

This separates object creation from business logic.

---

# Real-World TypeScript Example

Consider an order system.

A bad design:

```ts
class MySQLOrderRepository {
    save(order: string): void {
        console.log(`Saving ${order} to MySQL`);
    }
}

class OrderService {
    private repository: MySQLOrderRepository;

    constructor() {
        this.repository = new MySQLOrderRepository();
    }

    createOrder(order: string): void {
        console.log("Creating order");

        this.repository.save(order);
    }
}
```

The architecture is:

```text
OrderService
      │
      ▼
MySQLOrderRepository
```

The business logic is coupled to MySQL.

---

# Better TypeScript Design

Create an abstraction:

```ts
interface OrderRepository {
    save(order: string): void;
}
```

Create the concrete implementation:

```ts
class MySQLOrderRepository implements OrderRepository {
    save(order: string): void {
        console.log(`Saving ${order} to MySQL`);
    }
}
```

Then the high-level service:

```ts
class OrderService {
    constructor(
        private readonly repository: OrderRepository
    ) {}

    createOrder(order: string): void {
        console.log("Creating order");

        this.repository.save(order);
    }
}
```

Now we can create:

```ts
const repository = new MySQLOrderRepository();

const orderService = new OrderService(repository);

orderService.createOrder("Order #1001");
```

---

# Switching to PostgreSQL

Create another implementation:

```ts
class PostgreSQLOrderRepository implements OrderRepository {
    save(order: string): void {
        console.log(`Saving ${order} to PostgreSQL`);
    }
}
```

We can now do:

```ts
const repository = new PostgreSQLOrderRepository();

const orderService = new OrderService(repository);

orderService.createOrder("Order #1001");
```

`OrderService` does not change.

That is the power of DIP.

---

# Testing with DIP

Suppose we don't want to use a real database during testing.

We can create:

```ts
class InMemoryOrderRepository implements OrderRepository {
    private orders: string[] = [];

    save(order: string): void {
        this.orders.push(order);
    }

    getOrders(): string[] {
        return this.orders;
    }
}
```

Test:

```ts
const repository = new InMemoryOrderRepository();

const service = new OrderService(repository);

service.createOrder("Order #1");

console.log(repository.getOrders());
```

No MySQL.

No PostgreSQL.

No network.

No external infrastructure.

The business logic can be tested independently.

---

# Go — Bad Example

Now let's look at the same problem in Go.

Suppose we have:

```go
package main

import "fmt"

type EmailService struct{}

func (EmailService) Send(message string) {
	fmt.Println("Sending email:", message)
}

type NotificationService struct {
	emailService EmailService
}

func NewNotificationService() *NotificationService {
	return &NotificationService{
		emailService: EmailService{},
	}
}

func (n *NotificationService) Notify(message string) {
	n.emailService.Send(message)
}

func main() {
	service := NewNotificationService()

	service.Notify("Your order has been created")
}
```

The dependency is:

```text
NotificationService
        │
        ▼
   EmailService
```

The problem is the same.

`NotificationService` is tightly coupled to Email.

---

# Go — Applying DIP

First create an abstraction:

```go
type NotificationSender interface {
	Send(message string)
}
```

Then create implementations.

## Email

```go
type EmailService struct{}

func (EmailService) Send(message string) {
	fmt.Println("Sending email:", message)
}
```

## SMS

```go
type SMSService struct{}

func (SMSService) Send(message string) {
	fmt.Println("Sending SMS:", message)
}
```

Now the high-level service depends on the interface:

```go
type NotificationService struct {
	sender NotificationSender
}
```

Constructor:

```go
func NewNotificationService(sender NotificationSender) *NotificationService {
	return &NotificationService{
		sender: sender,
	}
}
```

Business logic:

```go
func (n *NotificationService) Notify(message string) {
	n.sender.Send(message)
}
```

---

# Complete Go Example

```go
package main

import "fmt"

type NotificationSender interface {
	Send(message string)
}

type EmailService struct{}

func (EmailService) Send(message string) {
	fmt.Println("Sending email:", message)
}

type SMSService struct{}

func (SMSService) Send(message string) {
	fmt.Println("Sending SMS:", message)
}

type NotificationService struct {
	sender NotificationSender
}

func NewNotificationService(sender NotificationSender) *NotificationService {
	return &NotificationService{
		sender: sender,
	}
}

func (n *NotificationService) Notify(message string) {
	fmt.Println("NotificationService started")

	n.sender.Send(message)
}

func main() {
	emailService := EmailService{}

	emailNotification := NewNotificationService(emailService)

	emailNotification.Notify("Your order has been created")

	smsService := SMSService{}

	smsNotification := NewNotificationService(smsService)

	smsNotification.Notify("Your OTP is 123456")
}
```

Output:

```text
NotificationService started
Sending email: Your order has been created

NotificationService started
Sending SMS: Your OTP is 123456
```

---

# Dependency Injection in Go

Go commonly uses constructor injection:

```go
func NewNotificationService(
	sender NotificationSender,
) *NotificationService {
	return &NotificationService{
		sender: sender,
	}
}
```

Then:

```go
emailService := EmailService{}

service := NewNotificationService(emailService)
```

Because `EmailService` has:

```go
func (EmailService) Send(message string)
```

it automatically satisfies:

```go
type NotificationSender interface {
	Send(message string)
}
```

No explicit `implements` keyword is required.

---

# Go Repository Example

Consider a service that needs a user repository.

The bad design might be:

```go
type MySQLUserRepository struct{}

func (MySQLUserRepository) FindUser(id int) {
	fmt.Println("Finding user from MySQL:", id)
}

type UserService struct {
	repository MySQLUserRepository
}

func NewUserService() *UserService {
	return &UserService{
		repository: MySQLUserRepository{},
	}
}
```

Now `UserService` is coupled to MySQL.

---

# Applying DIP in Go

Define the interface:

```go
type UserFinder interface {
	FindUser(id int)
}
```

Concrete repository:

```go
type MySQLUserRepository struct{}

func (MySQLUserRepository) FindUser(id int) {
	fmt.Println("Finding user from MySQL:", id)
}
```

High-level service:

```go
type UserService struct {
	repository UserFinder
}

func NewUserService(repository UserFinder) *UserService {
	return &UserService{
		repository: repository,
	}
}

func (u *UserService) GetUser(id int) {
	u.repository.FindUser(id)
}
```

Now MySQL is only one possible implementation.

---

# PostgreSQL Implementation

```go
type PostgreSQLUserRepository struct{}

func (PostgreSQLUserRepository) FindUser(id int) {
	fmt.Println("Finding user from PostgreSQL:", id)
}
```

We can use:

```go
mysqlRepository := MySQLUserRepository{}

mysqlService := NewUserService(mysqlRepository)

mysqlService.GetUser(10)
```

or:

```go
postgresRepository := PostgreSQLUserRepository{}

postgresService := NewUserService(postgresRepository)

postgresService.GetUser(10)
```

`UserService` remains unchanged.

---

# In-Memory Repository for Testing

We can also create:

```go
type InMemoryUserRepository struct{}

func (InMemoryUserRepository) FindUser(id int) {
	fmt.Println("Finding user from memory:", id)
}
```

Then:

```go
repository := InMemoryUserRepository{}

service := NewUserService(repository)

service.GetUser(10)
```

This is very useful for unit testing.

---

# Consumer-Side Interfaces in Go

This is one of the most important Go practices related to DIP.

Suppose you have:

```go
type UserRepository struct{}

func (UserRepository) CreateUser() {
	fmt.Println("Creating user")
}

func (UserRepository) DeleteUser() {
	fmt.Println("Deleting user")
}

func (UserRepository) FindUser() {
	fmt.Println("Finding user")
}
```

The service only needs:

```go
FindUser()
```

So the service can define:

```go
type UserFinder interface {
	FindUser()
}
```

Then:

```go
type UserService struct {
	repository UserFinder
}

func NewUserService(repository UserFinder) *UserService {
	return &UserService{
		repository: repository,
	}
}
```

This gives:

```text
UserService
     │
     ▼
UserFinder
     ▲
     │
UserRepository
```

The interface belongs to the consumer's requirements.

This keeps abstractions small and focused.

---

# DIP and Dependency Injection

These concepts are related but they are **not the same thing**.

## Dependency Inversion Principle

DIP is a **design principle**.

It says:

```text
High-level logic
       ↓
   Abstraction
       ↑
Low-level details
```

---

## Dependency Injection

Dependency Injection is a **technique for providing dependencies from outside**.

Instead of:

```ts
class OrderService {
    private repository = new MySQLRepository();
}
```

we do:

```ts
class OrderService {
    constructor(
        private readonly repository: OrderRepository
    ) {}
}
```

Then:

```ts
const repository = new MySQLRepository();

const service = new OrderService(repository);
```

So:

```text
DIP = What the architecture should look like

Dependency Injection = One way to implement that architecture
```

---

# DIP vs Dependency Inversion

There are three concepts that are often confused.

## Dependency

One module uses another module.

```text
A
│
▼
B
```

`A` depends on `B`.

---

## Dependency Injection

A dependency is provided externally.

```text
Application
    │
    │ injects
    ▼
Service
    │
    ▼
Repository
```

---

## Dependency Inversion Principle

The high-level module and low-level module depend on an abstraction.

```text
High-Level
    │
    ▼
Abstraction
    ▲
    │
Low-Level
```

---

# DIP vs ISP

ISP and DIP are related but solve different problems.

## ISP

Asks:

> **Is the interface too large for its clients?**

Example:

```ts
interface Worker {
    work(): void;
    eat(): void;
    sleep(): void;
}
```

A robot might only need:

```ts
work()
```

So split the interface.

---

## DIP

Asks:

> **Does the high-level module depend directly on a concrete implementation?**

Example:

```ts
class OrderService {
    private repository = new MySQLRepository();
}
```

The solution is:

```text
OrderService
      │
      ▼
OrderRepository
      ▲
      │
MySQLRepository
```

So:

```text
ISP → Focuses on interface size and client needs

DIP → Focuses on dependency direction
```

---

# How to Recognize a DIP Violation

Several patterns are strong indicators.

## 1. `new` inside business logic

For example:

```ts
class OrderService {
    private database = new MySQLDatabase();
}
```

or:

```go
type OrderService struct {
	repository MySQLRepository
}
```

when the service itself creates or tightly owns the concrete dependency.

This often indicates tight coupling.

---

## 2. Business logic imports infrastructure details

For example:

```text
OrderService
    ↓
MySQL
Redis
Stripe
AWS S3
Kafka
SMTP
```

A high-level business service shouldn't need to know every infrastructure implementation.

---

## 3. Changing infrastructure requires changing business logic

Suppose switching:

```text
MySQL → PostgreSQL
```

requires modifying:

```text
OrderService
```

That is a strong indication that the dependency direction is wrong.

---

## 4. Testing requires real infrastructure

If a unit test requires:

```text
MySQL server
Redis server
Stripe API
SMTP server
```

just to test business logic, the business layer is probably too tightly coupled to infrastructure.

---

# Testing Benefits

DIP makes unit testing much easier.

Suppose:

```ts
interface PaymentGateway {
    charge(amount: number): void;
}
```

Production implementation:

```ts
class StripePaymentGateway implements PaymentGateway {
    charge(amount: number): void {
        console.log(`Charging ${amount} using Stripe`);
    }
}
```

The service:

```ts
class PaymentService {
    constructor(
        private readonly gateway: PaymentGateway
    ) {}

    processPayment(amount: number): void {
        this.gateway.charge(amount);
    }
}
```

For testing, we can create:

```ts
class FakePaymentGateway implements PaymentGateway {
    public chargedAmount = 0;

    charge(amount: number): void {
        this.chargedAmount = amount;
    }
}
```

Test:

```ts
const fakeGateway = new FakePaymentGateway();

const paymentService = new PaymentService(fakeGateway);

paymentService.processPayment(500);

console.log(fakeGateway.chargedAmount);
```

No Stripe API is required.

The business logic can be tested independently.

---

# Complete Architecture

A common layered application might look like this:

```text
┌───────────────────────────────┐
│       Presentation Layer      │
│         Controllers           │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       Application Layer       │
│       OrderService            │
│       PaymentService          │
└───────────────┬───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Abstractions  │
        │               │
        │ Repository    │
        │ PaymentGateway│
        │ MailSender    │
        └───────┬───────┘
                ▲
                │
┌───────────────┴───────────────┐
│       Infrastructure Layer    │
│                               │
│ MySQLRepository               │
│ StripePaymentGateway          │
│ SMTPMailSender                │
└───────────────────────────────┘
```

The important dependency direction is:

```text
Business Logic
      │
      ▼
  Abstraction
      ▲
      │
Infrastructure
```

Not:

```text
Business Logic
      │
      ▼
Infrastructure
```

---

# Full TypeScript Architecture Example

A realistic example could look like:

```ts
interface UserRepository {
    save(user: User): Promise<void>;
}

interface EmailSender {
    send(to: string, message: string): Promise<void>;
}

class User {
    constructor(
        public readonly name: string,
        public readonly email: string
    ) {}
}

class UserService {
    constructor(
        private readonly repository: UserRepository,
        private readonly emailSender: EmailSender
    ) {}

    async createUser(name: string, email: string): Promise<void> {
        const user = new User(name, email);

        await this.repository.save(user);

        await this.emailSender.send(
            email,
            "Welcome to our platform"
        );
    }
}

class MySQLUserRepository implements UserRepository {
    async save(user: User): Promise<void> {
        console.log(
            `Saving ${user.name} to MySQL`
        );
    }
}

class SMTPEmailSender implements EmailSender {
    async send(to: string, message: string): Promise<void> {
        console.log(
            `Sending email to ${to}: ${message}`
        );
    }
}

async function main(): Promise<void> {
    const repository = new MySQLUserRepository();
    const emailSender = new SMTPEmailSender();

    const userService = new UserService(
        repository,
        emailSender
    );

    await userService.createUser(
        "Ayush",
        "ayush@example.com"
    );
}

main();
```

The dependencies are:

```text
                 UserService
                 /        \
                /          \
               ▼            ▼
      UserRepository     EmailSender
           ▲                  ▲
           │                  │
           │                  │
 MySQLUserRepository    SMTPEmailSender
```

This is a clean separation between business logic and infrastructure.

---

# Full Go Architecture Example

The same design in Go:

```go
package main

import "fmt"

type User struct {
	Name  string
	Email string
}

type UserRepository interface {
	Save(user User) error
}

type EmailSender interface {
	Send(to string, message string) error
}

type UserService struct {
	repository  UserRepository
	emailSender EmailSender
}

func NewUserService(
	repository UserRepository,
	emailSender EmailSender,
) *UserService {
	return &UserService{
		repository:  repository,
		emailSender: emailSender,
	}
}

func (s *UserService) CreateUser(
	name string,
	email string,
) error {

	user := User{
		Name:  name,
		Email: email,
	}

	if err := s.repository.Save(user); err != nil {
		return err
	}

	if err := s.emailSender.Send(
		email,
		"Welcome to our platform",
	); err != nil {
		return err
	}

	return nil
}

type MySQLUserRepository struct{}

func (MySQLUserRepository) Save(user User) error {
	fmt.Println(
		"Saving user to MySQL:",
		user.Name,
	)

	return nil
}

type SMTPEmailSender struct{}

func (SMTPEmailSender) Send(
	to string,
	message string,
) error {

	fmt.Printf(
		"Sending email to %s: %s\n",
		to,
		message,
	)

	return nil
}

func main() {
	repository := MySQLUserRepository{}
	emailSender := SMTPEmailSender{}

	userService := NewUserService(
		repository,
		emailSender,
	)

	err := userService.CreateUser(
		"Ayush",
		"ayush@example.com",
	)

	if err != nil {
		fmt.Println("Error:", err)
	}
}
```

The architecture is:

```text
              UserService
             /           \
            ▼             ▼
   UserRepository     EmailSender
        ▲                 ▲
        │                 │
        │                 │
 MySQLRepository     SMTPEmailSender
```

The concrete implementations depend on the abstractions through their method sets.

---

# The Most Important Mental Model

Think about DIP as **changing the direction of dependency**.

Without DIP:

```text
┌──────────────────┐
│   Business Logic │
└────────┬─────────┘
         │
         │ depends on
         ▼
┌──────────────────┐
│ Infrastructure   │
│                  │
│ MySQL            │
│ Stripe           │
│ SMTP             │
└──────────────────┘
```

With DIP:

```text
┌──────────────────┐
│   Business Logic │
└────────┬─────────┘
         │
         │ depends on
         ▼
┌──────────────────┐
│   Abstraction    │
│                  │
│ Repository       │
│ PaymentGateway   │
│ EmailSender      │
└────────▲─────────┘
         │
         │ implemented by
         │
┌────────┴─────────┐
│ Infrastructure   │
│                  │
│ MySQL            │
│ Stripe           │
│ SMTP             │
└──────────────────┘
```

The abstraction is now between the business logic and the implementation details.

---

# DIP in One Sentence

> **High-level business logic should depend on abstractions, not concrete implementation details.**

---

# DIP vs the Other SOLID Principles

The five SOLID principles can be remembered like this:

```text
S — Single Responsibility Principle
    One class should have one reason to change.

O — Open/Closed Principle
    Open for extension, closed for modification.

L — Liskov Substitution Principle
    Subtypes should be safely substitutable for their base types.

I — Interface Segregation Principle
    Don't force clients to depend on methods they don't need.

D — Dependency Inversion Principle
    Depend on abstractions, not concrete details.
```

---

# Key Takeaways

## 1. Don't make business logic depend directly on infrastructure

Avoid:

```ts
class OrderService {
    private repository = new MySQLRepository();
}
```

Prefer:

```ts
class OrderService {
    constructor(
        private readonly repository: OrderRepository
    ) {}
}
```

---

## 2. Put an abstraction between business logic and details

```text
Business Logic
      │
      ▼
 Abstraction
      ▲
      │
Implementation
```

---

## 3. Inject dependencies from outside

TypeScript:

```ts
const service = new OrderService(repository);
```

Go:

```go
service := NewOrderService(repository)
```

---

## 4. DIP improves testability

You can replace:

```text
MySQL
Stripe
Redis
SMTP
AWS
```

with:

```text
Fake
Mock
Stub
In-Memory implementation
```

without changing the business logic.

---

## 5. DIP makes infrastructure replaceable

For example:

```text
MySQL
   ↓
PostgreSQL
   ↓
MongoDB
```

The business layer can remain unchanged.

---

# Final Summary

The Dependency Inversion Principle is about **dependency direction**.

### Without DIP

```text
High-Level Module
       │
       ▼
Low-Level Module
```

The business logic knows about the implementation.

### With DIP

```text
High-Level Module
       │
       ▼
   Abstraction
       ▲
       │
Low-Level Module
```

The business logic knows only what it needs through an abstraction.

The implementation details are responsible for fulfilling that abstraction.

The most important question to ask when designing a system is:

```text
"Does my business logic depend on a concrete technology,
or does it depend on an abstraction representing what it needs?"
```

If your `OrderService` knows about MySQL, your `PaymentService` knows about Stripe, or your `NotificationService` knows about SMTP, there is a good chance you have tight coupling.

A better architecture is:

```text
                 Business Logic
                       │
                       ▼
                 Abstractions
                 ▲    ▲    ▲
                 │    │    │
                DB   API  Email
                 │    │    │
              MySQL Stripe SMTP
```

That is the essence of the **Dependency Inversion Principle**.