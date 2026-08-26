// --- Burger Interface ---
interface Burger {
    prepare(): void;
}

// --- Concrete Burger Implementations ---
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

// --- Burger Factory ---
class BurgerFactory {
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

// --- Execution ---
const type = 'standard';

const myBurgerFactory = new BurgerFactory();

const burger = myBurgerFactory.createBurger(type);

if (burger) {
    burger.prepare();
}
