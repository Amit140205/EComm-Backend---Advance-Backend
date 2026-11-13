import { CloudinaryService } from "../services/file/cloudinary.service.js";
import { ProductRepository } from "./product.repository.js";
import { ProductService } from "./product.service.js";

const productRepository = new ProductRepository();
const fileService = new CloudinaryService();
export const productService = new ProductService(productRepository, fileService);