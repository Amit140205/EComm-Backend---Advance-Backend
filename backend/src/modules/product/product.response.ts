export type ProductResponseDTO = {
    id: string,
    productName: string,
    productDescription: string,
    productImageUrls: string[],
    productPrice: string,
    stock: string,
    isActive: boolean
    createdAt: Date,
    updatedAt: Date
}