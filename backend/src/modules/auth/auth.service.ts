import { IAuthRepository } from "./auth.interface.js";
import { LoginUserDTO, RegisterUserDTO } from "./auth.schema.js";
import { AppError } from "../../utils/app.error.js";
import { toJwtPayload, toUserResponse } from "./auth.mapper.js";
import { comparePassword, hashPassword } from "../../utils/password.helper.js";
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from "../../utils/jwt.helper.js";
import { AuthResponseDTO } from "./auth.response.js";

export class AuthService {
    constructor(private authRepo: IAuthRepository) { }

    async registerUser(data: RegisterUserDTO): Promise<AuthResponseDTO> {
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

        const jwtPayload = toJwtPayload(newUser);
        const accessToken = generateAccessToken(jwtPayload);
        const refreshToken = generateRefreshToken(jwtPayload);

        const hashedRefreshToken = hashRefreshToken(refreshToken);

        await this.authRepo.createRefreshToken({
            token: hashedRefreshToken,
            userId: newUser.id,
            expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        return {
            user: toUserResponse(newUser),
            accessToken,
            refreshToken
        };
    }

    async loginUser(data: LoginUserDTO): Promise<AuthResponseDTO> {
        const { email, password } = data;

        const existingUser = await this.authRepo.findUserByEmail(email);

        if (!existingUser) {
            throw new AppError(401, "Invalid credentials");
        }

        const isPassword = await comparePassword(password, existingUser.password);

        if (!isPassword) {
            throw new AppError(401, "Invalid credentials");
        }

        const jwtPayload = toJwtPayload(existingUser);
        const accessToken = generateAccessToken(jwtPayload);
        const refreshToken = generateRefreshToken(jwtPayload);

        const hashedRefreshToken = hashRefreshToken(refreshToken);

        await this.authRepo.createRefreshToken({
            token: hashedRefreshToken,
            userId: existingUser.id,
            expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        return {
            user: toUserResponse(existingUser),
            accessToken,
            refreshToken
        };
    }
}