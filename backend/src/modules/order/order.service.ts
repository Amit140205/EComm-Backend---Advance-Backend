import { Order, OrderStatus } from "../../../generated/prisma/index.js";
import { AppError } from "../../utils/app.error.js";
import { IOrderRepository } from "./order.interface.js";
import { CreateOrderDTO, UpdateOrderStatusDTO } from "./order.schema.js";

export class OrderService {
    constructor(private orderRepo: IOrderRepository) { }

    async createOrder(userId: string, data: CreateOrderDTO): Promise<{
        order: Order;
    }> {
        const newOrder = await this.orderRepo.placeOrder(userId, data);

        return {
            order: newOrder
        };
    }

    async getUserOrders(userId: string, limit: number, cursor?: string): Promise<{
        orders: Order[];
    }> {
        const orders = await this.orderRepo.getOrdersByUserId(userId, limit, cursor);

        return {
            orders
        };
    }

    async updateOrderStatus(id: string, data: UpdateOrderStatusDTO): Promise<{
        order: Order;
    }> {
        const { status } = data;

        const existingOrder = await this.orderRepo.getOrderById(id);

        if (!existingOrder) {
            throw new AppError(404, "Order not found");
        }


        if (existingOrder.status !== OrderStatus.PENDING || status === OrderStatus.PENDING) {
            throw new AppError(400, `Can not change status from ${existingOrder.status} to ${status}`);
        }

        const updatedOrder = await this.orderRepo.updateOrderStatus(id, status);

        return {
            order: updatedOrder
        };
    }

    async cancelOrder(id: string, userId: string): Promise<{
        order: Order;
    }> {
        const order = await this.orderRepo.cancelOrder(id, userId);

        return {
            order
        };
    }
}