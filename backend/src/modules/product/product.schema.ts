import { z } from "zod";

export const createProductSchema = z.object({
    categoryId: z.string(),
    productName: z.string().min(2, "Product name must be atleast 2 charaters long"),
    productDescription: z.string().min(10, "Product description must be atleast 10 characters long"),
    productPrice: z.string(),
    stock: z.string()
}).strict();

export type CreateProductDTO = z.infer<typeof createProductSchema>;