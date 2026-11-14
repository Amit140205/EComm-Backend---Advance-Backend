import { Product } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { IProductRepository } from "./product.interface.js";

export class ProductRepository implements IProductRepository {
    async createProduct(data:
        {
            userId: string;
            categoryId: string;
            productName: string;
            productDescription: string;
            productImageUrls: string[];
            productPrice: any;
            stock: number;
        }
    ): Promise<Product> {
        const product = await prisma.product.create({
            data
        });

        return product;
    }

    async getProductsByCategoryId(categoryId: string): Promise<Product[]> {
        const products = await prisma.product.findMany({
            where: {
                categoryId
            }
        });

        return products;
    }
}