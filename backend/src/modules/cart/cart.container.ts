import { productRepository } from "../product/product.container.js";
import { CartRepository } from "./cart.repository.js";
import { CartService } from "./cart.service.js";

const cartRepository = new CartRepository();
export const cartService = new CartService(cartRepository, productRepository);