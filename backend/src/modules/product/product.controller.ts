import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { productService } from "./product.container.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const createProductController = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const result = await productService.createProduct(req.body, userId as string, req.files as Express.Multer.File[]);

    sendResponse(res, 201, {
        success: true,
        message: "Product created successfully",
        data: result
    });
});

export const getProductsByCategoryIdController = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const { limit, cursor } = req.query;

    const parsedLimit = limit ? parseInt(limit as string) : 5;

    const result = await productService.getProductsByCategoryId(categoryId as string, parsedLimit, cursor as string);

    sendResponse(res, 200, {
        success: true,
        message: "Products fetched successfully",
        data: result
    });
});

export const getAllProductsController = catchAsync(async (req: Request, res: Response) => {
    const { limit, cursor } = req.query;
    const parsedLimit = limit ? parseInt(limit as string) : 5;

    const result = await productService.getAllProducts(parsedLimit, cursor as string);

    sendResponse(res, 200, {
        success: true,
        message: "Products fetched successfully",
        data: result
    });
});

export const updateProductController = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const sellerId = req.user?.id;
    const result = await productService.updateProduct(req.body, id as string, sellerId as string);

    sendResponse(res, 200, {
        success: true,
        message: "Product updated successfully",
        data: result
    });
});

export const deleteProductController = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const sellerId = req.user?.id;

    await productService.deleteProduct(id as string, sellerId as string);

    sendResponse(res, 200, {
        success: true,
        message: "Product deleted successfully"
    });
});

export const toggleIsActiveController = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const sellerId = req.user?.id;

    const result = await productService.toggleIsActive(id as string, sellerId as string);

    sendResponse(res, 200, {
        success: true,
        message: "Product's active status toggled successfully",
        data: result
    });
});

export const getAllActiveProductsController = catchAsync(async (req: Request, res: Response) => {
    const { limit, cursor } = req.query;
    const parsedLimit = limit ? parseInt(limit as string) : 5;

    const result = await productService.getAllActiveProducts(parsedLimit, cursor as string);

    sendResponse(res, 200, {
        success: true,
        message: "Products fetched successfully",
        data: result
    });
});