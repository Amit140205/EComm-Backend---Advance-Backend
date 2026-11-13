import { Category } from "../../../generated/prisma/index.js";
import { CreateCategoryDTO } from "./category.schema.js";

export interface ICategoryRepository {
    createCategory(data: CreateCategoryDTO): Promise<Category>;
    findCategoryByName(categoryName: string): Promise<Category | null>;
}