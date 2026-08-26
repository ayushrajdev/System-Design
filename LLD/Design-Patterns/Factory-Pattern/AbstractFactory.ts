// --- Product 1: Burger ---
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

// --- Product 2: Garlic Bread ---
interface GarlicBread {
    prepare(): void;
}

class BasicGarlicBread implements GarlicBread {
    prepare(): void {
        console.log('Preparing Basic Garlic Bread with butter and garlic!');
    }
}

class CheeseGarlicBread implements GarlicBread {
    prepare(): void {
        console.log(
            'Preparing Cheese Garlic Bread with extra cheese and butter!',
        );
    }
}

class BasicWheatGarlicBread implements GarlicBread {
    prepare(): void {
        console.log(
            'Preparing Basic Wheat Garlic Bread with butter and garlic!',
        );
    }
}

class CheeseWheatGarlicBread implements GarlicBread {
    prepare(): void {
        console.log(
            'Preparing Cheese Wheat Garlic Bread with extra cheese and butter!',
        );
    }
}

// --- Abstract Factory ---
interface MealFactory {
    createBurger(type: string): Burger | null;
    createGarlicBread(type: string): GarlicBread | null;
}

// --- Concrete Factory 1 ---
class SinghBurger implements MealFactory {
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

    createGarlicBread(type: string): GarlicBread | null {
        const normalizedType = type.toLowerCase();
        if (normalizedType === 'basic') {
            return new BasicGarlicBread();
        } else if (normalizedType === 'cheese') {
            return new CheeseGarlicBread();
        } else {
            console.log('Invalid Garlic bread type!');
            return null;
        }
    }
}

// --- Concrete Factory 2 ---
class KingBurger implements MealFactory {
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

    createGarlicBread(type: string): GarlicBread | null {
        const normalizedType = type.toLowerCase();
        if (normalizedType === 'basic') {
            return new BasicWheatGarlicBread();
        } else if (normalizedType === 'cheese') {
            return new CheeseWheatGarlicBread();
        } else {
            console.log('Invalid Garlic bread type!');
            return null;
        }
    }
}

// --- Execution ---
const burgerType = 'basic';
const garlicBreadType = 'cheese';

const mealFactory: MealFactory = new SinghBurger();

const burger: Burger | null = mealFactory.createBurger(burgerType);
const garlicBread: GarlicBread | null =
    mealFactory.createGarlicBread(garlicBreadType);

if (burger) burger.prepare();
if (garlicBread) garlicBread.prepare();
