import { Prisma, Product } from "../../../generated/prisma/index.js";
import { redis } from "../../lib/redis.js";
import { IFileService } from "../../services/file/file.interface.js";
import { ProductCursor, ProductQueryOptions } from "../../types/index.js";
import { AppError } from "../../utils/app.error.js";
import { invalidateProductCache } from "../../utils/cache.helper.js";
import { IProductRepository } from "./product.interface.js";
import { toProductListResponse, toProductResponse } from "./product.mapper.js";
import { ProductResponseDTO } from "./product.response.js";
import { CreateProductDTO, UpdateProductDTO } from "./product.schema.js";

export class ProductService {
    constructor(private productRepo: IProductRepository, private fileService: IFileService) { };

    async createProduct(data: CreateProductDTO, userId: string, files: Express.Multer.File[]): Promise<{
        product: ProductResponseDTO;
    }> {
        if (!files || files.length === 0) {
            throw new AppError(400, "Atleast one product image is required");
        }

        const imageUrls = await Promise.all(
            files.map((file) => this.fileService.upload(file.buffer))
        );

        const newProduct = await this.productRepo.createProduct({
            userId,
            categoryId: data.categoryId,
            productName: data.productName,
            productDescription: data.productDescription,
            productImageUrls: imageUrls,
            productPrice: new Prisma.Decimal(data.productPrice),
            stock: Number(data.stock)
        });

        await invalidateProductCache();

        return {
            product: toProductResponse(newProduct)
        };
    }

    async getProductsByCategoryId(categoryId: string, limit: number, cursor?: string): Promise<{
        products: ProductResponseDTO[];
    }> {
        const products = await this.productRepo.getProductsByCategoryId(categoryId, limit, cursor);

        return {
            products: toProductListResponse(products)
        };
    }

    async getAllProducts(limit: number, cursor?: string): Promise<{
        products: ProductResponseDTO[];
    }> {
        const products = await this.productRepo.getAllProducts(limit, cursor);

        return {
            products: toProductListResponse(products)
        };
    }

    async updateProduct(data: UpdateProductDTO, id: string, sellerId: string): Promise<{
        product: ProductResponseDTO;
    }> {
        const existingProduct = await this.productRepo.getProductByIdAndSellerId(id, sellerId);

        if (!existingProduct) {
            throw new AppError(401, "Product not found or you are not authorized to perform this action");
        }

        const { productName, productDescription, productPrice, stock } = data;

        const updatedProduct = await this.productRepo.updateProductById(
            {
                productName: productName !== undefined ? productName : undefined,
                productDescription: productDescription !== undefined ? productDescription : undefined,
                productPrice: productPrice !== undefined ? new Prisma.Decimal(productPrice) : undefined,
                stock: stock !== undefined ? Number(stock) : undefined
            },
            id,
            sellerId
        );

        await invalidateProductCache();

        return {
            product: toProductResponse(updatedProduct)
        };
    }

    async deleteProduct(id: string, sellerId: string): Promise<void> {
        const existingProduct = await this.productRepo.getProductByIdAndSellerId(id, sellerId);

        if (!existingProduct) {
            throw new AppError(401, "Product not found or you are not authorized to perform this action");
        }

        const files = existingProduct.productImageUrls;

        await Promise.all(
            files.map((file) => this.fileService.delete(file))
        );

        await this.productRepo.deleteProductByIdAndSellerId(id, sellerId);

        await invalidateProductCache();
    }

    async toggleIsActive(id: string, sellerId: string): Promise<{
        product: ProductResponseDTO;
    }> {
        const existingProduct = await this.productRepo.getProductByIdAndSellerId(id, sellerId);

        if (!existingProduct) {
            throw new AppError(401, "Product not found or you are not authorized to perform this action");
        }

        const updatedProduct = await this.productRepo.toggleIsActive(id, sellerId, existingProduct.isActive);

        await invalidateProductCache();

        return {
            product: toProductResponse(updatedProduct)
        };
    }

    async getAllActiveProducts(filters: ProductQueryOptions): Promise<{
        products: ProductResponseDTO[],
        nextCursor: ProductCursor | null,
        hasNext: boolean;
    }> {

        // caching logic

        // normalizing filters
        // without this, Redis treat the given example as two different keys
        // example: products:{"sortBy":"priceAsc","limit":"5"} | products:{"limit":"5","sortBy":"priceAsc"} 
        // Problem: Duplicate keys for same value
        const entries = Object.entries(filters);
        entries.sort(([a], [b]) => a.localeCompare(b));
        const normalizedFilters = Object.fromEntries(entries);

        const cacheKey = `products:${JSON.stringify(normalizedFilters)}`;
        // example = products:{"sortBy":"priceAsc","limit":"5","cursor":{"value":"1200","id":"abc"}}

        const cachedProducts = await redis.get(cacheKey);

        if (cachedProducts) {
            console.log("Cache HIT");
            return JSON.parse(cachedProducts);
        }

        console.log("Cache MISS");

        const { products, nextCursor, hasNext } = await this.productRepo.getAllActiveProducts(normalizedFilters);

        const formattedResult = {
            products: toProductListResponse(products),
            nextCursor,
            hasNext
        };

        await redis.set(
            cacheKey,
            JSON.stringify(formattedResult),
            "EX",
            300
        );

        return formattedResult;
    }
}