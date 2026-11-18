import { CartItem, Prisma } from "../../../generated/prisma/index.js";
import { AppError } from "../../utils/app.error.js";
import { IProductRepository } from "../product/product.interface.js";
import { ICartRepository } from "./cart.interface.js";
import { AddToCartDTO, UpdateCartItemDTO } from "./cart.schema.js";

export class CartService {
    constructor(private cartRepo: ICartRepository, private productRepo: IProductRepository) { }

    async addToCart(userId: string, data: AddToCartDTO): Promise<{
        cartItem: CartItem;
    }> {
        const { productId, quantity } = data;

        const product = await this.productRepo.getProductById(productId);

        if (!product) {
            throw new AppError(404, "Product not found");
        }

        if (product.stock < quantity) {
            throw new AppError(400, "Insufficient stock");
        }

        let cart = await this.cartRepo.getCartByUserId(userId);

        if (!cart) {
            cart = await this.cartRepo.createCart(userId);
        }

        const cartItem = await this.cartRepo.addCartItem({
            cartId: cart.id,
            product,
            productId,
            quantity
        });

        return {
            cartItem
        };
    }

    async getCartWithItems(userId: string): Promise<{
        id?: string;
        items: any[];
        totalPrice: Prisma.Decimal;
        totalItems: number;
    }> {
        const cart = await this.cartRepo.getCartWithItems(userId);

        if (!cart) {
            return {
                items: [],
                totalPrice: new Prisma.Decimal(0),
                totalItems: 0
            };
        }

        let totalPrice = new Prisma.Decimal(0);
        let totalItems = 0;

        const formattedItems = cart.items.map((item) => {
            const isAvailable = item.product.isActive;

            if (isAvailable) {
                const itemTotalPrice = item.product.productPrice.mul(item.quantity);
                totalPrice = totalPrice.add(itemTotalPrice);
                totalItems += item.quantity;
            }

            return {
                ...item,
                isAvailable
            };
        });

        return {
            id: cart.id,
            items: formattedItems,
            totalPrice,
            totalItems
        };
    }

    async updateCartItem(userId: string, cartItemId: string, data: UpdateCartItemDTO): Promise<{
        cartItem: CartItem | null;
    }> {
        const { quantity } = data;

        // verify that cart and cart item belongs to this particular user or not
        const cart = await this.cartRepo.getCartByUserId(userId);

        if (!cart) {
            throw new AppError(404, "Cart not found");
        }

        const existingCartItem = await this.cartRepo.getCartItemByIdAndCartId(cartItemId, cart.id);

        if (!existingCartItem) {
            throw new AppError(404, "Cart Item not found");
        }

        // remove cart item if quantity provided less than or equal to 0
        if (quantity <= 0) {
            await this.cartRepo.removeCartItem(cartItemId);
            return {
                cartItem: null
            };
        }

        const { product } = existingCartItem;

        if (product.stock < quantity) {
            throw new AppError(400, "Insufficient stock");
        }

        const updatedCartItem = await this.cartRepo.updateCartItemQuantity(cartItemId, quantity);

        return {
            cartItem: updatedCartItem
        };
    }

    async removeCartItem(userId: string, cartItemId: string): Promise<void> {
        const cart = await this.cartRepo.getCartByUserId(userId);

        if (!cart) {
            throw new AppError(404, "Cart not found");
        }

        const existingCartItem = await this.cartRepo.getCartItemByIdAndCartId(cartItemId, cart.id);

        if (!existingCartItem) {
            throw new AppError(404, "Cart Item not found");
        }

        await this.cartRepo.removeCartItem(cartItemId);
    }

    async clearCart(userId: string): Promise<void> {
        const cart = await this.cartRepo.getCartByUserId(userId);

        if (!cart) {
            throw new AppError(404, "Cart not found");
        }

        await this.cartRepo.clearCart(cart.id);
    }
}