export type UserResponseDTO = {
    id: string,
    firstName: string,
    lastName: string | null,
    email: string,
    phoneNo: string,
    role: string,
    createdAt: Date,
    updatedAt: Date
};

export type AuthResponseDTO = {
    user: UserResponseDTO,
    accessToken: string,
    refreshToken: string
};