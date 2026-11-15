import express from "express";
import { verifyAdmin, verifyUser } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createOrderSchema, updateOrderStatusSchema } from "./order.schema.js";
import { 
    cancelOrderController,
    createOrderController,
    getUserOrdersController,
    updateOrderStatusController
 } from "./order.controller.js";

const router = express.Router();

router.route("/create-order")
    .post(verifyUser, validate(createOrderSchema), createOrderController);

router.route("/user-orders")
    .get(verifyUser, getUserOrdersController);

router.route("/update-order-status/:id")
    .patch(verifyUser, verifyAdmin, validate(updateOrderStatusSchema), updateOrderStatusController);

router.route("/cancel-order/:id")
    .post(verifyUser, cancelOrderController);

export default router;