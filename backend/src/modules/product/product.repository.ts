import { Prisma, Product } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { ProductQueryOptions } from "../../types/index.js";
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

    async getAllActiveProducts(filters: ProductQueryOptions): Promise<Product[]> {
        const { limit, cursor, categoryId, minPrice, maxPrice, sortBy } = filters;

        const parsedLimit = limit ? parseInt(limit as string) : 5;

        const where: Prisma.ProductWhereInput = {
            isActive: true
        };

        // filter by category
        if (categoryId) {
            where.categoryId = categoryId;
        }

        // filter by price
        if (minPrice || maxPrice) {
            where.productPrice = {};

            if (minPrice) {
                where.productPrice.gte = new Prisma.Decimal(minPrice);
            }

            if (maxPrice) {
                where.productPrice.lte = new Prisma.Decimal(maxPrice);
            }
        }

        // sort
        let orderBy: Prisma.ProductOrderByWithRelationInput = {
            createdAt: "desc"
        };

        switch (sortBy) {
            case "latest":
                orderBy = { createdAt: "desc" };
                break;

            case "oldest":
                orderBy = { createdAt: "asc" };
                break;
            
            case "priceAsc":
                orderBy = { productPrice: "asc" };
                break;
            
            case "priceDesc":
                orderBy = { productPrice: "desc" };
                break;
        }

        const activeProducts = await prisma.product.findMany({
            where,
            take: parsedLimit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy
        });

        return activeProducts;
    }

    async getProductById(id: string): Promise<Product | null> {
        const product = await prisma.product.findUnique({
            where: {
                id
            }
        });

        return product;
    }
}