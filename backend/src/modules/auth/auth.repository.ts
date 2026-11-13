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

    async findUserById(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        });

        return user;
    }

    // Refresh Token
    async createRefreshToken(data: { token: string, userId: string, expiredAt: Date; }): Promise<RefreshToken> {
        const refreshToken = await prisma.refreshToken.create({
            data
        });

        return refreshToken;
    }

    async findRefreshToken(token: string): Promise<RefreshToken | null> {
        const refreshToken = await prisma.refreshToken.findUnique({
            where: {
                token
            }
        });

        return refreshToken;
    }

    async deleteRefreshTokenById(id: string): Promise<void> {
        await prisma.refreshToken.delete({
            where: {
                id
            }
        });
    }

    async deleteRefreshTokenByUserId(userId: string): Promise<void> {
        await prisma.refreshToken.deleteMany({
            where: {
                userId
            }
        });
    }
}