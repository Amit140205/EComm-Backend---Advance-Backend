import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { authService } from "./auth.container.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { clearCookies, setCookies } from "../../utils/cookie.helper.js";

export const registerUserController = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.registerUser(req.body);

    setCookies(res, result.accessToken, result.refreshToken);

    sendResponse(res, 201, {
        success: true,
        message: "Account created successfully",
        data: result
    });
});

export const loginUserController = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.loginUser(req.body);

    setCookies(res, result.accessToken, result.refreshToken);

    sendResponse(res, 200, {
        success: true,
        message: "User logged in successfully",
        data: result
    });
});

export const getCurrentUserController = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;
    const result = await authService.getCurrentUser(user?.id as string);

    sendResponse(res, 200, {
        success: true,
        message: "User details fetched successfully",
        data: result
    });
});

export const logoutController = catchAsync(async (req: Request, res: Response) => {
    await authService.logout(req.body);

    clearCookies(res);

    sendResponse(res, 200, {
        success: true,
        message: "User logged out successfully"
    });
});

export const logoutAllController = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;
    await authService.logoutAll(user?.id as string);

    clearCookies(res);

    sendResponse(res, 200, {
        success: true,
        message: "User logged out of all devices successfully"
    });
});

export const refreshTokenController = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.refreshToken(req.body);

    setCookies(res, result.accessToken, result.refreshToken);

    sendResponse(res, 200, {
        success: true,
        message: "Token refreshed successfully",
        data: result
    });
});