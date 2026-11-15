import { OrderRepository } from "./order.repository.js";
import { OrderService } from "./order.service.js";

const orderRepository = new OrderRepository();
export const orderService = new OrderService(orderRepository);