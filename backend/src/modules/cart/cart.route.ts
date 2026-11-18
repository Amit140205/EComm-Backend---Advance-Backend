import express from "express";
import { verifyUser } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { addToCartSchema, updateCartItemSchema } from "./cart.schema.js";
import { addToCartController, clearCartController, getCartWithItemsController, removeCartItemController, updateCartItemQuantityController } from "./cart.controller.js";

const router = express.Router();

router.route("/add-to-cart")
    .post(verifyUser, validate(addToCartSchema), addToCartController);

router.route("/get-cart-items")
    .get(verifyUser, getCartWithItemsController);

router.route("/update-cart-item/:id")
    .patch(verifyUser, validate(updateCartItemSchema), updateCartItemQuantityController);

router.route("/remove-cart-item/:id")
    .delete(verifyUser, removeCartItemController);

router.route("/clear-cart")
    .delete(verifyUser, clearCartController);

export default router;