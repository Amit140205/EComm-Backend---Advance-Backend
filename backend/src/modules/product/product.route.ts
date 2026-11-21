import express from "express";
import { verifyAdmin, verifySeller, verifyUser } from "../../middlewares/auth.middleware.js";
import { createProductSchema, updateProductSchema } from "./product.schema.js";
import {
    createProductController,
    deleteProductController,
    getAllActiveProductsController,
    getAllProductsController,
    getProductsByCategoryIdController,
    toggleIsActiveController,
    updateProductController
} from "./product.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { productLimiter, userLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.route("/create-product")
    .post(productLimiter, verifyUser, verifySeller, upload.array("images", 5), validate(createProductSchema), createProductController);

router.route("/category/:categoryId")
    .get(getProductsByCategoryIdController);

router.route("/all-products")
    .get(verifyUser, userLimiter, verifyAdmin, getAllProductsController);

router.route("/update-product/:id")
    .patch(productLimiter, verifyUser, verifySeller, validate(updateProductSchema), updateProductController);

router.route("/delete-product/:id")
    .delete(productLimiter, verifyUser, verifySeller, deleteProductController);

router.route("/toggle-is-active/:id")
    .patch(productLimiter, verifyUser, verifySeller, toggleIsActiveController);

// implementing filtering & sorting
// filtering => categoryId, minPrice, maxPrice  
// sorting =>  latest, priceAsc, priceDesc
router.route("/all-active-products")
    .get(getAllActiveProductsController);

export default router;