import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { orderService } from "./order.container.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const createOrderController = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;
    const result = await orderService.createOrder(user?.id as string, req.body);

    sendResponse(res, 201, {
        success: true,
        message: "Order created successfully",
        data: result
    });
});

export const getUserOrdersController = catchAsync(async (req: Request, res: Response) => {
    const { limit, cursor } = req.query;
    const parsedLimit = limit ? parseInt(limit as string) : 5;
    const { user } = req;
    const result = await orderService.getUserOrders(user?.id as string, parsedLimit, cursor as string);

    sendResponse(res, 200, {
        success: true,
        message: "Orders fetched successfully",
        data: result
    });
});

export const updateOrderStatusController = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await orderService.updateOrderStatus(id as string, req.body);

    sendResponse(res, 200, {
        success: true,
        message: "Order status updated successfully",
        data: result
    });
});

export const cancelOrderController = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { user } = req;
    const result = await orderService.cancelOrder(id as string, user?.id as string);

    sendResponse(res, 200, {
        success: true,
        message: "Order cancelled successfully",
        data: result
    });
});