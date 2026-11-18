import z from "zod";

export const addToCartSchema = z.object({
    productId: z.string(),
    quantity: z.int().min(1, "Quantity must be at least 1").positive()
}).strict();

export const updateCartItemSchema = z.object({
    quantity: z.int()
}).strict();

export type AddToCartDTO = z.infer<typeof addToCartSchema>;
export type UpdateCartItemDTO = z.infer<typeof updateCartItemSchema>;