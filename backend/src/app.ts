import express, { Request, Response } from "express";
import cors from "cors";
import { FRONTEND_URL } from "./config/config.js";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

export const app = express();

// why??
// app.set("trust proxy", 1) tells Express to trust the first proxy server sitting between our client and our backend
// Without proper proxy configuration, Express might identify
// the proxy's IP address instead of the actual client's IP address.
// only in production, if using NGINX, AWS etc etc

// app.set("trust-proxy", 1); // 1 means Trust one proxy hop

app.use(globalLimiter); // global rate limiter ( max 100 requests per 15 mins per user )

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(cookieParser());
app.set("query parser", "extended");

app.get("/health-check", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Api is working fine"
    });
});


import authRouter from "./modules/auth/auth.route.js";
import categoryRouter from "./modules/category/category.route.js";
import productRouter from "./modules/product/product.route.js";
import orderRouter from "./modules/order/order.route.js";
import addressRouter from "./modules/address/address.route.js";
import cartRouter from "./modules/cart/cart.route.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/cart", cartRouter);

app.use(globalErrorHandler);
