import jwt, { SignOptions } from "jsonwebtoken";
import {
    JWT_ACCESS_TOKEN_EXPIRY,
    JWT_ACCESS_TOKEN_SECRET,
    JWT_REFRESH_TOKEN_EXPIRY,
    JWT_REFRESH_TOKEN_SECRET
} from "../config/config.js";
import { IJWTPayload } from "../types/index.js";
import crypto from "crypto";

export const generateAccessToken = (payload: IJWTPayload) => {
    return jwt.sign(
        payload,
        JWT_ACCESS_TOKEN_SECRET as string,
        { expiresIn: JWT_ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"] }
    );
};

export const generateRefreshToken = (payload: IJWTPayload) => {
    return jwt.sign(
        payload,
        JWT_REFRESH_TOKEN_SECRET as string,
        { expiresIn: JWT_REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"] }
    );
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, JWT_ACCESS_TOKEN_SECRET as string);
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, JWT_REFRESH_TOKEN_SECRET as string);
};

export const hashRefreshToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};