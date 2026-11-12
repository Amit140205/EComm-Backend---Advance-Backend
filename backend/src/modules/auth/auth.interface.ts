import { Role, User } from "../../../generated/prisma/index.js";

export interface IAuthRepository {
    createUser(data: {
        firstName: string,
        lastName?: string,
        email: string,
        password: string,
        phoneNo: string,
        role?: Role
    }): Promise<User>;
    findUserByEmail(email: string): Promise<User | null>;
}