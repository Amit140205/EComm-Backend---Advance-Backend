import { Cart, CartItem, Product } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app.error.js";
import { CartItemWithPayload, CartWithItems, ICartRepository } from "./cart.interface.js";

export class CartRepository implements ICartRepository {
    async getCartByUserId(userId: string): Promise<Cart | null> {
        const cart = await prisma.cart.findUnique({
            where: {
                userId
            }
        });

        return cart;
    }

    async getCartItemByIdAndCartId(id: string, cartId: string): Promise<CartItemWithPayload | null> {
        const cartItem = await prisma.cartItem.findUnique({
            where: {
                id,
                cartId
            },
            include: {
                product: true
            }
        });

        return cartItem;
    }

    async createCart(userId: string): Promise<Cart> {
        const newCart = await prisma.cart.create({
            data: {
                userId
            }
        });

        return newCart;
    }

    async getCartWithItems(userId: string): Promise<CartWithItems | null> {
        const cart = await prisma.cart.findUnique({
            where: {
                userId
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        return cart;
    }

    async addCartItem(data: { cartId: string; product: Product, productId: string; quantity: number; }): Promise<CartItem> {
        const { cartId, product, productId, quantity } = data;

        const existingCartItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId,
                    productId
                }
            }
        });

        if (existingCartItem) {
            if (product.stock < (existingCartItem.quantity + quantity)) {
                throw new AppError(400, "Insufficient stock");
            }
            return await prisma.cartItem.update({
                data: {
                    quantity: {
                        increment: quantity
                    }
                },
                where: {
                    id: existingCartItem.id
                }
            });
        }

        return await prisma.cartItem.create({
            data: {
                cartId,
                productId,
                quantity
            }
        });
    }

    async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItem> {
        const updatedCartItem = await prisma.cartItem.update({
            data: {
                quantity
            },
            where: {
                id: cartItemId
            }
        });

        return updatedCartItem;
    }

    async removeCartItem(cartItemId: string): Promise<void> {
        await prisma.cartItem.delete({
            where: {
                id: cartItemId
            }
        });
    }

    async clearCart(cartId: string): Promise<void> {
        await prisma.cartItem.deleteMany({
            where: {
                cartId
            }
        });
    }
}