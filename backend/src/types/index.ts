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
};

export type ProductQueryOptions = {
    limit?: string;
    cursor?: ProductCursor;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: "latest" | "oldest" | "priceAsc" | "priceDesc";
};

export type ProductCursor = {
    value: string,
    id: string;
};

export type CategoryQueryOptions = {
    limit?: string,
    cursor?: string;
};