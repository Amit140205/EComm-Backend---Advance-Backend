import { date, z } from "zod";

export const createProductSchema = z.object({
    categoryId: z.string(),
    productName: z.string().min(2, "Product name must be atleast 2 charaters long"),
    productDescription: z.string().min(10, "Product description must be atleast 10 characters long"),
    productPrice: z.string(),
    stock: z.string()
}).strict();

export const updateProductSchema = z.object({
    productName: z.string().min(2, "Product name must be atleast 2 charaters long").optional(),
    productDescription: z.string().min(10, "Product description must be atleast 10 characters long").optional(),
    productPrice: z.string().optional(),
    stock: z.string().optional()
}).strict().refine(
    // (date) => Object.keys(date).length > 0, { productName: undefined } passes the refinement
    // to fix that
    (data) => Object.values(data).some(value => value !== undefined),
    {
        message: "At least one field is required to update the product"
    }
);

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;