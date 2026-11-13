import { CategoryRepository } from "./category.repository.js";
import { CategoryService } from "./category.service.js";

const categoryRepository = new CategoryRepository();
export const categoryService = new CategoryService(categoryRepository);