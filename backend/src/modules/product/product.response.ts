export type ProductResponseDTO = {
    id: string,
    productName: string,
    productDescription: string,
    productImageUrls: string[],
    productPrice: any,
    stock: number,
    createdAt: Date,
    updatedAt: Date
}