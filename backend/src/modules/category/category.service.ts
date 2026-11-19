import { Category } from "../../../generated/prisma/index.js";
import { redis } from "../../lib/redis.js";
import { CategoryQueryOptions } from "../../types/index.js";
import { AppError } from "../../utils/app.error.js";
import { invalidateCategoryCache } from "../../utils/cache.helper.js";
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

        const newCategory = await this.categoryRepo.createCategory(data);

        await invalidateCategoryCache();

        return {
            category: toCategoryResponse(newCategory)
        };
    }

    async getAllCategories(filters: CategoryQueryOptions): Promise<{
        categories: CategoryResponseDTO[];
    }> {

        // implementing caching
        const entries = Object.entries(filters);
        entries.sort(([a], [b]) => a.localeCompare(b));
        const normalizedFilters = Object.fromEntries(entries);

        const cacheKey = `categories:${JSON.stringify(normalizedFilters)}`;

        const cachedCategories = await redis.get(cacheKey);

        if (cachedCategories) {
            console.log("Cache HIT");
            return JSON.parse(cachedCategories);
        }

        console.log("Cache MISS");

        const categories = await this.categoryRepo.getAllCategories(normalizedFilters);
        const formattedResult = toCategoryListResponse(categories);

        await redis.set(
            cacheKey,
            JSON.stringify(formattedResult),
            "EX",
            300
        );
        return {
            categories: formattedResult
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

        await invalidateCategoryCache();

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

        await invalidateCategoryCache();
    }
}