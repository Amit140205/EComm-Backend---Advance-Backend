import { Redis } from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "../config/config.js";

export const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null
});

redis.on("connect", () => {
    console.log("Redis connected successfully");
});

redis.on("error", (error) => {
    console.log(`Redis error: ${error}`);
});

