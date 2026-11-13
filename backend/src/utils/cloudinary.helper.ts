import cloudinary from "../lib/cloudinary.js";
import { AppError } from "./app.error.js";

export const uploadToCloudinary = async (fileBuffer: Buffer) => {
    return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "products",
                resource_type: "image"
            },
            (error, result) => {
                if (error || !result?.secure_url) {
                    console.log("Cloudinary upload error: ", error);
                    return reject(new AppError(500, "Failed to upload image"));
                }

                resolve(result?.secure_url);
            }
        );

        stream.end(fileBuffer);
    });
};

export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
    try {
        const parts = imageUrl.split("/");
        const fileName = parts[parts.length - 1];
        const publicId = `products/${fileName.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.log("Cloudinary delete error: ", error);
        throw new AppError(500, "Failed to delete image");
    }
};