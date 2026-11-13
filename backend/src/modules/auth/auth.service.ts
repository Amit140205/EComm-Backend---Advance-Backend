import { IAuthRepository } from "./auth.interface.js";
import { LoginUserDTO, LogoutUserDTO, RefreshTokenDTO, RegisterUserDTO } from "./auth.schema.js";
import { AppError } from "../../utils/app.error.js";
import { toJwtPayload, toUserResponse } from "./auth.mapper.js";
import { comparePassword, hashPassword } from "../../utils/password.helper.js";
import { generateAccessToken, generateRefreshToken, hashRefreshToken, verifyRefreshToken } from "../../utils/jwt.helper.js";
import { AuthResponseDTO, UserResponseDTO } from "./auth.response.js";
import { IJWTPayload } from "../../types/index.js";

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

    async getCurrentUser(userId: string): Promise<{
        user: UserResponseDTO;
    }> {
        const user = await this.authRepo.findUserById(userId);

        if (!user) {
            throw new AppError(404, "User not found");
        }

        return {
            user: toUserResponse(user)
        };
    }

    async logout(data: LogoutUserDTO): Promise<void> {
        const hashedRefreshToken = hashRefreshToken(data.refreshToken);

        const existingToken = await this.authRepo.findRefreshToken(hashedRefreshToken);

        if (!existingToken) {
            throw new AppError(404, "Invalid refresh token");
        }

        await this.authRepo.deleteRefreshTokenById(existingToken.id);
    }

    async logoutAll(userId: string): Promise<void> {
        await this.authRepo.deleteRefreshTokenByUserId(userId);
    }

    async refreshToken(data: RefreshTokenDTO): Promise<{
        accessToken: string,
        refreshToken: string;
    }> {
        const { refreshToken } = data;
        let decoded;

        try {
            decoded = verifyRefreshToken(refreshToken) as IJWTPayload;
        } catch (error) {
            throw new AppError(401, "Invalid or expired token");
        }

        const user = await this.authRepo.findUserById(decoded.user.id);
        if (!user) {
            throw new AppError(404, "User not found");
        }

        const hashedRefreshToken = hashRefreshToken(refreshToken);
        const existingToken = await this.authRepo.findRefreshToken(hashedRefreshToken);

        if (!existingToken) {
            throw new AppError(403, "Refresh token not found");
        }

        await this.authRepo.deleteRefreshTokenById(existingToken.id);

        const newJWTPayload = toJwtPayload(user);
        const newAccessToken = generateAccessToken(newJWTPayload);
        const newRefreshToken = generateRefreshToken(newJWTPayload);

        const hashedNewRefreshToken = hashRefreshToken(newRefreshToken);

        await this.authRepo.createRefreshToken({
            token: hashedNewRefreshToken,
            userId: decoded.user.id,
            expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }
}