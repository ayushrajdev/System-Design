# Factory Design Pattern in TypeScript

The **Factory Design Pattern** is a creational design pattern.

It is mainly used when our application needs to create different objects based on some condition, but we don't want the business logic to directly depend on the concrete classes.

This README explains three commonly discussed factory approaches:

1. Simple Factory
2. Factory Method
3. Abstract Factory

The examples are written in **TypeScript** and start from the basics.

---

# 1. Why Do We Need a Factory?

Before understanding Factory, let's understand the problem it solves.

Suppose we are building a payment system.

Our application supports:

```text
Stripe
Razorpay
PayPal
```

We can create classes for each payment provider.

```ts
class StripePayment {
    pay(amount: number) {
        console.log(`Paid ₹${amount} using Stripe`);
    }
}

class RazorpayPayment {
    pay(amount: number) {
        console.log(`Paid ₹${amount} using Razorpay`);
    }
}

class PayPalPayment {
    pay(amount: number) {
        console.log(`Paid ₹${amount} using PayPal`);
    }
}
```

Now suppose our controller receives:

```json
{
    "paymentType": "stripe",
    "amount": 1000
}
```

We might write:

```ts
if (paymentType === "stripe") {
    const payment = new StripePayment();
    payment.pay(1000);
}

if (paymentType === "razorpay") {
    const payment = new RazorpayPayment();
    payment.pay(1000);
}

if (paymentType === "paypal") {
    const payment = new PayPalPayment();
    payment.pay(1000);
}
```

This works.

But there is a problem.

Our business logic now knows about concrete classes:

```ts
new StripePayment();

new RazorpayPayment();

new PayPalPayment();
```

This creates **tight coupling**.

---

# 2. What Happens When We Add Another Payment Method?

Suppose tomorrow we add:

```text
PhonePe
```

Now we need to modify the existing business logic:

```ts
if (paymentType === "stripe") {
    ...
}

if (paymentType === "razorpay") {
    ...
}

if (paymentType === "paypal") {
    ...
}

if (paymentType === "phonepe") {
    ...
}
```

If this logic exists in many places, we have to modify many places.

This becomes difficult to maintain.

The main problem is not the `new` keyword itself.

The problem is:

> The business logic is responsible for deciding which concrete object should be created.

We want to separate these responsibilities.

---

# 3. The Main Idea of Factory

Instead of doing this:

```ts
const payment = new StripePayment();
```

the application can say:

```ts
const payment = PaymentFactory.create("stripe");
```

Now the business logic doesn't need to know which concrete class is being created.

The Factory handles object creation.

The basic idea is:

```text
Application
     |
     | "stripe"
     ↓
PaymentFactory
     |
     | decides
     ↓
StripePayment
```

The application only needs to know that it receives a `Payment`.

---

# 4. First Create a Common Interface

Before creating the Factory, we need a common contract.

```ts
interface Payment {
    pay(amount: number): void;
}
```

Now every payment implementation must implement `Payment`.

```ts
class StripePayment implements Payment {

    pay(amount: number): void {
        console.log(`Paid ₹${amount} using Stripe`);
    }
}
```

```ts
class RazorpayPayment implements Payment {

    pay(amount: number): void {
        console.log(`Paid ₹${amount} using Razorpay`);
    }
}
```

```ts
class PayPalPayment implements Payment {

    pay(amount: number): void {
        console.log(`Paid ₹${amount} using PayPal`);
    }
}
```

Now all three classes have the same contract:

```text
Payment
   |
   ├── StripePayment
   ├── RazorpayPayment
   └── PayPalPayment
```

The caller can therefore work with:

```ts
Payment
```

instead of depending on:

```ts
StripePayment
RazorpayPayment
PayPalPayment
```

---

# 5. Simple Factory

A **Simple Factory** centralizes object creation in one place.

It usually has a method like:

```ts
create()
```

The Factory decides which object to create.

---

## 5.1 Full Simple Factory Code

```ts
interface Payment {
    pay(amount: number): void;
}

class StripePayment implements Payment {

    pay(amount: number): void {
        console.log(`Paid ₹${amount} using Stripe`);
    }
}

class RazorpayPayment implements Payment {

    pay(amount: number): void {
        console.log(`Paid ₹${amount} using Razorpay`);
    }
}

class PayPalPayment implements Payment {

    pay(amount: number): void {
        console.log(`Paid ₹${amount} using PayPal`);
    }
}

class PaymentFactory {

    static create(type: string): Payment {

        switch (type) {

            case "stripe":
                return new StripePayment();

            case "razorpay":
                return new RazorpayPayment();

            case "paypal":
                return new PayPalPayment();

            default:
                throw new Error(
                    `Unsupported payment type: ${type}`
                );
        }
    }
}


// Application code

const payment = PaymentFactory.create("stripe");

payment.pay(1000);
```

Output:

```text
Paid ₹1000 using Stripe
```

---

# 6. How Simple Factory Works Internally

Suppose we execute:

```ts
const payment = PaymentFactory.create("razorpay");
```

First, the application calls:

```ts
PaymentFactory.create("razorpay");
```

The Factory receives:

```text
"razorpay"
```

Then it executes:

```ts
switch (type)
```

It finds:

```ts
case "razorpay":
```

Then it creates:

```ts
new RazorpayPayment();
```

The object is returned:

```ts
return new RazorpayPayment();
```

The caller receives it as:

```ts
Payment
```

Then the caller executes:

```ts
payment.pay(1000);
```

So the complete flow is:

```text
Application
    |
    | create("razorpay")
    ↓
PaymentFactory
    |
    | switch
    ↓
new RazorpayPayment()
    |
    ↓
Payment object
    |
    ↓
payment.pay()
```

The important point is:

> The application does not create the concrete payment object. The Factory creates it.

---

# 7. Why Is This Better?

Without Factory:

```ts
const payment = new RazorpayPayment();
```

The business logic knows:

```text
RazorpayPayment
```

With Factory:

```ts
const payment = PaymentFactory.create("razorpay");
```

The business logic only knows:

```text
PaymentFactory
Payment
```

The creation logic has been moved into one place.

This reduces coupling.

---

# 8. The Problem With Simple Factory

Simple Factory works well for small systems.

But imagine we have:

```text
Stripe
Razorpay
PayPal
PhonePe
GooglePay
AmazonPay
ApplePay
```

Our Factory becomes:

```ts
class PaymentFactory {

    static create(type: string): Payment {

        switch (type) {

            case "stripe":
                return new StripePayment();

            case "razorpay":
                return new RazorpayPayment();

            case "paypal":
                return new PayPalPayment();

            case "phonepe":
                return new PhonePePayment();

            case "googlepay":
                return new GooglePayPayment();

            case "amazonpay":
                return new AmazonPayPayment();

            case "applepay":
                return new ApplePayPayment();

            default:
                throw new Error("Unsupported payment");
        }
    }
}
```

The Factory now has to keep changing whenever we add a new payment implementation.

This leads us to the **Factory Method Pattern**.

---

# 9. Factory Method Pattern

Factory Method changes the approach.

Instead of having one Factory decide everything, we let **subclasses decide which object should be created**.

The parent class defines the general process.

The subclass provides the object creation logic.

The important concept is:

```ts
createPayment()
```

The parent knows that it needs a payment, but it doesn't know which concrete payment should be created.

---

# 10. Factory Method Example

First, our common interface:

```ts
interface Payment {
    pay(amount: number): void;
}
```

Concrete products:

```ts
class StripePayment implements Payment {

    pay(amount: number): void {
        console.log(`Paid ₹${amount} using Stripe`);
    }
}
```

```ts
class RazorpayPayment implements Payment {

    pay(amount: number): void {
        console.log(`Paid ₹${amount} using Razorpay`);
    }
}
```

Now create an abstract processor.

```ts
abstract class PaymentProcessor {

    process(amount: number): void {

        const payment = this.createPayment();

        payment.pay(amount);
    }

    protected abstract createPayment(): Payment;
}
```

Notice:

```ts
protected abstract createPayment(): Payment;
```

The parent is saying:

> "I need a Payment, but I don't know which concrete Payment. My subclass will decide."

Now create a Stripe processor.

```ts
class StripeProcessor extends PaymentProcessor {

    protected createPayment(): Payment {
        return new StripePayment();
    }
}
```

And Razorpay:

```ts
class RazorpayProcessor extends PaymentProcessor {

    protected createPayment(): Payment {
        return new RazorpayPayment();
    }
}
```

Now the application can do:

```ts
const processor = new StripeProcessor();

processor.process(1000);
```

Output:

```text
Paid ₹1000 using Stripe
```

---

# 11. Full Factory Method Code

```ts
interface Payment {
    pay(amount: number): void;
}


// Concrete Products

class StripePayment implements Payment {

    pay(amount: number): void {
        console.log(`Paid ₹${amount} using Stripe`);
    }
}


class RazorpayPayment implements Payment {

    pay(amount: number): void {
        console.log(`Paid ₹${amount} using Razorpay`);
    }
}


// Creator

abstract class PaymentProcessor {

    process(amount: number): void {

        const payment = this.createPayment();

        payment.pay(amount);
    }

    protected abstract createPayment(): Payment;
}


// Concrete Creators

class StripeProcessor extends PaymentProcessor {

    protected createPayment(): Payment {
        return new StripePayment();
    }
}


class RazorpayProcessor extends PaymentProcessor {

    protected createPayment(): Payment {
        return new RazorpayPayment();
    }
}


// Application

const stripeProcessor = new StripeProcessor();

stripeProcessor.process(1000);


const razorpayProcessor = new RazorpayProcessor();

razorpayProcessor.process(2000);
```

Output:

```text
Paid ₹1000 using Stripe
Paid ₹2000 using Razorpay
```

---

# 12. How Factory Method Works Internally

Suppose we execute:

```ts
const processor = new StripeProcessor();

processor.process(1000);
```

First:

```ts
new StripeProcessor()
```

creates the concrete creator.

Then:

```ts
processor.process(1000);
```

calls the `process()` method defined in:

```ts
PaymentProcessor
```

Inside `process()`:

```ts
const payment = this.createPayment();
```

But `createPayment()` is overridden by:

```ts
StripeProcessor
```

Therefore this runs:

```ts
return new StripePayment();
```

Then:

```ts
payment.pay(1000);
```

executes:

```ts
StripePayment.pay()
```

The execution flow is:

```text
StripeProcessor
       |
       ↓
process()
       |
       ↓
createPayment()
       |
       ↓
new StripePayment()
       |
       ↓
payment.pay()
```

This is **polymorphism** being used for object creation.

---

# 13. Simple Factory vs Factory Method

This is the most important difference.

## Simple Factory

The Factory itself decides:

```ts
class PaymentFactory {

    static create(type: string): Payment {

        switch (type) {

            case "stripe":
                return new StripePayment();

            case "razorpay":
                return new RazorpayPayment();

            default:
                throw new Error("Unsupported payment");
        }
    }
}
```

The decision is centralized.

```text
PaymentFactory
      |
      ├── StripePayment
      └── RazorpayPayment
```

---

## Factory Method

The parent defines the process:

```ts
abstract class PaymentProcessor {

    process(amount: number) {

        const payment = this.createPayment();

        payment.pay(amount);
    }

    abstract createPayment(): Payment;
}
```

The subclasses decide what to create:

```text
PaymentProcessor
       |
       ├── StripeProcessor
       |       |
       |       ↓
       |   StripePayment
       |
       └── RazorpayProcessor
               |
               ↓
          RazorpayPayment
```

So remember:

```text
Simple Factory
    → Factory decides

Factory Method
    → Subclass decides
```

---

# 14. Why Factory Method Is Useful

Suppose Stripe requires:

```ts
new StripePayment(stripeConfig, logger);
```

while Razorpay requires:

```ts
new RazorpayPayment(razorpayConfig, logger, redis);
```

With Factory Method, each creator can handle its own creation logic.

```ts
class StripeProcessor extends PaymentProcessor {

    protected createPayment(): Payment {

        return new StripePayment(
            stripeConfig,
            logger
        );
    }
}
```

And:

```ts
class RazorpayProcessor extends PaymentProcessor {

    protected createPayment(): Payment {

        return new RazorpayPayment(
            razorpayConfig,
            logger,
            redis
        );
    }
}
```

The parent doesn't need to know these details.

This makes the creation process easier to extend.

---

# 15. Abstract Factory Pattern

Now let's move to a different problem.

Suppose we are building a cloud application.

We need three different services:

```text
Storage
Queue
Database
```

For AWS, we have:

```text
S3
SQS
RDS
```

For Azure, we have:

```text
Blob Storage
Service Bus
Azure SQL
```

Now the application needs to create **multiple related objects**.

We don't just need:

```ts
createStorage()
```

We need:

```ts
createStorage()
createQueue()
createDatabase()
```

And these objects should belong to the same cloud provider.

This is where **Abstract Factory** is useful.

---

# 16. The Product Interfaces

First define the common interfaces.

```ts
interface Storage {

    upload(file: string): void;
}
```

```ts
interface Queue {

    send(message: string): void;
}
```

```ts
interface Database {

    query(sql: string): void;
}
```

These are our abstract products.

---

# 17. Concrete AWS Products

```ts
class S3Storage implements Storage {

    upload(file: string): void {
        console.log(`Uploading ${file} to AWS S3`);
    }
}
```

```ts
class SQSQueue implements Queue {

    send(message: string): void {
        console.log(`Sending "${message}" to AWS SQS`);
    }
}
```

```ts
class RDSDatabase implements Database {

    query(sql: string): void {
        console.log(`Executing "${sql}" on AWS RDS`);
    }
}
```

---

# 18. Concrete Azure Products

```ts
class AzureBlobStorage implements Storage {

    upload(file: string): void {
        console.log(`Uploading ${file} to Azure Blob Storage`);
    }
}
```

```ts
class AzureServiceBus implements Queue {

    send(message: string): void {
        console.log(`Sending "${message}" to Azure Service Bus`);
    }
}
```

```ts
class AzureSQLDatabase implements Database {

    query(sql: string): void {
        console.log(`Executing "${sql}" on Azure SQL`);
    }
}
```

---

# 19. Abstract Factory Interface

Now define the Factory.

```ts
interface CloudFactory {

    createStorage(): Storage;

    createQueue(): Queue;

    createDatabase(): Database;
}
```

The Factory can create a **family of related products**.

---

# 20. AWS Factory

```ts
class AWSFactory implements CloudFactory {

    createStorage(): Storage {
        return new S3Storage();
    }

    createQueue(): Queue {
        return new SQSQueue();
    }

    createDatabase(): Database {
        return new RDSDatabase();
    }
}
```

---

# 21. Azure Factory

```ts
class AzureFactory implements CloudFactory {

    createStorage(): Storage {
        return new AzureBlobStorage();
    }

    createQueue(): Queue {
        return new AzureServiceBus();
    }

    createDatabase(): Database {
        return new AzureSQLDatabase();
    }
}
```

---

# 22. Full Abstract Factory Code

```ts
// ========================================
// Product Interfaces
// ========================================

interface Storage {

    upload(file: string): void;
}


interface Queue {

    send(message: string): void;
}


interface Database {

    query(sql: string): void;
}


// ========================================
// AWS Products
// ========================================

class S3Storage implements Storage {

    upload(file: string): void {
        console.log(`Uploading ${file} to AWS S3`);
    }
}


class SQSQueue implements Queue {

    send(message: string): void {
        console.log(`Sending "${message}" to AWS SQS`);
    }
}


class RDSDatabase implements Database {

    query(sql: string): void {
        console.log(`Executing "${sql}" on AWS RDS`);
    }
}


// ========================================
// Azure Products
// ========================================

class AzureBlobStorage implements Storage {

    upload(file: string): void {
        console.log(`Uploading ${file} to Azure Blob Storage`);
    }
}


class AzureServiceBus implements Queue {

    send(message: string): void {
        console.log(`Sending "${message}" to Azure Service Bus`);
    }
}


class AzureSQLDatabase implements Database {

    query(sql: string): void {
        console.log(`Executing "${sql}" on Azure SQL`);
    }
}


// ========================================
// Abstract Factory
// ========================================

interface CloudFactory {

    createStorage(): Storage;

    createQueue(): Queue;

    createDatabase(): Database;
}


// ========================================
// AWS Factory
// ========================================

class AWSFactory implements CloudFactory {

    createStorage(): Storage {
        return new S3Storage();
    }

    createQueue(): Queue {
        return new SQSQueue();
    }

    createDatabase(): Database {
        return new RDSDatabase();
    }
}


// ========================================
// Azure Factory
// ========================================

class AzureFactory implements CloudFactory {

    createStorage(): Storage {
        return new AzureBlobStorage();
    }

    createQueue(): Queue {
        return new AzureServiceBus();
    }

    createDatabase(): Database {
        return new AzureSQLDatabase();
    }
}


// ========================================
// Application
// ========================================

function startApplication(factory: CloudFactory): void {

    const storage = factory.createStorage();

    const queue = factory.createQueue();

    const database = factory.createDatabase();


    storage.upload("profile.png");

    queue.send("Process profile");

    database.query(
        "SELECT * FROM users"
    );
}


// ========================================
// Use AWS
// ========================================

const awsFactory = new AWSFactory();

startApplication(awsFactory);


// ========================================
// Use Azure
// ========================================

const azureFactory = new AzureFactory();

startApplication(azureFactory);
```

---

# 23. How Abstract Factory Works Internally

Suppose we execute:

```ts
const factory = new AWSFactory();

startApplication(factory);
```

The application receives:

```text
AWSFactory
```

as:

```ts
CloudFactory
```

Then:

```ts
factory.createStorage();
```

calls:

```ts
AWSFactory.createStorage();
```

which returns:

```ts
new S3Storage();
```

Then:

```ts
factory.createQueue();
```

returns:

```ts
new SQSQueue();
```

Then:

```ts
factory.createDatabase();
```

returns:

```ts
new RDSDatabase();
```

So the application receives a complete AWS product family:

```text
AWSFactory
    |
    ├── S3Storage
    ├── SQSQueue
    └── RDSDatabase
```

If we instead pass:

```ts
const factory = new AzureFactory();

startApplication(factory);
```

we get:

```text
AzureFactory
    |
    ├── AzureBlobStorage
    ├── AzureServiceBus
    └── AzureSQLDatabase
```

The application code doesn't change.

---

# 24. Why Is It Called "Abstract Factory"?

Because the application works with:

```ts
CloudFactory
```

rather than:

```ts
AWSFactory
AzureFactory
```

The application says:

```ts
factory.createStorage();
factory.createQueue();
factory.createDatabase();
```

It doesn't care about the concrete factory.

This gives us abstraction over the **whole family of products**.

---

# 25. The Most Important Difference

Now we can compare all three.

## Simple Factory

The problem is:

> I need one object, and its type depends on some input.

Example:

```ts
PaymentFactory.create("stripe");
```

The Factory decides:

```text
"stripe"
    ↓
StripePayment
```

---

## Factory Method

The problem is:

> I have different types of creators, and each creator should decide which product it creates.

Example:

```ts
new StripeProcessor()
```

creates:

```text
StripeProcessor
      ↓
StripePayment
```

while:

```ts
new RazorpayProcessor()
```

creates:

```text
RazorpayProcessor
      ↓
RazorpayPayment
```

The subclass decides.

---

## Abstract Factory

The problem is:

> I need multiple related objects, and all of them should come from the same product family.

Example:

```ts
AWSFactory
```

creates:

```text
S3Storage
SQSQueue
RDSDatabase
```

while:

```ts
AzureFactory
```

creates:

```text
AzureBlobStorage
AzureServiceBus
AzureSQLDatabase
```

---

# 26. Simple Factory vs Factory Method vs Abstract Factory

| Feature | Simple Factory | Factory Method | Abstract Factory |
|---|---|---|---|
| Main purpose | Centralize object creation | Delegate creation to subclasses | Create related product families |
| Number of products | Usually one | Usually one | Multiple |
| Who decides? | Factory | Subclass | Concrete factory |
| Main technique | `switch` / conditions | Inheritance + polymorphism | Factory interface |
| Example | PaymentFactory | PaymentProcessor | CloudFactory |
| Complexity | Low | Medium | High |
| Useful when | Few implementations | Creation varies by subclass | Multiple related implementations exist |

---

# 27. Visual Comparison

## Simple Factory

```text
             PaymentFactory
                   |
          ┌────────┼────────┐
          ↓        ↓        ↓
       Stripe   Razorpay   PayPal
```

One Factory chooses one product.

---

## Factory Method

```text
             PaymentProcessor
                    |
          ┌─────────┴─────────┐
          ↓                   ↓
   StripeProcessor      RazorpayProcessor
          |                   |
          ↓                   ↓
   StripePayment        RazorpayPayment
```

The subclass decides the product.

---

## Abstract Factory

```text
                 CloudFactory
                      |
            ┌─────────┴─────────┐
            ↓                   ↓
        AWSFactory          AzureFactory
            |                   |
       ┌────┼────┐         ┌────┼────┐
       ↓    ↓    ↓         ↓    ↓    ↓
    Storage Queue DB     Storage Queue DB
```

One Factory creates a complete family.

---

# 28. Real-World Examples

Factories appear in many real applications.

## Payment

```text
PaymentFactory
    ↓
Stripe
Razorpay
PayPal
```

## Notification

```text
NotificationFactory
    ↓
Email
SMS
Push
```

## Database

```text
DatabaseFactory
    ↓
PostgreSQL
MySQL
MongoDB
```

## File Parser

```text
ParserFactory
    ↓
JSONParser
XMLParser
CSVParser
```

## Cloud Services

```text
CloudFactory
    ↓
AWS
Azure
GCP
```

---

# 29. TypeScript Example With Notification

Here is another simple example.

```ts
interface Notification {
    send(message: string): void;
}


class EmailNotification implements Notification {

    send(message: string): void {
        console.log(`Sending email: ${message}`);
    }
}


class SMSNotification implements Notification {

    send(message: string): void {
        console.log(`Sending SMS: ${message}`);
    }
}


class PushNotification implements Notification {

    send(message: string): void {
        console.log(`Sending push notification: ${message}`);
    }
}


class NotificationFactory {

    static create(type: string): Notification {

        switch (type) {

            case "email":
                return new EmailNotification();

            case "sms":
                return new SMSNotification();

            case "push":
                return new PushNotification();

            default:
                throw new Error(
                    `Unsupported notification type: ${type}`
                );
        }
    }
}
```

Usage:

```ts
const notification =
    NotificationFactory.create("email");

notification.send("Your booking is confirmed");
```

The application doesn't need:

```ts
new EmailNotification();
```

It only needs:

```ts
NotificationFactory.create("email");
```

---

# 30. Factory Does Not Mean "Never Use new"

This is an important point.

The Factory Pattern does **not** mean:

> "Never use `new`."

Instead, it means:

> "Put object creation in the appropriate place."

The Factory itself will still use:

```ts
new StripePayment();
```

The difference is **who is responsible for calling `new`**.

Without Factory:

```text
Business Logic
      ↓
new StripePayment()
```

With Factory:

```text
Business Logic
      ↓
Factory
      ↓
new StripePayment()
```

The Factory encapsulates the creation decision.

---

# 31. Factory and Dependency Inversion

Factory works nicely with the Dependency Inversion Principle.

Instead of depending directly on:

```ts
StripePayment
```

the application depends on:

```ts
Payment
```

For example:

```ts
class BookingService {

    constructor(
        private payment: Payment
    ) {}

    confirmBooking(amount: number) {

        this.payment.pay(amount);
    }
}
```

Now `BookingService` doesn't care whether it receives:

```text
StripePayment
RazorpayPayment
PayPalPayment
```

It only requires:

```text
Payment
```

This is one reason Factory is useful in larger systems.

---

# 32. Factory in a Node.js Application

A realistic Node.js structure might look like:

```text
src/
│
├── payment/
│   │
│   ├── payment.interface.ts
│   │
│   ├── stripe.payment.ts
│   ├── razorpay.payment.ts
│   ├── paypal.payment.ts
│   │
│   └── payment.factory.ts
│
├── booking/
│   └── booking.service.ts
│
└── app.ts
```

The interface:

```ts
// payment.interface.ts

export interface Payment {
    pay(amount: number): Promise<void>;
}
```

Stripe:

```ts
// stripe.payment.ts

import { Payment } from "./payment.interface";

export class StripePayment implements Payment {

    async pay(amount: number): Promise<void> {
        console.log(`Stripe payment: ₹${amount}`);
    }
}
```

Razorpay:

```ts
// razorpay.payment.ts

import { Payment } from "./payment.interface";

export class RazorpayPayment implements Payment {

    async pay(amount: number): Promise<void> {
        console.log(`Razorpay payment: ₹${amount}`);
    }
}
```

Factory:

```ts
// payment.factory.ts

import { Payment } from "./payment.interface";
import { StripePayment } from "./stripe.payment";
import { RazorpayPayment } from "./razorpay.payment";

export class PaymentFactory {

    static create(type: string): Payment {

        switch (type) {

            case "stripe":
                return new StripePayment();

            case "razorpay":
                return new RazorpayPayment();

            default:
                throw new Error(
                    `Unsupported payment type: ${type}`
                );
        }
    }
}
```

Service:

```ts
// booking.service.ts

import { PaymentFactory } from "../payment/payment.factory";

export class BookingService {

    async confirmBooking(
        paymentType: string,
        amount: number
    ) {

        const payment =
            PaymentFactory.create(paymentType);

        await payment.pay(amount);

        console.log("Booking confirmed");
    }
}
```

The important separation is:

```text
BookingService
     |
     | asks for payment
     ↓
PaymentFactory
     |
     | creates correct implementation
     ↓
Payment
     |
     ↓
Stripe / Razorpay / PayPal
```

---

# 33. When Should You Use Simple Factory?

Use Simple Factory when:

```text
You have a small number of implementations
+
The creation decision is simple
+
A centralized creation point is sufficient
```

For example:

```ts
PaymentFactory.create("stripe");
```

This is often perfectly fine in a real application.

Don't introduce Factory Method or Abstract Factory just because they are more "advanced."

---

# 34. When Should You Use Factory Method?

Factory Method is useful when:

```text
Different subclasses need different creation logic
+
There is a common workflow
+
The concrete creator should decide the product
```

For example:

```text
PaymentProcessor
       |
       ├── StripeProcessor
       └── RazorpayProcessor
```

Both processors share:

```ts
process()
```

but each one creates a different Payment.

---

# 35. When Should You Use Abstract Factory?

Use Abstract Factory when:

```text
You have multiple related products
+
Those products come in families
+
You want to switch the entire family together
```

For example:

```text
AWS
 ├── Storage
 ├── Queue
 └── Database
```

versus:

```text
Azure
 ├── Storage
 ├── Queue
 └── Database
```

The application can switch from AWS to Azure by changing the factory.

---

# 36. Common Interview Question

### Q: What is the Factory Pattern?

Answer:

> Factory is a creational design pattern that encapsulates object creation. Instead of allowing business logic to directly instantiate concrete classes, a Factory is responsible for deciding and creating the appropriate implementation. This reduces coupling between the client and concrete classes.

---

### Q: What is the difference between Simple Factory and Factory Method?

Answer:

> In a Simple Factory, a centralized Factory usually decides which concrete object to create, often using a condition such as a switch. In Factory Method, the creation method is defined by a parent class or interface and concrete subclasses decide which product to create by overriding that method.

---

### Q: What is Abstract Factory?

Answer:

> Abstract Factory provides an interface for creating a family of related objects. Instead of creating a single product, it creates multiple compatible products that belong to the same family, such as AWS storage, queue, and database services.

---

### Q: Is Simple Factory a GoF Design Pattern?

Not exactly.

The **Gang of Four (GoF)** design patterns include:

```text
Factory Method
Abstract Factory
```

but **Simple Factory is not one of the original 23 GoF patterns**.

It is commonly used and is often discussed alongside the other two, which is why people commonly refer to all of them as factory patterns.

---

# 37. Final Mental Model

The easiest way to remember everything is:

```text
                 FACTORY PATTERNS
                        |
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
       Simple        Factory       Abstract
       Factory        Method        Factory
          |             |             |
          ↓             ↓             ↓
     One place      Subclass       Product
     decides        decides        family
          |             |             |
          ↓             ↓             ↓
     "Which one?"  "Who creates?"  "Which family?"
```

Or even simpler:

```text
Simple Factory
    ↓
Factory decides

Factory Method
    ↓
Subclass decides

Abstract Factory
    ↓
Factory creates a family
```

---

# 38. Quick Revision

## Simple Factory

```ts
const payment =
    PaymentFactory.create("stripe");
```

**One Factory → one product decision**

---

## Factory Method

```ts
const processor =
    new StripeProcessor();

processor.process(1000);
```

**Subclass → decides which product to create**

---

## Abstract Factory

```ts
const factory =
    new AWSFactory();

factory.createStorage();
factory.createQueue();
factory.createDatabase();
```

**One factory → creates a family of related products**

---

# 39. One Final Example to Remember Everything

Imagine a restaurant.

### Simple Factory

You ask:

```text
"Give me a Pizza"
```

The Factory decides:

```text
pizza → MargheritaPizza
```

---

### Factory Method

Different restaurants decide how to create their pizza:

```text
ItalianRestaurant
       ↓
ItalianPizza

IndianRestaurant
       ↓
IndianPizza
```

The common restaurant process stays the same, but the subclass decides what pizza to create.

---

### Abstract Factory

Now you want an entire meal:

```text
Pizza
Drink
Dessert
```

Italian factory:

```text
ItalianFactory
 ├── ItalianPizza
 ├── ItalianDrink
 └── ItalianDessert
```

Indian factory:

```text
IndianFactory
 ├── IndianPizza
 ├── IndianDrink
 └── IndianDessert
```

That's Abstract Factory.

---

# Conclusion

The Factory Pattern is fundamentally about **separating object creation from the code that uses the object**.

Start with the simplest solution:

```text
Simple Factory
```

When creation needs to be delegated to different subclasses:

```text
Factory Method
```

When you need multiple related objects that must belong to the same family:

```text
Abstract Factory
```

The three ideas can therefore be remembered as:

```text
Simple Factory
→ Centralized creation

Factory Method
→ Polymorphic creation

Abstract Factory
→ Family-based creation
```

Once this mental model is clear, the code becomes much easier to understand because all three patterns are solving variations of the same fundamental problem:

> **"Who should be responsible for creating the correct object?"**