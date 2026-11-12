import { User } from "../../../generated/prisma/index.js";
import { UserResponseDTO } from "./auth.response.js";

export const toUserResponse = (user: User): UserResponseDTO => {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNo: user.phoneNo,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
}