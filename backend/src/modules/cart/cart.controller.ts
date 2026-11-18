import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { cartService } from "./cart.container.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const addToCartController = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;
    const result = await cartService.addToCart(user?.id as string, req.body);

    sendResponse(res, 201, {
        success: true,
        message: "Item added to cart successfully",
        data: result
    });
});

export const getCartWithItemsController = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;

    const result = await cartService.getCartWithItems(user?.id as string);

    sendResponse(res, 200, {
        success: true,
        message: "Cart items fetched successfully",
        data: result
    });
});

export const updateCartItemQuantityController = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { user } = req;

    const result = await cartService.updateCartItem(user?.id as string, id as string, req.body);

    sendResponse(res, 200, {
        success: true,
        message: "Cart item quantity updated successfully",
        data: result
    });
});

export const removeCartItemController = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { user } = req;

    await cartService.removeCartItem(user?.id as string, id as string);

    sendResponse(res, 200, {
        success: true,
        message: "Cart item removed successfully"
    })
});

export const clearCartController = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;

    await cartService.clearCart(user?.id as string);

    sendResponse(res, 200, {
        success: true,
        message: "Cart cleared successfully"
    })
})