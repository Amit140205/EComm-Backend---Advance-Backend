import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app.error.js";
import { verifyAccessToken } from "../utils/jwt.helper.js";
import { IJWTPayload } from "../types/index.js";

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new AppError(401, "Unauthorized request");
        }

        const decoded = verifyAccessToken(token) as IJWTPayload;
        // decoded = { user: { id: string, email: string, role: string} } 

        req.user = decoded.user;

        next();
    } catch (error) {
        next(error instanceof AppError ? error : new AppError(401, "Invalid or expired token"));
    }
};

export const verifySeller = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user?.role !== "SELLER") {
        throw new AppError(403, "You are not authorized");
    }

    next();
};

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user?.role !== "ADMIN") {
        throw new AppError(403, "You are not authorized");
    }

    next();
};