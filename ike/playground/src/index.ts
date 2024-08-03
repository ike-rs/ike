// const decoder = new TextDecoder("utf-8");
// const data = Ike.readFileSync("src/hello.txt");
// console.log(data[0])
// console.log("dwadaw")

// 1. Enum - używany do definiowania zbioru stałych wartości
enum UserRole {
    Admin = 'Admin',
    User = 'User',
    Guest = 'Guest'
}

// 2. Typy - definiowanie własnych typów za pomocą `type` oraz interfejsów
type User = {
    id: number;
    name: string;
    role: UserRole;
}

interface Product {
    id: number;
    name: string;
    price: number;
}


class ShoppingCart {
    private products: Product[] = [];

    addProduct(product: Product): void {
        this.products.push(product);
    }

    removeProduct(productId: number): void {
        this.products = this.products.filter(p => p.id !== productId);
    }

    calculateTotal(): number {
        return this.products.reduce((total, product) => total + product.price, 0);
    }

    listProducts(): Product[] {
        return this.products;
    }
}

// Przykładowe użycie
const cart = new ShoppingCart();

const user: User = {
    id: 1,
    name: 'John Doe',
    role: UserRole.Admin
};

const product1: Product = {id: 1, name: 'Laptop', price: 1500};
const product2: Product = {id: 2, name: 'Mouse', price: 50};

cart.addProduct(product1);
cart.addProduct(product2);
console.log(`Total: ${cart.calculateTotal()}`);

cart.removeProduct(1);
console.log(cart.listProducts());
