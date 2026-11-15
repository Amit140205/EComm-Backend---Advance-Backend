import { z } from "zod";

export const createOrderSchema = z.object({
    items: z.array(
        z.object({
            productId: z.string(),
            quantity: z.number().min(1, "Quantity must be at least 1"),
        })
    ).min(1, "At least one item is required in the order list"),
    addressId: z.string() // to keep the address snap with order
}).strict();

export const updateOrderStatusSchema = z.object({
    status: z.enum(["PENDING", "COMPLETED", "CANCELLED"])
}).strict();

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>;