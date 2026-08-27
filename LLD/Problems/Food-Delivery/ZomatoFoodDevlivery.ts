class Restaurant {
    /**
     *
     */
    constructor(
        public id: number,
        private name: string,
        private location: string,
    ) {
        console.log(this);
    }
}

class Food {
    /**
     *
     */
    constructor(
        public id: number,
        public restaurantId: number,
        public name: string,
        public price: number,
    ) {}
}

class Cart {
    constructor(
        public id: number,
        public items: Food[]=[],
    ) {}
    checkout(type: 'stripe' | 'razorpay') {
        const payment = PaymentService.pay(this.getTotalPrice(), 1,type);
    }
    getTotalPrice() {
        let totalPrice = 0;
        this.items.forEach((element) => {
            totalPrice += element.price;
        });
        console.log(totalPrice);
        return totalPrice;
    }
    addItem(item: Food) {
        this.items.push(item);
    }
}

// class PaymentStrategy {
//     constructor() {}

// }

class PaymentService {
    constructor() {}
    static pay(
        amount: number,
        cartId: number,
        type: 'stripe' | 'razorpay',
    ): void {
        let payment = PaymentFactory.create(type);
        payment.pay(amount, cartId);
    }
}

interface PaymentStrategy {
    pay(amount: number, cartId: number): void;
}

class StripeStrategy implements PaymentStrategy {
    pay(amount: number, cartId: number): void {}
}
class RazorpayStrategy implements PaymentStrategy {
    pay(amount: number, cartId: number): void {
        console.log("doing payemnt");
        
    }
}

class PaymentFactory {
    private static providers = {
        stripe: StripeStrategy,
        razorpay: RazorpayStrategy,
    };
    static create(type: 'stripe' | 'razorpay'): PaymentStrategy {
        if (Object.keys(this.providers).includes(type.toLocaleLowerCase())) {
            return new this.providers[type]();
        } else {
            throw new Error('incorrect payment provider');
        }
    }
}

(function main() {
    const restaurant = new Restaurant(1, 'zaika', 'patna');
    const briyani = new Food(1, restaurant.id, 'briyani', 200);
    const chicken = new Food(1, restaurant.id, 'chicken', 300);
    const userCart = new Cart(1);
    userCart.addItem(chicken);
    userCart.addItem(briyani);
    userCart.getTotalPrice()
    userCart.checkout("razorpay")
})();
