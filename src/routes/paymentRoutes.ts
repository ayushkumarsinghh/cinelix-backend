import { Router } from "express";
import { createOrderController, verifyPaymentController, handleWebhookController } from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// POST /api/payment/create-order (Protected)
router.post("/create-order", authMiddleware, createOrderController);

// POST /api/payment/verify (Protected)
router.post("/verify", authMiddleware, verifyPaymentController);

// POST /api/payment/webhook (Public - Verified via signature)
router.post("/webhook", handleWebhookController);

export default router;
