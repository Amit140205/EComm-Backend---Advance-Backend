import { AppError } from "../../utils/app.error.js";
import { ICategoryRepository } from "./category.interface.js";
import { toCategoryResponse } from "./category.mapper.js";
import { CategoryResponseDTO } from "./category.response.js";
import { CreateCategoryDTO } from "./category.schema.js";

export class CategoryService {
    constructor(private categoryRepo: ICategoryRepository) { };

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
}