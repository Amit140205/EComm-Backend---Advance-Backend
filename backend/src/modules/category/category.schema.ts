import { z } from "zod";

export const createCategorySchema = z.object({
    categoryName: z.string().min(2, "Category name must be atleast 2 characters long"),
    categoryDescription: z.string().min(10, "Category description must be atleast 10 characters long").optional()
}).strict();

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;