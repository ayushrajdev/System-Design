# Interface Segregation Principle (ISP)

The **Interface Segregation Principle (ISP)** is the **I** in the SOLID principles.

> **Clients should not be forced to depend on methods they do not use.**

In simple terms:

> **Do not create large interfaces that force implementations or clients to depend on unnecessary functionality. Split large interfaces into smaller, focused interfaces.**

---

## Table of Contents

1. [What is ISP?](#what-is-isp)
2. [Why ISP is Important](#why-isp-is-important)
3. [ISP Violation](#isp-violation)
4. [TypeScript Example](#typescript-example)
5. [TypeScript Solution](#typescript-solution)
6. [Real-World TypeScript Example](#real-world-typescript-example)
7. [Go Example](#go-example)
8. [Consumer-Side Interfaces in Go](#consumer-side-interfaces-in-go)
9. [ISP with Dependency Injection](#isp-with-dependency-injection)
10. [ISP vs SRP](#isp-vs-srp)
11. [ISP vs LSP](#isp-vs-lsp)
12. [How to Identify an ISP Violation](#how-to-identify-an-isp-violation)
13. [Mental Model](#mental-model)
14. [Key Takeaways](#key-takeaways)

---

# What is ISP?

The Interface Segregation Principle states:

> **Clients should not be forced to depend on methods they do not use.**

Consider this interface:

```ts
interface Worker {
    work(): void;
    eat(): void;
    sleep(): void;
}
```

A human can implement all three operations:

```text
Human
 ├── work()
 ├── eat()
 └── sleep()
```

But imagine a robot:

```text
Robot
 └── work()
```

The robot should not be forced to implement:

```text
eat()
sleep()
```

because those methods do not make sense for a robot.

Therefore, instead of one large interface, we should create smaller interfaces based on capabilities.

---

# Why ISP is Important

A large interface creates unnecessary coupling.

For example:

```text
                    Worker
               ┌──────┼──────┐
             work    eat    sleep
               │       │       │
               └───────┼───────┘
                       │
                     Robot
```

The `Robot` now has to implement methods it doesn't actually support.

This often leads to code such as:

```ts
eat(): void {
    throw new Error("Robot cannot eat");
}
```

or in Go:

```go
func (Robot) Eat() {
    panic("Robot cannot eat")
}
```

This is a strong indication that the interface is too large.

With ISP:

```text
Workable
   │
 work()

Eatable
   │
 eat()

Sleepable
   │
 sleep()
```

Now each class implements only the capabilities it actually supports.

---

# ISP Violation

## Bad Design

```ts
interface Worker {
    work(): void;
    eat(): void;
    sleep(): void;
}
```

### Human

```ts
class Human implements Worker {
    work(): void {
        console.log("Human is working");
    }

    eat(): void {
        console.log("Human is eating");
    }

    sleep(): void {
        console.log("Human is sleeping");
    }
}
```

### Robot

```ts
class Robot implements Worker {
    work(): void {
        console.log("Robot is working");
    }

    eat(): void {
        throw new Error("Robot cannot eat");
    }

    sleep(): void {
        throw new Error("Robot doesn't sleep");
    }
}
```

The problem is:

```text
Worker
 ├── work()
 ├── eat()
 └── sleep()

Human → needs all three
Robot → only needs work()
```

The `Robot` class is forced to depend on functionality it doesn't need.

This violates ISP.

---

# TypeScript Example

## Bad Example

```ts
interface Worker {
    work(): void;
    eat(): void;
    sleep(): void;
}

class Human implements Worker {
    work(): void {
        console.log("Human is working");
    }

    eat(): void {
        console.log("Human is eating");
    }

    sleep(): void {
        console.log("Human is sleeping");
    }
}

class Robot implements Worker {
    work(): void {
        console.log("Robot is working");
    }

    eat(): void {
        throw new Error("Robot cannot eat");
    }

    sleep(): void {
        throw new Error("Robot doesn't sleep");
    }
}
```

Usage:

```ts
const robot = new Robot();

robot.work();

// These operations do not make sense.
robot.eat();
robot.sleep();
```

The interface incorrectly claims that `Robot` supports all three operations.

---

# TypeScript Solution

Split the large interface into smaller interfaces.

```ts
interface Workable {
    work(): void;
}

interface Eatable {
    eat(): void;
}

interface Sleepable {
    sleep(): void;
}
```

Now the classes can implement only the interfaces they need.

## Human

```ts
class Human implements Workable, Eatable, Sleepable {
    work(): void {
        console.log("Human is working");
    }

    eat(): void {
        console.log("Human is eating");
    }

    sleep(): void {
        console.log("Human is sleeping");
    }
}
```

## Robot

```ts
class Robot implements Workable {
    work(): void {
        console.log("Robot is working");
    }
}
```

Now:

```ts
const human = new Human();

human.work();
human.eat();
human.sleep();

const robot = new Robot();

robot.work();
```

There is no unnecessary:

```ts
robot.eat();
robot.sleep();
```

The design now correctly represents the capabilities of each class.

---

# Complete TypeScript Example

```ts
interface Workable {
    work(): void;
}

interface Eatable {
    eat(): void;
}

interface Sleepable {
    sleep(): void;
}

class Human implements Workable, Eatable, Sleepable {
    work(): void {
        console.log("Human is working");
    }

    eat(): void {
        console.log("Human is eating");
    }

    sleep(): void {
        console.log("Human is sleeping");
    }
}

class Robot implements Workable {
    work(): void {
        console.log("Robot is working");
    }
}

class Animal implements Eatable, Sleepable {
    eat(): void {
        console.log("Animal is eating");
    }

    sleep(): void {
        console.log("Animal is sleeping");
    }
}

function main(): void {
    const human = new Human();

    human.work();
    human.eat();
    human.sleep();

    const robot = new Robot();

    robot.work();

    const animal = new Animal();

    animal.eat();
    animal.sleep();
}

main();
```

Output:

```text
Human is working
Human is eating
Human is sleeping
Robot is working
Animal is eating
Animal is sleeping
```

---

# Real-World TypeScript Example

Consider a payment system.

A bad interface might look like this:

```ts
interface PaymentService {
    pay(): void;
    refund(): void;
    generateInvoice(): void;
    sendEmail(): void;
}
```

Now imagine a cash payment implementation:

```ts
class CashPayment implements PaymentService {
    pay(): void {
        console.log("Cash payment");
    }

    refund(): void {
        console.log("Cash refund");
    }

    generateInvoice(): void {
        console.log("Generating invoice");
    }

    sendEmail(): void {
        throw new Error("CashPayment doesn't send emails");
    }
}
```

Again, the class is forced to implement functionality it doesn't need.

---

# Better Payment Design

Split the interface based on capabilities:

```ts
interface Payable {
    pay(): void;
}

interface Refundable {
    refund(): void;
}

interface Invoiceable {
    generateInvoice(): void;
}

interface Emailable {
    sendEmail(): void;
}
```

A credit card payment might support everything:

```ts
class CreditCardPayment
    implements Payable, Refundable, Invoiceable, Emailable {

    pay(): void {
        console.log("Credit card payment");
    }

    refund(): void {
        console.log("Credit card refund");
    }

    generateInvoice(): void {
        console.log("Generating invoice");
    }

    sendEmail(): void {
        console.log("Sending email");
    }
}
```

Cash payment might only support payment and refunds:

```ts
class CashPayment implements Payable, Refundable {
    pay(): void {
        console.log("Cash payment");
    }

    refund(): void {
        console.log("Cash refund");
    }
}
```

This is a much better design.

`CashPayment` does not need to implement:

```text
generateInvoice()
sendEmail()
```

because it doesn't need those operations.

---

# ISP with Dependency Injection

ISP becomes particularly useful with Dependency Injection.

Suppose we have a large interface:

```ts
interface UserService {
    createUser(): void;
    deleteUser(): void;
    sendEmail(): void;
    generateReport(): void;
}
```

Suppose a controller only needs:

```ts
createUser()
```

Instead of injecting the entire interface:

```ts
class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    create(): void {
        this.userService.createUser();
    }
}
```

Create a smaller interface:

```ts
interface UserCreator {
    createUser(): void;
}
```

Now:

```ts
class UserController {
    constructor(
        private readonly userCreator: UserCreator
    ) {}

    create(): void {
        this.userCreator.createUser();
    }
}
```

The controller now depends only on what it actually needs.

This reduces coupling and makes the system easier to test and maintain.

---

# Go Example

Go is especially well suited to ISP because Go interfaces are implemented **implicitly**.

Start with the bad design:

```go
package main

import "fmt"

type Worker interface {
	Work()
	Eat()
	Sleep()
}

type Human struct{}

func (Human) Work() {
	fmt.Println("Human is working")
}

func (Human) Eat() {
	fmt.Println("Human is eating")
}

func (Human) Sleep() {
	fmt.Println("Human is sleeping")
}

type Robot struct{}

func (Robot) Work() {
	fmt.Println("Robot is working")
}

func (Robot) Eat() {
	panic("Robot cannot eat")
}

func (Robot) Sleep() {
	panic("Robot doesn't sleep")
}
```

The problem is identical to the TypeScript example.

`Robot` implements methods that it doesn't actually support.

---

# Applying ISP in Go

Create small interfaces:

```go
type Workable interface {
	Work()
}

type Eatable interface {
	Eat()
}

type Sleepable interface {
	Sleep()
}
```

Human:

```go
type Human struct{}

func (Human) Work() {
	fmt.Println("Human is working")
}

func (Human) Eat() {
	fmt.Println("Human is eating")
}

func (Human) Sleep() {
	fmt.Println("Human is sleeping")
}
```

Robot:

```go
type Robot struct{}

func (Robot) Work() {
	fmt.Println("Robot is working")
}
```

Robot automatically satisfies `Workable` because it provides:

```go
Work()
```

No explicit declaration such as:

```go
implements Workable
```

is required.

---

# Complete Go Example

```go
package main

import "fmt"

type Workable interface {
	Work()
}

type Eatable interface {
	Eat()
}

type Sleepable interface {
	Sleep()
}

type Human struct{}

func (Human) Work() {
	fmt.Println("Human is working")
}

func (Human) Eat() {
	fmt.Println("Human is eating")
}

func (Human) Sleep() {
	fmt.Println("Human is sleeping")
}

type Robot struct{}

func (Robot) Work() {
	fmt.Println("Robot is working")
}

func main() {
	var worker Workable

	worker = Human{}
	worker.Work()

	worker = Robot{}
	worker.Work()

	human := Human{}

	var eater Eatable = human
	eater.Eat()

	var sleeper Sleepable = human
	sleeper.Sleep()
}
```

Output:

```text
Human is working
Robot is working
Human is eating
Human is sleeping
```

---

# Consumer-Side Interfaces in Go

One of the most useful Go practices is defining interfaces around the needs of the consumer.

Suppose we have:

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

A service only needs `FindUser()`.

Instead of creating a large repository interface:

```go
type UserRepositoryInterface interface {
	CreateUser()
	DeleteUser()
	FindUser()
}
```

define a small interface:

```go
type UserFinder interface {
	FindUser()
}
```

The service depends only on that capability:

```go
type UserService struct {
	repository UserFinder
}

func NewUserService(repository UserFinder) *UserService {
	return &UserService{
		repository: repository,
	}
}

func (s *UserService) GetUser() {
	s.repository.FindUser()
}
```

Complete example:

```go
package main

import "fmt"

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

type UserFinder interface {
	FindUser()
}

type UserService struct {
	repository UserFinder
}

func NewUserService(repository UserFinder) *UserService {
	return &UserService{
		repository: repository,
	}
}

func (s *UserService) GetUser() {
	s.repository.FindUser()
}

func main() {
	repository := UserRepository{}

	service := NewUserService(repository)

	service.GetUser()
}
```

The dependency relationship becomes:

```text
UserService
     │
     │ depends on
     ▼
 UserFinder
     ▲
     │ implements
     │
UserRepository
```

`UserService` doesn't care that `UserRepository` also contains:

```text
CreateUser()
DeleteUser()
```

because it only requires:

```text
FindUser()
```

---

# ISP vs SRP

ISP and SRP are related but solve different problems.

## Single Responsibility Principle

SRP asks:

> Does this class have more than one responsibility?

For example:

```ts
class UserService {
    createUser() {}
    sendEmail() {}
    generateReport() {}
}
```

This class may contain multiple responsibilities.

---

## Interface Segregation Principle

ISP asks:

> Is this interface forcing clients to depend on functionality they don't need?

For example:

```ts
interface UserService {
    createUser();
    sendEmail();
    generateReport();
}
```

A client that only needs:

```ts
createUser()
```

should not have to depend on:

```text
sendEmail()
generateReport()
```

So:

```text
SRP
 │
 └── Focuses on responsibilities of classes/modules

ISP
 │
 └── Focuses on dependencies exposed by interfaces
```

---

# ISP vs LSP

LSP and ISP can sometimes appear together.

LSP asks:

> Can a subtype safely replace its parent type?

For example:

```ts
interface Bird {
    fly(): void;
}
```

If we create:

```ts
class Penguin implements Bird {
    fly(): void {
        throw new Error("Penguins cannot fly");
    }
}
```

there is a problem.

Penguins shouldn't have been forced to depend on `fly()`.

ISP suggests splitting the interfaces:

```ts
interface Flyable {
    fly(): void;
}

interface Eatable {
    eat(): void;
}
```

Now:

```ts
class Eagle implements Flyable, Eatable {
    fly(): void {
        console.log("Eagle is flying");
    }

    eat(): void {
        console.log("Eagle is eating");
    }
}

class Penguin implements Eatable {
    eat(): void {
        console.log("Penguin is eating");
    }
}
```

The abstraction is now more accurate.

---

# How to Identify an ISP Violation

There are several strong signals.

## 1. Every implementation doesn't use every method

Example:

```text
Interface
 ├── method A
 ├── method B
 ├── method C
 └── method D

Class A → uses A, B, C, D
Class B → uses A
Class C → uses A, B
```

The interface is likely too broad.

---

## 2. Implementations throw "not supported" errors

Example:

```ts
eat() {
    throw new Error("Not supported");
}
```

or:

```go
func (Robot) Eat() {
	panic("Not supported")
}
```

This often means that the implementation should never have been required to implement that method.

---

## 3. Clients use only a small part of an interface

Suppose:

```ts
interface PaymentService {
    pay(): void;
    refund(): void;
    invoice(): void;
    sendEmail(): void;
}
```

but a controller only uses:

```ts
payment.pay();
```

Then the controller should probably depend on:

```ts
interface Payable {
    pay(): void;
}
```

rather than the complete payment interface.

---

# Mental Model

Think about interfaces as **capabilities**.

Instead of:

```text
Employee
 ├── work
 ├── eat
 ├── sleep
 ├── drive
 ├── fly
 └── swim
```

create:

```text
Workable
 └── work()

Eatable
 └── eat()

Sleepable
 └── sleep()

Drivable
 └── drive()

Flyable
 └── fly()

Swimmable
 └── swim()
```

Then compose those capabilities:

```text
Human
 ├── Workable
 ├── Eatable
 └── Sleepable

Car
 └── Drivable

Bird
 ├── Flyable
 └── Eatable

Fish
 └── Swimmable

Robot
 └── Workable
```

This is the essence of Interface Segregation.

---

# Key Takeaways

## The main rule

> **Don't force a client to depend on what it doesn't need.**

## Bad Design

```text
One large interface
        │
        ▼
Everyone depends on everything
```

## Good Design

```text
Small focused interfaces
        │
        ▼
Each client depends only on what it needs
```

### TypeScript

Use small interfaces:

```ts
interface Workable {
    work(): void;
}

interface Eatable {
    eat(): void;
}
```

Then compose them:

```ts
class Human implements Workable, Eatable {
    work(): void {}
    eat(): void {}
}
```

### Go

Prefer small interfaces:

```go
type Workable interface {
	Work()
}

type Eatable interface {
	Eat()
}
```

Go's implicit interface implementation makes this pattern especially natural.

---

# Final Definition

The **Interface Segregation Principle** means:

> **A class or client should not be forced to depend on operations that it does not need.**

The goal is not merely to create many interfaces.

The goal is to create **focused interfaces that represent meaningful capabilities and match the needs of their consumers**.

A useful rule to remember:

```text
Don't ask:
"What methods can this object have?"

Ask:
"What does this client actually need?"
```

That mindset leads to smaller interfaces, lower coupling, easier testing, and more maintainable software.