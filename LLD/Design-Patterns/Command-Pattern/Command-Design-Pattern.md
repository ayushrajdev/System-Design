# Command Design Pattern in TypeScript

The **Command Design Pattern** is a behavioral design pattern used when
we want to **represent an operation or request as an object**.

Instead of directly calling a method on an object, we create a command
object that contains the information required to perform that operation.
This allows the operation to be passed around, stored, queued, delayed,
logged, retried, scheduled, or undone independently of the object that
actually performs the work.

------------------------------------------------------------------------

## 1. The Problem Before the Command Pattern

Suppose we are building an e-commerce application.

A customer can place an order, cancel an order, and request a refund. A
simple implementation might directly call methods on an `OrderService`.

``` ts
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
```

The controller could then directly call these methods:

``` ts
class OrderController {
  constructor(
    private orderService: OrderService
  ) {}

  place(orderId: string): void {
    this.orderService.placeOrder(orderId);
  }

  cancel(orderId: string): void {
    this.orderService.cancelOrder(orderId);
  }

  refund(orderId: string): void {
    this.orderService.refundOrder(orderId);
  }
}
```

At first, this looks perfectly reasonable.

The controller receives a request and directly tells the service what to
do.

However, as the application grows, new requirements can appear. We may
want to maintain a history of operations, retry failed operations, put
operations into a background queue, schedule an operation for later, log
every operation, or implement undo and redo.

At that point, the application doesn't just need to **execute an
operation**. It needs to **represent the operation itself**.

For example, we may want to represent:

``` text
Place Order ORD-1001
Cancel Order ORD-1001
Refund Order ORD-1001
```

as objects that can be stored and executed later.

This is the problem that the Command Pattern solves.

------------------------------------------------------------------------

## 2. What the Command Pattern Does

Instead of directly doing this:

``` ts
orderService.cancelOrder("ORD-1001");
```

we create an object representing the operation:

``` ts
const command = new CancelOrderCommand(
  orderService,
  "ORD-1001"
);
```

The command now represents:

> Cancel order `ORD-1001`.

The operation itself has not necessarily happened yet.

We can execute it later:

``` ts
command.execute();
```

Because the operation is now represented as an object, we can also store
it:

``` ts
commands.push(command);
```

pass it to another component:

``` ts
queue.add(command);
```

or use it as part of an undo/redo system:

``` ts
command.undo();
```

The central idea is:

> **Command Pattern turns a request or operation into an object.**

------------------------------------------------------------------------

## 3. Command Pattern Participants

There are usually four important components.

### Command

The `Command` defines a common interface for executable operations.

``` ts
interface Command {
  execute(): void;
}
```

The Invoker can work with this interface without knowing which concrete
operation it represents.

### Concrete Command

A Concrete Command represents a specific operation.

Examples include:

``` text
PlaceOrderCommand
CancelOrderCommand
RefundOrderCommand
```

The command stores the data required for the operation and usually
maintains a reference to the Receiver.

### Receiver

The Receiver contains the actual business logic.

In our example, `OrderService` is the Receiver.

It knows how to actually:

``` text
place an order
cancel an order
refund an order
```

The command does not need to contain that business logic. It delegates
the work to the Receiver.

### Invoker

The Invoker is responsible for triggering the command.

It doesn't need to know whether the command represents placing an order,
cancelling an order, or refunding an order.

It simply calls:

``` ts
command.execute();
```

### Client

The Client creates the appropriate command and connects it with the
Receiver.

------------------------------------------------------------------------

## 4. Creating the Command Interface

Let's start with the common Command interface.

``` ts
interface Command {
  execute(): void;
}
```

This interface says that any object representing an executable operation
must provide an `execute()` method.

Because every Concrete Command follows the same interface, the Invoker
can work with any command without knowing its concrete type.

------------------------------------------------------------------------

## 5. Creating the Receiver

Now we create the `OrderService`.

This is our Receiver because it contains the actual business operations.

``` ts
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
```

Notice that `OrderService` does not know anything about `Command`,
`PlaceOrderCommand`, or `CancelOrderCommand`.

It simply knows how to perform the business operations.

This separation is important:

> The **Command represents what operation we want to perform**, while
> the **Receiver knows how to perform it**.

------------------------------------------------------------------------

## 6. Creating PlaceOrderCommand

Now we create our first Concrete Command.

``` ts
class PlaceOrderCommand implements Command {
  constructor(
    private orderService: OrderService,
    private orderId: string
  ) {}

  execute(): void {
    this.orderService.placeOrder(this.orderId);
  }
}
```

When we create:

``` ts
const command = new PlaceOrderCommand(
  orderService,
  "ORD-1001"
);
```

the command object stores:

``` text
OrderService
ORD-1001
```

The command represents:

> Place order `ORD-1001`.

Creating the command does not automatically place the order.

The actual operation happens when:

``` ts
command.execute();
```

is called.

Inside `execute()`:

``` ts
this.orderService.placeOrder(this.orderId);
```

the command delegates the actual work to the Receiver.

------------------------------------------------------------------------

## 7. Creating CancelOrderCommand

Now we can create another Concrete Command.

``` ts
class CancelOrderCommand implements Command {
  constructor(
    private orderService: OrderService,
    private orderId: string
  ) {}

  execute(): void {
    this.orderService.cancelOrder(this.orderId);
  }
}
```

When we create:

``` ts
const command = new CancelOrderCommand(
  orderService,
  "ORD-1001"
);
```

we have an object representing:

> Cancel order `ORD-1001`.

Again, the command does not contain the cancellation business logic. It
delegates the operation to `OrderService`.

------------------------------------------------------------------------

## 8. Creating RefundOrderCommand

We can create another command in the same way.

``` ts
class RefundOrderCommand implements Command {
  constructor(
    private orderService: OrderService,
    private orderId: string
  ) {}

  execute(): void {
    this.orderService.refundOrder(this.orderId);
  }
}
```

Now we have:

``` text
PlaceOrderCommand
CancelOrderCommand
RefundOrderCommand
```

All of them implement:

``` ts
Command
```

Therefore the Invoker can work with all of them through the same
abstraction.

------------------------------------------------------------------------

## 9. Creating the Invoker

Now let's create the Invoker.

``` ts
class CommandInvoker {
  execute(command: Command): void {
    command.execute();
  }
}
```

The Invoker doesn't know what operation the command represents.

It doesn't need code such as:

``` ts
if (command instanceof PlaceOrderCommand) {
  // ...
}
```

or:

``` ts
if (command instanceof CancelOrderCommand) {
  // ...
}
```

It simply calls:

``` ts
command.execute();
```

Polymorphism ensures that the correct Concrete Command implementation is
executed.

------------------------------------------------------------------------

## 10. Basic Complete Implementation

Here is the complete basic implementation.

``` ts
// ------------------------------------
// Command
// ------------------------------------

interface Command {
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
```

### Output

``` text
Placing order ORD-1001
Cancelling order ORD-1001
Refunding order ORD-1001
```

------------------------------------------------------------------------

## 11. Complete Runtime Execution Flow

Now let's understand what actually happens when the program runs.

First, this line executes:

``` ts
const orderService = new OrderService();
```

JavaScript creates an `OrderService` object. This object contains the
business methods required to place, cancel, and refund orders.

Nothing has been executed yet.

Next, we create the Invoker:

``` ts
const invoker = new CommandInvoker();
```

The Invoker is responsible for triggering commands, but it doesn't
contain any order-specific business logic.

Next, we create:

``` ts
const placeCommand = new PlaceOrderCommand(
  orderService,
  "ORD-1001"
);
```

JavaScript creates a `PlaceOrderCommand` object. The object stores a
reference to the `OrderService` instance and the order ID `ORD-1001`.

At this point, the order has still not been placed.

The command is simply an object representing the request:

``` text
Place order ORD-1001
```

Then we execute:

``` ts
invoker.execute(placeCommand);
```

The Invoker receives the command through the `Command` interface.

Inside the Invoker:

``` ts
execute(command: Command): void {
  command.execute();
}
```

it calls:

``` ts
command.execute();
```

The actual object is a `PlaceOrderCommand`, so JavaScript invokes the
`execute()` method implemented by `PlaceOrderCommand`.

Inside that method:

``` ts
this.orderService.placeOrder(this.orderId);
```

the command delegates the actual work to the Receiver.

The Receiver is `OrderService`, so:

``` ts
orderService.placeOrder("ORD-1001");
```

is finally executed.

The important thing is that the Invoker did not need to know that this
command was a `PlaceOrderCommand`. It only knew that it was a `Command`.

The same process occurs for `CancelOrderCommand` and
`RefundOrderCommand`.

This gives us the fundamental separation:

``` text
Client
creates the command.

Command
represents the operation.

Invoker
triggers the command.

Receiver
performs the actual business logic.
```

------------------------------------------------------------------------

## 12. Why Turning an Operation into an Object Is Useful

The biggest benefit of the Command Pattern is that an operation that
previously existed only as a method call can now exist as an independent
object.

Without the pattern:

``` ts
orderService.cancelOrder("ORD-1001");
```

The operation happens immediately.

With the pattern:

``` ts
const command = new CancelOrderCommand(
  orderService,
  "ORD-1001"
);
```

we have an object representing the operation.

We can now store it:

``` ts
const commands: Command[] = [];

commands.push(command);
```

We can execute it later:

``` ts
for (const command of commands) {
  command.execute();
}
```

We can pass it to another component:

``` ts
queue.add(command);
```

We can log the operation:

``` ts
console.log(command);
```

We can retry it:

``` ts
command.execute();
```

And, if the command supports it, we can undo it:

``` ts
command.undo();
```

The important architectural change is:

> **The operation itself has become a first-class object.**

------------------------------------------------------------------------

# 13. Adding Undo Support

One of the classic uses of the Command Pattern is implementing Undo.

We can extend the Command interface:

``` ts
interface Command {
  execute(): void;
  undo(): void;
}
```

Now every command must define both the operation and how to reverse it.

A text editor is a good example.

Suppose our Receiver is:

``` ts
class TextEditor {
  private content = "";

  write(text: string): void {
    this.content += text;

    console.log(`Added: "${text}"`);
  }

  delete(count: number): string {
    const deletedText = this.content.slice(-count);

    this.content = this.content.slice(
      0,
      this.content.length - count
    );

    console.log(`Deleted: "${deletedText}"`);

    return deletedText;
  }

  getContent(): string {
    return this.content;
  }
}
```

The `TextEditor` is responsible for modifying the text.

It doesn't know anything about undo history.

The command handles the relationship between the operation and its
reversal.

------------------------------------------------------------------------

## 14. WriteCommand with Undo

``` ts
class WriteCommand implements Command {
  constructor(
    private editor: TextEditor,
    private text: string
  ) {}

  execute(): void {
    this.editor.write(this.text);
  }

  undo(): void {
    this.editor.delete(this.text.length);
  }
}
```

If the command executes:

``` ts
const command = new WriteCommand(
  editor,
  "Hello"
);

command.execute();
```

the editor becomes:

``` text
Hello
```

When:

``` ts
command.undo();
```

is called, the command knows that it added five characters, so it asks
the Receiver to delete five characters.

The editor returns to:

``` text
""
```

------------------------------------------------------------------------

## 15. Command History

Now we can create a history manager.

``` ts
class CommandHistory {
  private history: Command[] = [];

  execute(command: Command): void {
    command.execute();

    this.history.push(command);
  }

  undo(): void {
    const command = this.history.pop();

    if (!command) {
      console.log("Nothing to undo");
      return;
    }

    command.undo();
  }
}
```

The history uses an array as a stack.

When a command executes:

``` ts
this.history.push(command);
```

When an undo occurs:

``` ts
this.history.pop();
```

Therefore commands are undone in **Last In, First Out** order.

------------------------------------------------------------------------

## 16. Complete Undo Example

``` ts
// ------------------------------------
// Command
// ------------------------------------

interface Command {
  execute(): void;
  undo(): void;
}


// ------------------------------------
// Receiver
// ------------------------------------

class TextEditor {
  private content = "";

  write(text: string): void {
    this.content += text;

    console.log(`Added: "${text}"`);
  }

  delete(count: number): string {
    const deletedText = this.content.slice(-count);

    this.content = this.content.slice(
      0,
      this.content.length - count
    );

    console.log(`Deleted: "${deletedText}"`);

    return deletedText;
  }

  getContent(): string {
    return this.content;
  }
}


// ------------------------------------
// Concrete Command
// ------------------------------------

class WriteCommand implements Command {
  constructor(
    private editor: TextEditor,
    private text: string
  ) {}

  execute(): void {
    this.editor.write(this.text);
  }

  undo(): void {
    this.editor.delete(this.text.length);
  }
}


// ------------------------------------
// Invoker / History
// ------------------------------------

class CommandHistory {
  private history: Command[] = [];

  execute(command: Command): void {
    command.execute();

    this.history.push(command);
  }

  undo(): void {
    const command = this.history.pop();

    if (!command) {
      console.log("Nothing to undo");
      return;
    }

    command.undo();
  }
}


// ------------------------------------
// Client
// ------------------------------------

const editor = new TextEditor();

const history = new CommandHistory();

const writeHello = new WriteCommand(
  editor,
  "Hello"
);

const writeWorld = new WriteCommand(
  editor,
  " World"
);

history.execute(writeHello);

history.execute(writeWorld);

console.log(
  "Current:",
  editor.getContent()
);

history.undo();

console.log(
  "After first undo:",
  editor.getContent()
);

history.undo();

console.log(
  "After second undo:",
  editor.getContent()
);
```

### Output

``` text
Added: "Hello"
Added: " World"

Current: Hello World

Deleted: " World"

After first undo: Hello

Deleted: "Hello"

After second undo:
```

------------------------------------------------------------------------

# 17. What Happens Internally During Undo?

Suppose the history contains:

``` text
WriteCommand("Hello")
WriteCommand(" World")
```

and the current editor content is:

``` text
Hello World
```

When we call:

``` ts
history.undo();
```

the history manager executes:

``` ts
const command = this.history.pop();
```

The last command is retrieved first.

That command is:

``` text
WriteCommand(" World")
```

The history manager then calls:

``` ts
command.undo();
```

Because the actual object is a `WriteCommand`, its `undo()` method runs.

Inside `undo()`:

``` ts
this.editor.delete(this.text.length);
```

The command knows that the text it added had a length of `6`.

It therefore asks the Receiver to delete six characters.

The editor changes from:

``` text
Hello World
```

to:

``` text
Hello
```

The history manager does not need to know how a write operation is
reversed.

It simply calls:

``` ts
command.undo();
```

This is another example of polymorphism and decoupling working together.

------------------------------------------------------------------------

# 18. Why Command History Uses a Stack

Suppose the user performs:

``` text
Write A
Write B
Write C
```

The history becomes:

``` text
Write A
Write B
Write C
```

When the user presses Undo, `Write C` must be reversed first.

Then:

``` text
Write A
Write B
```

The next Undo reverses `Write B`.

Then:

``` text
Write A
```

The next Undo reverses `Write A`.

This is exactly the behavior of a stack:

``` text
Last In → First Out
```

This is why command objects work naturally for traditional undo systems.

------------------------------------------------------------------------

# 19. Asynchronous Commands in TypeScript

In a real Node.js backend, commands will often execute asynchronous
operations.

For example:

``` ts
interface Command {
  execute(): Promise<void>;
}
```

A concrete command can then be:

``` ts
class PlaceOrderCommand implements Command {
  constructor(
    private orderService: OrderService,
    private orderId: string
  ) {}

  async execute(): Promise<void> {
    await this.orderService.placeOrder(
      this.orderId
    );
  }
}
```

The Receiver can contain database or network operations:

``` ts
class OrderService {
  async placeOrder(orderId: string): Promise<void> {
    console.log(`Saving order ${orderId}`);

    // Database operation

    console.log(`Order ${orderId} placed`);
  }
}
```

The Invoker becomes:

``` ts
class CommandInvoker {
  async execute(command: Command): Promise<void> {
    await command.execute();
  }
}
```

The pattern itself hasn't changed.

The Command still represents the operation, the Receiver still performs
the actual work, and the Invoker still triggers the command.

------------------------------------------------------------------------

# 20. Command Pattern and Queues

The Command Pattern becomes particularly useful when operations need to
be processed asynchronously.

Suppose placing an order requires several expensive operations.

Instead of performing everything inside the HTTP request, the
application can create a command:

``` ts
const command = new PlaceOrderCommand(
  orderService,
  "ORD-1001"
);
```

The command can then be passed to a queue.

A worker can later receive the operation and execute it.

Conceptually:

``` text
API Request
     |
     v
Create Command
     |
     v
Queue
     |
     v
Worker
     |
     v
command.execute()
     |
     v
OrderService
```

The queue does not need to understand the business logic of placing an
order.

It deals with commands.

In a distributed application, the command will normally need to be
serialized into data before being placed onto a durable queue. A live
TypeScript object containing an `OrderService` reference cannot simply
be sent through JSON. The worker typically receives command data and
reconstructs or dispatches the appropriate command on the worker side.

------------------------------------------------------------------------

# 21. Command Bus

In larger applications, you may encounter a **Command Bus**.

Instead of directly calling an Invoker:

``` ts
invoker.execute(command);
```

the application might use:

``` ts
commandBus.execute(command);
```

A simple Command Bus could look like:

``` ts
interface Command {
  execute(): Promise<void>;
}

class CommandBus {
  async execute(command: Command): Promise<void> {
    await command.execute();
  }
}
```

A more sophisticated Command Bus can become a centralized execution
point for cross-cutting concerns such as logging, metrics, validation,
authorization, transactions, and error handling.

For example:

``` ts
class CommandBus {
  async execute(command: Command): Promise<void> {
    console.log("Executing command");

    try {
      await command.execute();

      console.log("Command completed");
    } catch (error) {
      console.log("Command failed");

      throw error;
    }
  }
}
```

This allows the commands themselves to focus primarily on the operation
they represent.

------------------------------------------------------------------------

# 22. Command Pattern vs Strategy Pattern

Command and Strategy are both behavioral design patterns, so they can
sometimes be confused.

The main difference is what they encapsulate.

**Strategy encapsulates an algorithm or way of performing something.**

For example:

``` text
CreditCardPayment
UPIPayment
PayPalPayment
```

The application chooses which strategy should be used.

The question is:

> Which algorithm should I use?

Command is different.

Command encapsulates a request or operation:

``` text
PlaceOrderCommand
CancelOrderCommand
RefundOrderCommand
```

The question is:

> What operation should be performed?

A useful way to remember this is:

> **Strategy encapsulates how to do something.**

> **Command encapsulates what operation should be performed.**

------------------------------------------------------------------------

# 23. Command Pattern vs Observer Pattern

Observer solves a different problem.

Suppose an order is created and multiple systems need to know about it.

The Subject notifies its registered observers:

``` text
Order Created
     |
     ├── Email
     ├── Analytics
     ├── Warehouse
     └── Notification
```

The question Observer answers is:

> Who needs to know that something happened?

Command answers a different question:

> What operation do I want to perform?

For example:

``` text
CancelOrderCommand
       |
       v
OrderService.cancelOrder()
```

Therefore:

> **Observer = notify interested parties that something happened.**

> **Command = represent an operation or request as an object.**

------------------------------------------------------------------------

# 24. Command Pattern vs Factory Pattern

Factory answers:

> Which object should I create?

For example:

``` ts
const payment = PaymentFactory.create("UPI");
```

Command answers:

> How can I represent an operation as an object?

For example:

``` ts
const command = new RefundOrderCommand(
  orderService,
  "ORD-1001"
);
```

The two patterns can also work together.

A Factory can create the appropriate Command based on an incoming
request:

``` ts
class CommandFactory {
  static create(
    type: string,
    orderService: OrderService,
    orderId: string
  ): Command {
    if (type === "PLACE") {
      return new PlaceOrderCommand(
        orderService,
        orderId
      );
    }

    if (type === "CANCEL") {
      return new CancelOrderCommand(
        orderService,
        orderId
      );
    }

    throw new Error("Unknown command");
  }
}
```

The Factory creates the object, while the Command represents the
operation.

------------------------------------------------------------------------

# 25. Real-World Usage

The Command Pattern appears naturally wherever operations need to be
treated as independent objects.

A text editor can represent writing, deleting, copying, and pasting as
commands so that undo and redo can be implemented.

A GUI application can represent button actions as commands so that the
UI component does not need to contain the business logic for each
operation.

A backend application can represent business operations as commands and
execute them through a command bus.

A background processing system can represent tasks as commands and
execute them through workers.

A scheduling system can represent future operations as commands and
execute them when the scheduled time arrives.

The exact implementation varies, but the core idea remains the same:

> **The operation itself becomes a first-class object.**

------------------------------------------------------------------------

# 26. Advantages

The Command Pattern provides a clean separation between the object that
requests an operation and the object that performs it.

Because commands are objects, operations can be stored, queued, delayed,
logged, retried, and potentially undone.

Adding a new operation usually means creating another Concrete Command
rather than modifying the Invoker.

Commands also provide a natural foundation for undo/redo systems because
each command can store the state required to reverse its operation.

The pattern works particularly well when the application needs to treat
operations as data that can move through different parts of the system.

------------------------------------------------------------------------

# 27. Disadvantages

The main disadvantage is that the number of classes can increase.

For example, instead of simply having:

``` ts
orderService.cancelOrder();
```

we may introduce:

``` text
Command
CancelOrderCommand
Invoker
OrderService
```

For a very small application, this can be unnecessary abstraction.

Another consideration is that undo is not automatically easy for every
operation. Some operations are naturally reversible, while others
require additional state or compensation logic.

For example, reversing:

``` text
Add text
```

is relatively straightforward.

Reversing:

``` text
Send an email
```

is not equivalent to simply calling an opposite method.

Therefore, Command Pattern makes undo possible, but it does not
automatically make every business operation reversible.

------------------------------------------------------------------------

# 28. The Most Important Thing to Remember

If you are asked in an interview:

> **What problem does the Command Design Pattern solve?**

A strong answer is:

> The Command Design Pattern is a behavioral design pattern that
> encapsulates a request or operation as an object. Instead of directly
> coupling the requester to the object that performs the operation, the
> requester works with a command, and the command delegates the actual
> work to a receiver. Because commands are objects, they can be stored,
> queued, delayed, logged, retried, scheduled, or used to implement undo
> and redo functionality.

The central implementation looks like this:

``` ts
interface Command {
  execute(): void;
}
```

A Concrete Command stores the Receiver and the information required for
the operation:

``` ts
class CancelOrderCommand implements Command {
  constructor(
    private orderService: OrderService,
    private orderId: string
  ) {}

  execute(): void {
    this.orderService.cancelOrder(
      this.orderId
    );
  }
}
```

The Invoker only knows about the abstraction:

``` ts
class CommandInvoker {
  execute(command: Command): void {
    command.execute();
  }
}
```

The **Receiver performs the actual business logic**, the **Command
represents the request**, the **Invoker triggers the request**, and the
**Client creates and connects these objects**.

The single most important sentence to remember is:

> **Command Pattern turns a request or method call into an object,
> allowing that operation to be decoupled from its execution and
> subsequently stored, passed around, queued, logged, retried,
> scheduled, or undone.**
