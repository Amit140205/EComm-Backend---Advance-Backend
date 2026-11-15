import { Order, OrderStatus } from "../../../generated/prisma/index.js";
import { CreateOrderDTO } from "./order.schema.js";

export interface IOrderRepository {
    placeOrder(userId: string, data: CreateOrderDTO): Promise<Order>;

    getOrderById(id: string): Promise<Order | null>;

    getOrdersByUserId(userId: string, limit: number, cursor?: string): Promise<Order[]>;

    updateOrderStatus(id: string, orderStatus: OrderStatus): Promise<Order>;

    cancelOrder(id: string, userId: string): Promise<Order>;
}