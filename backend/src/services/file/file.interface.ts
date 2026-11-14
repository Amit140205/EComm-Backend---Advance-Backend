export interface IFileService {
    upload(fileBuffer: Buffer): Promise<string>;
    delete(imageUrl: string): Promise<void>;
}