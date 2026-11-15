import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { addressService } from "./address.container.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const createAddressController = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;
    const result = await addressService.createAddress(user?.id as string, req.body);

    sendResponse(res, 201, {
        success: true,
        message: "Address created successfully",
        data: result
    });
});

export const getAddressesByUserIdController = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;
    const result = await addressService.getAddressesByUserId(user?.id as string);

    sendResponse(res, 200, {
        success: true,
        message: "All addresses fetched successfully",
        data: result
    });
});

export const updateAddressController = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { user } = req;

    const result = await addressService.updateAddress(id as string, user?.id as string, req.body);

    sendResponse(res, 200, {
        success: true,
        message: "Address updated successfully",
        data: result
    });
});

export const deleteAddressController = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { user } = req;

    await addressService.deleteAddress(id as string, user?.id as string);

    sendResponse(res, 200, {
        success: true,
        message: "Address deleted successfully"
    });
});