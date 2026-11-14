import express from "express";
import { verifySeller, verifyUser } from "../../middlewares/auth.middleware.js";
import { createProductSchema } from "./product.schema.js";
import { createProductController, getProductsByCategoryIdController } from "./product.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";

const router = express.Router();

router.route("/create-product")
    .post(verifyUser, verifySeller, upload.array("images", 5), validate(createProductSchema), createProductController);

router.route("/category/:categoryId")
    .get(getProductsByCategoryIdController);

export default router;