import { Response } from "express";
import { ApiResponse } from "../types/index.js";

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    payLoad: ApiResponse<T>
) => {
    return res.status(statusCode).json(payLoad);
};