import { Category } from "../../../generated/prisma/index.js";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./category.schema.js";

export interface ICategoryRepository {
    createCategory(data: CreateCategoryDTO): Promise<Category>;
    findCategoryByName(categoryName: string): Promise<Category | null>;
    findCategoryById(id: string): Promise<Category | null>;
    getAllCategories(): Promise<Category[]>;
    updateCategory(id: string, data: UpdateCategoryDTO): Promise<Category>; 
    deleteCategoryById(id: string): Promise<void>;
}