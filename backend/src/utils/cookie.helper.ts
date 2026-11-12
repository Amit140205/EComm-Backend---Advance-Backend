import { Response } from "express";
import { NODE_ENV } from "../config/config.js";

export const setCookies = (res: Response, accessToken: string, refreshToken: string) => {
    res.cookie("acceessToken", accessToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    });
};

export const destroyCookies = (res: Response) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "lax"
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "lax"
    });
};