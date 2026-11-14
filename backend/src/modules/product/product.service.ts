import { Prisma, Product } from "../../../generated/prisma/index.js";
import { AppError } from "../../utils/app.error.js";
import { IFileService } from "../services/file/file.interface.js";
import { IProductRepository } from "./product.interface.js";
import { toProductListResponse, toProductResponse } from "./product.mapper.js";
import { ProductResponseDTO } from "./product.response.js";
import { CreateProductDTO } from "./product.schema.js";

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

        return {
            product: toProductResponse(newProduct)
        };
    }

    async getProductsByCategoryId(categoryId: string): Promise<{
        products: ProductResponseDTO[]
    }> {
        const products = await this.productRepo.getProductsByCategoryId(categoryId);

        return {
            products: toProductListResponse(products)
        };
    }
}