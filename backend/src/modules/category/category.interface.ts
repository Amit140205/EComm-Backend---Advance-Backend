import { Category } from "../../../generated/prisma/index.js";
import { CategoryQueryOptions } from "../../types/index.js";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./category.schema.js";

export interface ICategoryRepository {
    createCategory(data: CreateCategoryDTO): Promise<Category>;

    findCategoryByName(categoryName: string): Promise<Category | null>;

    findCategoryById(id: string): Promise<Category | null>;

    getAllCategories(filters: CategoryQueryOptions): Promise<Category[]>;

    updateCategory(id: string, data: UpdateCategoryDTO): Promise<Category>; 
    
    deleteCategoryById(id: string): Promise<void>;
}