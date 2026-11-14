import { Prisma, Product } from "../../../generated/prisma/index.js";
import { UpdateProductDTO } from "./product.schema.js";

export interface IProductRepository {
    createProduct(
        data: {
            userId: string;
            categoryId: string;
            productName: string;
            productDescription: string;
            productImageUrls: string[];
            productPrice: Prisma.Decimal,
            stock: number;
        }
    ): Promise<Product>;

    getProductsByCategoryId(categoryId: string, limit: number, cursor?: string): Promise<Product[]>;

    getAllProducts(limit: number, cursor?: string): Promise<Product[]>;

    updateProductById(data: {
        productName?: string;
        productDescription?: string;
        productPrice?: Prisma.Decimal,
        stock?: number;
    },
        id: string,
        sellerId: string): Promise<Product>;

    getProductByIdAndSellerId(id: string, sellerId: string): Promise<Product | null>;

    deleteProductByIdAndSellerId(id: string, sellerId: string): Promise<void>;

    toggleIsActive(id: string, sellerId: string, isActive: boolean): Promise<Product>;

    getAllActiveProducts(limit: number, cursor?: string): Promise<Product[]>;
}