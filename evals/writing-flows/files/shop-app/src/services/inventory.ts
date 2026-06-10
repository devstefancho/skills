import { db } from "../lib/db";

export async function reserveStock(cartId: string) {
  const items = await db.cartItems(cartId);
  const missing = items.filter((i) => i.stock < i.quantity);
  if (missing.length > 0) {
    return { ok: false as const, missing: missing.map((i) => i.sku) };
  }
  const reservationId = await db.reserve(items);
  return {
    ok: true as const,
    release: () => db.releaseReservation(reservationId),
  };
}
