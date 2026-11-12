import { RefreshToken, Role, User } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { IAuthRepository } from "./auth.interface.js";

export class AuthRepository implements IAuthRepository {
    // User
    async createUser(data: {
        firstName: string,
        lastName?: string,
        email: string,
        password: string,
        phoneNo: string,
        role?: Role;
    }): Promise<User> {
        const user = await prisma.user.create({
            data
        });

        return user;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        return user;
    }

    // Refresh Token
    async createRefreshToken(data: {token: string, userId: string, expiredAt: Date}): Promise<RefreshToken> {
        const refreshToken = await prisma.refreshToken.create({
            data
        });

        return refreshToken;
    }
}