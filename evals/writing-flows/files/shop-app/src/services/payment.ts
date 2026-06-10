import { pgClient } from "../lib/pg-client";

export async function requestPayment(cartId: string, method: string) {
  // Calls the external PG (payment gateway). Times out after 10s → treated as DECLINED.
  try {
    const result = await pgClient.charge({ cartId, method, timeoutMs: 10_000 });
    return { status: result.approved ? "APPROVED" : "DECLINED", transactionId: result.txId };
  } catch (e) {
    return { status: "DECLINED", transactionId: null };
  }
}
