import { Router } from "express";
import { reserveStock } from "../services/inventory";
import { requestPayment } from "../services/payment";
import { confirmOrder } from "../services/order";
import { sendOrderNotification } from "../services/notification";

const router = Router();

// POST /checkout — buyer clicks "결제하기" in the cart screen
router.post("/checkout", async (req, res) => {
  const { cartId, paymentMethod } = req.body;

  const reservation = await reserveStock(cartId);
  if (!reservation.ok) {
    return res.status(409).json({ error: "OUT_OF_STOCK", items: reservation.missing });
  }

  const payment = await requestPayment(cartId, paymentMethod);
  if (payment.status === "DECLINED") {
    await reservation.release();
    return res.status(402).json({ error: "PAYMENT_DECLINED", retryUrl: "/checkout/retry" });
  }

  const order = await confirmOrder(cartId, payment.transactionId);
  await sendOrderNotification(order.id);

  return res.status(201).json({ orderId: order.id });
});

export default router;
