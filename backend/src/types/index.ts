export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

export interface IJWTPayload {
    user: {
        id: string;
        email: string;
        role: string;
    };
}