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

const router = express.Router();

router.route("/create-product")
    .post(verifyUser, verifySeller, upload.array("images", 5), validate(createProductSchema), createProductController);

router.route("/category/:categoryId")
    .get(getProductsByCategoryIdController);

router.route("/all-products")
    .get(verifyUser, verifyAdmin, getAllProductsController);

router.route("/update-product/:id")
    .patch(verifyUser, verifySeller, validate(updateProductSchema), updateProductController);

router.route("/delete-product/:id")
    .delete(verifyUser, verifySeller, deleteProductController);

router.route("/toggle-is-active/:id")
    .patch(verifyUser, verifySeller, toggleIsActiveController);

router.route("/all-active-products")
    .get(getAllActiveProductsController);

export default router;