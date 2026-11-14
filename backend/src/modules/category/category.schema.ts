import { z } from "zod";

export const createCategorySchema = z.object({
    categoryName: z.string().min(2, "Category name must be atleast 2 characters long"),
    categoryDescription: z.string().min(10, "Category description must be atleast 10 characters long").optional()
}).strict();

export const updateCategorySchema = z.object({
    categoryName: z.string().min(2, "Category name must be atleast 2 characters long").optional(),
    categoryDescription: z.string().min(10, "Category description must be atleast 10 characters long").optional()
}).strict().refine(
    (data) => Object.keys(data).length > 0, // returns true or false
    {
        message: "At least one field is required to update the category"
    }

    // if true => validation succeeds
    // false => validation fails
);

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;