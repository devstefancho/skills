import { db } from "../lib/db";

export async function confirmOrder(cartId: string, transactionId: string) {
  const order = await db.createOrder(cartId, transactionId);
  await db.clearCart(cartId);
  return order;
}
