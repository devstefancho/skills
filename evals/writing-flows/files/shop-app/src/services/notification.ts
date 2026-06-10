import { pushQueue } from "../lib/queue";

export async function sendOrderNotification(orderId: string) {
  // Fire-and-forget: enqueue only, the worker delivers the push/email.
  await pushQueue.enqueue({ type: "ORDER_CONFIRMED", orderId });
}
