import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import RedisStore, { type RedisReply } from "rate-limit-redis";
import { redis } from "../lib/redis.js";

// approach: IP based Fixed Window Rate Limiting

export const globalLimiter = rateLimit({
    // max 100 requests per 15 mins per IP
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // max 100 requests per 15 mins

    message: {
        success: false,
        message: "GlobalLimiterMessage: Too many requests. Please try again later."
    },

    standardHeaders: true,
    legacyHeaders: false,

    store: new RedisStore({
        prefix: "global:",
        sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as Promise<RedisReply>
    })
});

export const authLimiter = rateLimit({
    // max 5 requests per 10 mins per IP
    windowMs: 10 * 60 * 1000,
    max: 5,

    message: {
        success: false,
        message: "AuthLimiterMessage: Too many authentication attempts"
    },

    standardHeaders: true,
    legacyHeaders: false,

    store: new RedisStore({
        prefix: "auth:",
        sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as Promise<RedisReply>
    })
});

export const productLimiter = rateLimit({
    // max 5 requests per 1 min per IP
    windowMs: 1 * 60 * 1000,
    max: 5,

    message: {
        success: false,
        message: "ProductLimiterMessage: Too many requests. Please try again later."
    },

    standardHeaders: true,
    legacyHeaders: false,

    store: new RedisStore({
        prefix: "product:",
        sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as Promise<RedisReply>
    })
});


// approach: User ID based Fixed Window Rate Limiting

export const userLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    // max: 200,
    // dynamic rate limiting
    max: (req) => {
        if (req.user?.role === "ADMIN") return 10;
        else return 4;
    },

    message: {
        success: false,
        message: "UserLimiterMessage: Rate Limit exceeded for this account."
    },

    standardHeaders: true,
    legacyHeaders: false,

    // key generator
    keyGenerator: (req) => {
        return req.user?.id || ipKeyGenerator(req.ip || "");
    },

    store: new RedisStore({
        prefix: "user:",
        sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as Promise<RedisReply>
    })
});