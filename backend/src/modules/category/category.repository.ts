import { Category } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { ICategoryRepository } from "./category.interface.js";
import { CreateCategoryDTO } from "./category.schema.js";

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
}