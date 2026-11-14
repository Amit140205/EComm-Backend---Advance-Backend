import { Category } from "../../../generated/prisma/index.js";
import { CategoryResponseDTO } from "./category.response.js";

export const toCategoryResponse = (category: Category): CategoryResponseDTO => {
    return {
        id: category.id,
        categoryName: category.categoryName,
        categoryDescription: category.categoryDescription,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
    };
};

export const toCategoryListResponse = (categories: Category[]): CategoryResponseDTO[] => {
    return categories.map((category: Category) => toCategoryResponse(category));
}