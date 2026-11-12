import { RefreshToken, Role, User } from "../../../generated/prisma/index.js";

export interface IAuthRepository {
    // User
    createUser(data: {
        firstName: string,
        lastName?: string,
        email: string,
        password: string,
        phoneNo: string,
        role?: Role;
    }): Promise<User>;
    findUserByEmail(email: string): Promise<User | null>;

    // Refresh Token
    createRefreshToken(date: { token: string, userId: string, expiredAt: Date; }): Promise<RefreshToken>;
}