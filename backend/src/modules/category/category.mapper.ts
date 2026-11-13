import { Category } from "../../../generated/prisma/index.js";
import { CategoryResponseDTO } from "./category.response.js";

export const toCategoryResponse = (category: Category): CategoryResponseDTO => {
    return {
        id: category.id,
        categoryName: category.categoryName,
        categoryDescription: category.categoryDescription,
        createdAt: category.createdAt
    };
};