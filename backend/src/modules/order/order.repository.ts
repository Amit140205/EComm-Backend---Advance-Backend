import { Order, OrderStatus, Prisma } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app.error.js";
import { IOrderRepository } from "./order.interface.js";
import { CreateOrderDTO } from "./order.schema.js";


export class OrderRepository implements IOrderRepository {
    async placeOrder(userId: string, data: CreateOrderDTO): Promise<Order> {
        return await prisma.$transaction(async (tx) => {
            const { items, addressId } = data;

            // Problem: Duplicate productIds in the request, create two order items for the same product. 
            // Merge them first
            const merged = new Map<string, number>();

            for (const { productId, quantity } of items) {
                const existingQuantity = merged.get(productId) ?? 0;
                merged.set(productId, existingQuantity + quantity);
            }

            const uniqueItems = [...merged].map(([productId, quantity]) => ({ productId, quantity }));

            let totalPrice = new Prisma.Decimal(0);
            let totalItems = 0;

            const orderItemsData: {
                productId: string;
                quantity: number;
                priceAtPurchase: Prisma.Decimal;
            }[] = [];

            for (const item of uniqueItems) {
                // check each product available or not
                const product = await tx.product.findUnique({
                    where: {
                        id: item.productId
                    }
                });

                if (!product) {
                    throw new AppError(404, "Product not found");
                }

                if (!product.isActive) {
                    throw new AppError(400, `${product.productName} is not available`);
                }

                if (product.stock < item.quantity) {
                    throw new AppError(400, `Insufficient stock for ${product.productName}`);
                }

                // update the product stock
                await tx.product.update({
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    },
                    where: {
                        id: product.id
                    }
                });

                // total item price = item price * quantity
                const totalItemPrice = product.productPrice.mul(item.quantity);

                totalPrice = totalPrice.add(totalItemPrice);
                totalItems += item.quantity;

                orderItemsData.push({
                    productId: product.id,
                    quantity: item.quantity,
                    priceAtPurchase: product.productPrice
                });
            }

            // fetch address snap
            const address = await tx.address.findUnique({
                where: {
                    id: data.addressId,
                    userId
                }
            });

            if (!address) {
                throw new AppError(400, "Invalid address");
            }

            const newOrder = await tx.order.create({
                data: {
                    userId,
                    totalPrice,
                    totalItems,
                    status: OrderStatus.PENDING,
                    items: {
                        create: orderItemsData // automatically creates orderItems under this order id
                    },
                    orderAddress: {
                        create: {
                            addressLine1: address.addressLine1,
                            addressLine2: address.addressLine2,
                            city: address.city,
                            state: address.state,
                            country: address.country
                        }
                    }
                },
                include: {
                    items: true,
                    orderAddress: true
                }
            });

            return newOrder;
        });
    }

    async getOrderById(id: string): Promise<Order | null> {
        const order = await prisma.order.findUnique({
            where: {
                id
            },
            include: {
                items: true
            }
        });

        return order;
    }

    async getOrdersByUserId(userId: string, limit: number, cursor?: string): Promise<Order[]> {
        const orders = await prisma.order.findMany({
            where: {
                userId
            },
            include: {
                items: true
            },
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
                createdAt: "desc"
            }
        });

        return orders;
    }

    async updateOrderStatus(id: string, orderStatus: OrderStatus): Promise<Order> {
        const updatedOrder = await prisma.order.update({
            data: {
                status: orderStatus
            },
            where: {
                id
            }
        });

        return updatedOrder;
    }

    async cancelOrder(id: string, userId: string): Promise<Order> {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: {
                    id,
                    userId
                },
                include: {
                    items: true
                }
            });

            if (!order) {
                throw new AppError(401, "Product not found or you are not authorized to perform this action");
            }

            if (order.status !== OrderStatus.PENDING) {
                throw new AppError(400, "Only pending orders can be cancelled");
            }

            // restore the stock
            for (const item of order.items) {
                await tx.product.update({
                    data: {
                        stock: {
                            increment: item.quantity
                        }
                    },
                    where: {
                        id: item.productId
                    }
                });
            }

            return await tx.order.update({
                data: {
                    status: OrderStatus.CANCELLED
                },
                where: {
                    id
                }
            });
        });
    }
}