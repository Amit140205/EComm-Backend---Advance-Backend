import { deleteFromCloudinary, uploadToCloudinary } from "../../utils/cloudinary.helper.js";
import { IFileService } from "./file.interface.js";

export class CloudinaryService implements IFileService {
    async upload(fileBuffer: Buffer): Promise<string> {
        return await uploadToCloudinary(fileBuffer);
    }

    async delete(imageUrl: string): Promise<void> {
        return await deleteFromCloudinary(imageUrl);
    }
}