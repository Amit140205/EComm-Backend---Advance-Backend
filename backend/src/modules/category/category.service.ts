import { Category } from "../../../generated/prisma/index.js";
import { AppError } from "../../utils/app.error.js";
import { IProductRepository } from "../product/product.interface.js";
import { ICategoryRepository } from "./category.interface.js";
import { toCategoryListResponse, toCategoryResponse } from "./category.mapper.js";
import { CategoryResponseDTO } from "./category.response.js";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./category.schema.js";

export class CategoryService {
    constructor(private categoryRepo: ICategoryRepository, private productRepo: IProductRepository) { };

    async createCategory(data: CreateCategoryDTO): Promise<{
        category: CategoryResponseDTO;
    }> {
        const existingCategory = await this.categoryRepo.findCategoryByName(data.categoryName);

        if (existingCategory) {
            throw new AppError(400, "Category with this name already exists");
        }

        const category = await this.categoryRepo.createCategory(data);

        return {
            category: toCategoryResponse(category)
        };
    }

    async getAllCategories(limit: number, cursor?: string): Promise<{
        categories: CategoryResponseDTO[];
    }> {
        const categories = await this.categoryRepo.getAllCategories(limit, cursor);
        return {
            categories: toCategoryListResponse(categories)
        };
    }

    async updateCategory(id: string, data: UpdateCategoryDTO): Promise<{
        category: CategoryResponseDTO;
    }> {
        const existingCategory = await this.categoryRepo.findCategoryById(id);

        if (!existingCategory) {
            throw new AppError(404, "Category not found");
        }

        const updatedCategory = await this.categoryRepo.updateCategory(id, data);

        return {
            category: toCategoryResponse(updatedCategory)
        };
    }

    async deleteCategory(id: string): Promise<void> {
        const existingCategory = await this.categoryRepo.findCategoryById(id);

        if (!existingCategory) {
            throw new AppError(404, "Category not found");
        }

        const products = await this.productRepo.getProductsByCategoryId(id, 1);
        // even if it returns atleast one product, we can not delete the category

        if (products.length > 0) {
            throw new AppError(400, "Category that contains products can not be deleted");
        }

        await this.categoryRepo.deleteCategoryById(id);
    }
}