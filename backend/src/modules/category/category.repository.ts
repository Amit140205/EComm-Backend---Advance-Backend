import { Category } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { ICategoryRepository } from "./category.interface.js";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./category.schema.js";

export class CategoryRepository implements ICategoryRepository {
    async createCategory(data: CreateCategoryDTO): Promise<Category> {
        const category = await prisma.category.create({
            data
        });

        return category;
    }

    async findCategoryByName(categoryName: string): Promise<Category | null> {
        const category = await prisma.category.findUnique({
            where: {
                categoryName
            }
        });

        return category;
    }

    async findCategoryById(id: string): Promise<Category | null> {
        const category = await prisma.category.findUnique({
            where: {
                id
            }
        });

        return category;
    }

    async getAllCategories(): Promise<Category[]> {
        const categories = await prisma.category.findMany();

        return categories;
    }

    async updateCategory(id: string, data: UpdateCategoryDTO): Promise<Category> {
        const updatedCategory = await prisma.category.update({
            data,
            where: {
                id
            }
        });

        return updatedCategory;
    }

    async deleteCategoryById(id: string): Promise<void> {
        await prisma.category.delete({
            where: {
                id
            }
        });
    }
}