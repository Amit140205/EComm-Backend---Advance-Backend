import { Order, OrderStatus, Prisma } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app.error.js";
import { IOrderRepository } from "./order.interface.js";
import { CreateOrderDTO } from "./order.schema.js";


export class OrderRepository implements IOrderRepository {
    async placeOrder(userId: string, data: CreateOrderDTO): Promise<Order> {
        return await prisma.$transaction(async (tx) => {
            const { items, addressId } = data;

            // Problem

            // here Race Condition occurs
            // Transaction 1: quantity = 1 | Transaction 2: quantity = 1 (both request at the same time, validation passed)
            // product stock become(actual stock = 1) = -1 (Lost Update Problem)
            // read -> validate -> update (problem)
            // soln: Do all of this stuff in a single query

            // this looping causes => N+1 Query Problem
            // 1 query per product | 1 update per product
            // but the logic should be fetch the all the products before the loop

            // After improvement
            // 1. Transactional safety
            // 2. Atomic db operation
            // 3. Concurrency handling
            // 4. Scalable stock handling 

            // first step
            // fetch address snap
            const address = await tx.address.findUnique({
                where: {
                    id: addressId,
                    userId
                }
            });

            if (!address) {
                throw new AppError(400, "Invalid address");
            }

            let totalPrice = new Prisma.Decimal(0);
            let totalItems = 0;
            let orderItemsData: {
                productId: string,
                quantity: number,
                priceAtPurchase: Prisma.Decimal;
            }[] = [];

            // then product
            const productIds = items.map((item) => item.productId);
            const products = await tx.product.findMany({
                where: {
                    id: {
                        in: productIds
                    }
                }
            });

            const productMap = new Map(
                products.map((product) => [product.id, product])
            );

            for (const item of items) {
                // // check each product available or not
                // const product = await tx.product.findUnique({
                //     where: {
                //         id: item.productId
                //     }
                // });

                // if (!product) {
                //     throw new AppError(404, "Product not found");
                // }

                // if (!product.isActive) {
                //     throw new AppError(400, `${product.productName} is not available`);
                // }

                // if (product.stock < item.quantity) {
                //     throw new AppError(400, `Insufficient stock for ${product.productName}`);
                // }

                // // update the product stock
                // await tx.product.update({
                //     data: {
                //         stock: {
                //             decrement: item.quantity
                //         }
                //     },
                //     where: {
                //         id: product.id
                //     }
                // });

                const product = productMap.get(item.productId);

                if (!product) {
                    throw new AppError(404, "Product not found");
                }

                if (!product.isActive) {
                    throw new AppError(400, `${product.productName} is not available`);
                }

                // single query
                const updatedProduct = await tx.product.updateMany({
                    where: {
                        id: item.productId,
                        stock: {
                            gte: item.quantity
                        },
                        isActive: true
                    },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                });

                if (!updatedProduct.count) {
                    throw new AppError(400, "Insufficient stock");
                }

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
                items: {
                    include: {
                        product: true
                    }
                },
                orderAddress: true
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