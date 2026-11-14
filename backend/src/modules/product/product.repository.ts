import { Prisma, Product } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { IProductRepository } from "./product.interface.js";
import { UpdateProductDTO } from "./product.schema.js";

export class ProductRepository implements IProductRepository {
    async createProduct(data:
        {
            userId: string;
            categoryId: string;
            productName: string;
            productDescription: string;
            productImageUrls: string[];
            productPrice: Prisma.Decimal;
            stock: number;
        }
    ): Promise<Product> {
        const product = await prisma.product.create({
            data
        });

        return product;
    }

    async getProductsByCategoryId(categoryId: string, limit: number, cursor?: string): Promise<Product[]> {
        const products = await prisma.product.findMany({
            where: {
                categoryId
            },
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
                createdAt: "desc"
            }
        });

        return products;
    }

    async getAllProducts(limit: number, cursor?: string): Promise<Product[]> {
        const products = await prisma.product.findMany({
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
                createdAt: "desc"
            }
        });

        return products;
    }

    async updateProductById(data: {
        productName?: string;
        productDescription?: string;
        productPrice?: Prisma.Decimal;
        stock?: number;
    },
        id: string,
        sellerId: string): Promise<Product> {
        const updatedProduct = await prisma.product.update({
            data,
            where: {
                id,
                userId: sellerId
            }
        });

        return updatedProduct;
    }

    async getProductByIdAndSellerId(id: string, sellerId: string): Promise<Product | null> {
        const product = await prisma.product.findFirst({
            where: {
                id,
                userId: sellerId
            },
        });

        return product;
    }

    async deleteProductByIdAndSellerId(id: string, sellerId: string): Promise<void> {
        await prisma.product.delete({
            where: {
                id,
                userId: sellerId
            }
        });
    }

    async toggleIsActive(id: string, sellerId: string, isActive: boolean): Promise<Product> {
        const updatedProduct = await prisma.product.update({
            data: {
                isActive: !isActive
            },
            where: {
                id,
                userId: sellerId
            }
        });

        return updatedProduct;
    }

    async getAllActiveProducts(limit: number, cursor?: string): Promise<Product[]> {
        const activeProducts = await prisma.product.findMany({
            where: {
                isActive: true
            },
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
                createdAt: "desc"
            }
        });

        return activeProducts;
    }
}