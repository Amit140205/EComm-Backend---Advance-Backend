export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

export type IJWTPayload = {
    user: {
        id: string;
        email: string;
        role: string;
    };
}

export type ProductQueryOptions = {
    limit?: string,
    cursor?: string
    categoryId?: string,
    minPrice?: string,
    maxPrice?: string,
    sortBy?: string
}