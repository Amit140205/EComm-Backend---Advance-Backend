import { Product } from "../../../generated/prisma/index.js";

export interface IProductRepository {
    createProduct(
        data: {
            userId: string;
            categoryId: string;
            productName: string;
            productDescription: string;
            productImageUrls: string[];
            productPrice: any,
            stock: number
        }
    ): Promise<Product>;
}