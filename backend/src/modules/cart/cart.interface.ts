import { Cart, CartItem, Prisma, Product } from "../../../generated/prisma/index.js";

export type CartWithItems = Prisma.CartGetPayload<{
    include: {
        items: {
            include: {
                product: true;
            };
        };
    };
}>;

export type CartItemWithPayload = Prisma.CartItemGetPayload<{
    include: {
        product: true;
    };
}>;

export interface ICartRepository {
    getCartByUserId(userId: string): Promise<Cart | null>;

    getCartItemByIdAndCartId(id: string, cartId: string): Promise<CartItemWithPayload | null>;

    createCart(userId: string): Promise<Cart>;

    getCartWithItems(userId: string): Promise<CartWithItems | null>;

    addCartItem(data: {
        cartId: string;
        product: Product;
        productId: string;
        quantity: number;
    }): Promise<CartItem>;

    updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItem>;

    removeCartItem(cartItemId: string): Promise<void>;

    clearCart(cartId: string): Promise<void>;
}