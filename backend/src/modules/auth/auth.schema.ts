import { email, z } from "zod";

export const registerUserSchema = z.object({
    firstName: z.string().min(1, "First name cannot be empty"),
    lastName: z.string().optional(),
    email: z.email(),
    password: z.string().min(6, "Password must be atleast 6 characters long"),
    role: z.enum(["USER", "SELLER", "ADMIN"]).optional(),
    phoneNo: z.string()
        .min(10, { message: 'Must be a valid mobile number' })
        .max(14, { message: 'Must be a valid mobile number' }),
}).strict();

export const loginUserSchema = z.object({
    email: z.email(),
    password: z.string()
}).strict();

export const logoutUserSchema = z.object({
    refreshToken: z.string()
}).strict();

export const refreshTokenSchema = z.object({
    refreshToken: z.string()
}).strict();

export type RegisterUserDTO = z.infer<typeof registerUserSchema>;
export type LoginUserDTO = z.infer<typeof loginUserSchema>;
export type LogoutUserDTO = z.infer<typeof logoutUserSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;