import { Prisma, Product } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { ProductCursor, ProductQueryOptions } from "../../types/index.js";
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

    async getAllActiveProducts(filters: ProductQueryOptions): Promise<{
        products: Product[];
        nextCursor: ProductCursor | null;
        hasNext: boolean;
    }> {
        // changing the pagination approach from "Record-Based Cursor Pagination" => "Value-Based Keyset Pagination"

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
        // both createdAt or productPrice and id
        // default for "latest"
        let orderBy: Prisma.ProductOrderByWithRelationInput[] = [
            // for latest
            { createdAt: "desc" },
            { id: "desc" }
        ];

        switch (sortBy) {
            case "latest":
                orderBy = [
                    { createdAt: "desc" },
                    { id: "desc" }
                ];
                break;

            case "oldest":
                orderBy = [
                    { createdAt: "asc" },
                    { id: "asc" }
                ];
                break;

            case "priceAsc":
                orderBy = [
                    { productPrice: "asc" },
                    { id: "asc" }
                ];
                break;

            case "priceDesc":
                orderBy = [
                    { productPrice: "desc" },
                    { id: "desc" }
                ];
                break;
        }

        // cursor => value based keyset pagination
        // previous simple approach does not work for priceAsc and priceDesc filters for that I need to include id
        // if (cursor) {
        //     where.createdAt = {
        //         lt: new Date(cursor)
        //     };
        // }

        if (cursor) {
            if (sortBy === "latest") {
                where.OR = [
                    { createdAt: { lt: new Date(cursor.value) } },
                    {
                        createdAt: new Date(cursor.value),
                        id: { lt: cursor.id }
                    }
                ];
            } else if (sortBy === "oldest") {
                where.OR = [
                    { createdAt: { gt: new Date(cursor.value) } },
                    {
                        createdAt: new Date(cursor.value),
                        id: { gt: cursor.id }
                    }
                ];
            } else if (sortBy === "priceAsc") {
                where.OR = [
                    { productPrice: { gt: new Prisma.Decimal(cursor.value) } },
                    {
                        productPrice: new Prisma.Decimal(cursor.value),
                        id: { gt: cursor.id }
                    }
                ];
            } else if (sortBy === "priceDesc") {
                where.OR = [
                    { productPrice: { lt: new Prisma.Decimal(cursor.value) } },
                    {
                        productPrice: new Prisma.Decimal(cursor.value),
                        id: { lt: cursor.id }
                    }
                ];
            }
        }

        const activeProducts = await prisma.product.findMany({
            where,
            take: parsedLimit + 1,
            // skip: cursor ? 1 : 0,
            // cursor: cursor ? { id: cursor } : undefined,
            orderBy
        });

        const hasNext = activeProducts.length > parsedLimit;

        if (hasNext) {
            activeProducts.pop();
        }

        const lastProduct = activeProducts[activeProducts.length - 1];
        let nextCursor: ProductCursor | null = null;

        if (hasNext && lastProduct) {
            nextCursor = {
                value: sortBy === "priceAsc" || sortBy === "priceDesc" ? lastProduct.productPrice.toString() : lastProduct.createdAt.toISOString(),
                id: lastProduct.id
            };
        }

        return {
            products: activeProducts,
            nextCursor,
            hasNext
        };
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