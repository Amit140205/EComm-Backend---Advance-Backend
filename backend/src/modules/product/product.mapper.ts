import { Product } from "../../../generated/prisma/index.js";
import { ProductResponseDTO } from "./product.response.js";

export const toProductResponse = (product: Product): ProductResponseDTO => {
    return {
        id: product.id,
        productName: product.productName,
        productDescription: product.productDescription,
        productImageUrls: product.productImageUrls,
        productPrice: product.productPrice.toString(),
        stock: product.stock.toString(),
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
    }
};

export const toProductListResponse = (products: Product[]): ProductResponseDTO[] => {
    return products.map((product: Product) => toProductResponse(product));
}