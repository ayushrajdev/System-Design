// 1. Rename to INotification or NotificationChannel
function NotificationFactoryMethod() {
    interface INotification {
        send(message: string): void;
    }

    // 2. Update the concrete implementation
    class EmailNotification implements INotification {
        send(message: string): void {
            console.log(`Sending Email: ${message}`);
        }
    }

    class SMSNotification implements INotification {
        send(message: string): void {
            console.log(`Sending SMS: ${message}`);
        }
    }

    // 3. Update the Abstract Creator
    abstract class NotificationFactory {
        abstract createNotification(): INotification;

        notifyUser(message: string): void {
            const notification = this.createNotification();
            notification.send(message);
        }
    }

    // 4. Update the Concrete Creators
    class EmailService extends NotificationFactory {
        createNotification(): INotification {
            return new EmailNotification();
        }
    }

    class SMSService extends NotificationFactory {
        createNotification(): INotification {
            return new SMSNotification();
        }
    }

    // --- Usage ---
    const service: NotificationFactory = new EmailService();
    service.notifyUser('Your security code is 8492');
}







function BurgerFactoryMethod() {
    // Product Interface and subclasses
    interface Burger {
        prepare(): void;
    }

    class BasicBurger implements Burger {
        prepare(): void {
            console.log('Preparing Basic Burger with bun, patty, and ketchup!');
        }
    }

    class StandardBurger implements Burger {
        prepare(): void {
            console.log(
                'Preparing Standard Burger with bun, patty, cheese, and lettuce!',
            );
        }
    }

    class PremiumBurger implements Burger {
        prepare(): void {
            console.log(
                'Preparing Premium Burger with gourmet bun, premium patty, cheese, lettuce, and secret sauce!',
            );
        }
    }

    class BasicWheatBurger implements Burger {
        prepare(): void {
            console.log(
                'Preparing Basic Wheat Burger with bun, patty, and ketchup!',
            );
        }
    }

    class StandardWheatBurger implements Burger {
        prepare(): void {
            console.log(
                'Preparing Standard Wheat Burger with bun, patty, cheese, and lettuce!',
            );
        }
    }

    class PremiumWheatBurger implements Burger {
        prepare(): void {
            console.log(
                'Preparing Premium Wheat Burger with gourmet bun, premium patty, cheese, lettuce, and secret sauce!',
            );
        }
    }

    // Factory Interface and Concrete Factories
    interface BurgerFactory {
        createBurger(type: string): Burger | null;
    }

    class SinghBurger implements BurgerFactory {
        createBurger(type: string): Burger | null {
            const normalizedType = type.toLowerCase();

            if (normalizedType === 'basic') {
                return new BasicBurger();
            } else if (normalizedType === 'standard') {
                return new StandardBurger();
            } else if (normalizedType === 'premium') {
                return new PremiumBurger();
            } else {
                console.log('Invalid burger type!');
                return null;
            }
        }
    }

    class KingBurger implements BurgerFactory {
        createBurger(type: string): Burger | null {
            const normalizedType = type.toLowerCase();

            if (normalizedType === 'basic') {
                return new BasicWheatBurger();
            } else if (normalizedType === 'standard') {
                return new StandardWheatBurger();
            } else if (normalizedType === 'premium') {
                return new PremiumWheatBurger();
            } else {
                console.log('Invalid burger type!');
                return null;
            }
        }
    }

    // Execution
    const type = 'basic';

    const myFactory: BurgerFactory = new SinghBurger();
    const burger: Burger | null = myFactory.createBurger(type);

    if (burger) {
        burger.prepare();
    }
}
