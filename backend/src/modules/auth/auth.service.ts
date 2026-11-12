import { IAuthRepository } from "./auth.interface.js";
import { RegisterUserDTO } from "./auth.schema.js";
import { AppError } from "../../utils/app.error.js";
import { hashPassword } from "../../utils/auth.helper.js";
import { toUserResponse } from "./auth.mapper.js";

export class AuthService {
    constructor(private authRepo: IAuthRepository) { }

    async registerUser(data: RegisterUserDTO) {
        const { firstName, lastName, email, password, phoneNo, role } = data;
        const existingUser = await this.authRepo.findUserByEmail(email);

        if (existingUser) {
            throw new AppError(400, "User with this email already exists");
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await this.authRepo.createUser({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNo,
            role
        });

        return {
            user: toUserResponse(newUser)
        };
    }
}